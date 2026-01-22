import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';
import { loadAuth, refreshAuth } from './auth.js';
import { captureGameSettings } from '../commands/config.js';
import { loadSettings } from '../helpers/config.js';

// Load mcconfig.json
function loadConfig(instancePath) {
    const configPath = path.join(instancePath, 'mcconfig.json');
    if (!fs.existsSync(configPath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

// Find Java executable
function findJava() {
    const javaHome = process.env.JAVA_HOME;
    if (javaHome) {
        const javaBin = path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
        if (fs.existsSync(javaBin)) {
            return javaBin;
        }
    }
    return 'java'; // Assume it's in PATH
}

// Get classpath separator
function getClasspathSeparator() {
    return process.platform === 'win32' ? ';' : ':';
}

// Convert Maven coordinate to path
// e.g., "org.ow2.asm:asm:9.9" -> "org/ow2/asm/asm/9.9/asm-9.9.jar"
function mavenToPath(name) {
    const parts = name.split(':');
    if (parts.length < 3) return null;
    
    const [group, artifact, version] = parts;
    const classifier = parts.length > 3 ? `-${parts[3]}` : '';
    const groupPath = group.replace(/\./g, '/');
    
    return `${groupPath}/${artifact}/${version}/${artifact}-${version}${classifier}.jar`;
}

// Build classpath from libraries
function buildClasspath(instancePath, versionData) {
    const sep = getClasspathSeparator();
    const librariesPath = path.join(instancePath, 'libraries');
    const classpath = [];

    for (const lib of versionData.libraries || []) {
        // Check OS rules
        if (lib.rules) {
            let dominated = false;
            for (const rule of lib.rules) {
                if (rule.os && rule.os.name) {
                    const osName = process.platform === 'darwin' ? 'osx' : 
                                   process.platform === 'win32' ? 'windows' : 'linux';
                    if (rule.action === 'allow' && rule.os.name === osName) {
                        dominated = true;
                        break;
                    }
                } else if (rule.action === 'allow') {
                    dominated = true;
                    break;
                }
            }
            if (!dominated) continue;
        }

        let libPath = null;
        
        // Format 1: downloads.artifact (vanilla Minecraft)
        if (lib.downloads?.artifact) {
            libPath = path.join(librariesPath, lib.downloads.artifact.path);
        }
        // Format 2: name with Maven coordinates (Fabric/Forge)
        else if (lib.name) {
            const relativePath = mavenToPath(lib.name);
            if (relativePath) {
                libPath = path.join(librariesPath, relativePath);
            }
        }
        
        if (libPath && fs.existsSync(libPath)) {
            classpath.push(libPath);
        }
    }

    return classpath.join(sep);
}

// Replace argument variables
function replaceArgVariables(arg, variables) {
    let result = arg;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }
    return result;
}

// Parse arguments from version JSON
function parseArguments(args, variables) {
    const result = [];
    
    for (const arg of args) {
        if (typeof arg === 'string') {
            result.push(replaceArgVariables(arg, variables));
        } else if (typeof arg === 'object') {
            // Check rules
            let allowed = true;
            if (arg.rules) {
                allowed = arg.rules.some(rule => {
                    if (rule.os && rule.os.name) {
                        const osName = process.platform === 'darwin' ? 'osx' : 
                                       process.platform === 'win32' ? 'windows' : 'linux';
                        return rule.action === 'allow' && rule.os.name === osName;
                    }
                    if (rule.features) {
                        // Skip feature-specific rules for now
                        return false;
                    }
                    return rule.action === 'allow';
                });
            }
            
            if (allowed && arg.value) {
                const values = Array.isArray(arg.value) ? arg.value : [arg.value];
                for (const v of values) {
                    result.push(replaceArgVariables(v, variables));
                }
            }
        }
    }
    
    return result;
}

export async function launchInstance(options) {
    const settings = loadSettings();
    const instancePath = options.instance ? path.resolve(options.instance) : process.cwd();
    
    if (settings.autoLoadConfigOnLaunch) {
        // Load game settings from mcconfig.json and apply to options.txt
        const config = loadConfig(instancePath);
        const optionsTxtPath = path.join(instancePath, 'options.txt');
        if (config && config.gameSettings) {
            const gameSettings = config.gameSettings;
            // Write to options.txt
            const { writeGameSettings } = await import('../helpers/config.js');
            writeGameSettings(instancePath, gameSettings);
            if (options.verbose) {
                console.log(chalk.gray('Applied saved game settings to options.txt'));
            }
        }
    }

    // Load instance config
    const config = loadConfig(instancePath);
    if (!config) {
        console.log(chalk.red('Error: No mcconfig.json found.'));
        console.log(chalk.gray('Make sure you are in a Minecraft instance directory or use --instance <path>'));
        return;
    }

    if (config.type === 'server') {
        console.log(chalk.red('Error: This is a server instance. Use ./start.sh to start the server.'));
        return;
    }

    console.log(chalk.cyan(`\n🎮 Launching ${config.name}...\n`));

    try {
        // Get authentication
        let auth = null;
        if (!options.offline) {
            auth = await refreshAuth();
            if (!auth) {
                console.log(chalk.yellow('Not logged in. Use "clicraft login" to authenticate.'));
                console.log(chalk.gray('Or use --offline to play offline (if available).'));
                return;
            }
            console.log(chalk.gray(`Logged in as: ${auth.username}`));
        } else {
            console.log(chalk.yellow('Launching in offline mode...'));
            auth = {
                uuid: '00000000-0000-0000-0000-000000000000'.replace(/-/g, ''),
                username: 'Player',
                accessToken: 'offline'
            };
        }

        // Find version JSON
        const versionId = config.versionId;
        let versionJsonPath;
        let versionData;

        // Try Fabric/Forge version first
        const fabricVersionPath = path.join(instancePath, 'versions', versionId, `${versionId}.json`);
        const vanillaVersionPath = path.join(instancePath, 'versions', config.minecraftVersion, `${config.minecraftVersion}.json`);

        if (fs.existsSync(fabricVersionPath)) {
            versionData = JSON.parse(fs.readFileSync(fabricVersionPath, 'utf-8'));
            
            // Fabric/Forge may inherit from vanilla
            if (versionData.inheritsFrom) {
                const parentData = JSON.parse(fs.readFileSync(vanillaVersionPath, 'utf-8'));
                // Merge libraries
                versionData.libraries = [...(versionData.libraries || []), ...(parentData.libraries || [])];
                // Use parent's asset info
                versionData.assetIndex = versionData.assetIndex || parentData.assetIndex;
                versionData.assets = versionData.assets || parentData.assets;
                // Merge arguments
                if (parentData.arguments) {
                    versionData.arguments = versionData.arguments || {};
                    versionData.arguments.jvm = [...(parentData.arguments?.jvm || []), ...(versionData.arguments?.jvm || [])];
                    versionData.arguments.game = [...(versionData.arguments?.game || []), ...(parentData.arguments?.game || [])];
                }
            }
        } else if (fs.existsSync(vanillaVersionPath)) {
            versionData = JSON.parse(fs.readFileSync(vanillaVersionPath, 'utf-8'));
        } else {
            console.log(chalk.red('Error: Version data not found.'));
            console.log(chalk.gray(`Expected: ${fabricVersionPath}`));
            return;
        }

        // Find client JAR
        const clientJarPath = path.join(instancePath, 'versions', config.minecraftVersion, `${config.minecraftVersion}.jar`);
        if (!fs.existsSync(clientJarPath)) {
            console.log(chalk.red('Error: Minecraft client JAR not found.'));
            return;
        }

        // Build classpath
        const sep = getClasspathSeparator();
        const classpath = buildClasspath(instancePath, versionData) + sep + clientJarPath;

        // Set up variables for argument replacement
        const nativesPath = path.join(instancePath, 'natives');
        fs.mkdirSync(nativesPath, { recursive: true });

        const variables = {
            'auth_player_name': auth.username,
            'auth_uuid': auth.uuid,
            'auth_access_token': auth.accessToken,
            'auth_xuid': '',
            'user_type': 'msa',
            'version_name': versionId,
            'version_type': 'release',
            'game_directory': instancePath,
            'assets_root': path.join(instancePath, 'assets'),
            'assets_index_name': versionData.assets || versionData.assetIndex?.id || config.minecraftVersion,
            'natives_directory': nativesPath,
            'launcher_name': 'clicraft',
            'launcher_version': '0.1.0',
            'classpath': classpath,
            'clientid': '',
            'user_properties': '{}',
            'resolution_width': '854',
            'resolution_height': '480'
        };

        // Build JVM arguments
        const jvmArgs = [
            `-Djava.library.path=${nativesPath}`,
            '-Xmx2G',
            '-Xms512M',
            '-XX:+UnlockExperimentalVMOptions',
            '-XX:+UseG1GC',
            '-XX:G1NewSizePercent=20',
            '-XX:G1ReservePercent=20',
            '-XX:MaxGCPauseMillis=50',
            '-XX:G1HeapRegionSize=32M'
        ];

        // Add classpath
        jvmArgs.push('-cp', classpath);

        // Get main class
        const mainClass = versionData.mainClass;

        // Build game arguments
        let gameArgs = [];
        if (versionData.arguments?.game) {
            gameArgs = parseArguments(versionData.arguments.game, variables);
        } else if (versionData.minecraftArguments) {
            // Old format
            gameArgs = versionData.minecraftArguments.split(' ').map(arg => replaceArgVariables(arg, variables));
        }

        // Full command
        const java = findJava();
        const fullArgs = [...jvmArgs, mainClass, ...gameArgs];

        console.log(chalk.gray(`Java: ${java}`));
        console.log(chalk.gray(`Main class: ${mainClass}`));
        console.log(chalk.gray(`Game directory: ${instancePath}`));
        console.log();

        if (options.verbose) {
            console.log(chalk.gray('Full command:'));
            console.log(chalk.gray(`${java} ${fullArgs.join(' ')}`));
            console.log();
        }

        console.log(chalk.green('🚀 Starting Minecraft...\n'));

        // Launch Minecraft
        const minecraft = spawn(java, fullArgs, {
            cwd: instancePath,
            stdio: 'inherit',
            detached: false
        });

        minecraft.on('error', (err) => {
            console.error(chalk.red('Failed to start Minecraft:'), err.message);
        });

        minecraft.on('close', (code) => {
            if (settings.autoSaveToConfig){
                captureGameSettings({ instance: instancePath, verbose: options.verbose }, settings.autoSaveToConfig );
            }

            if (code === 0) {
                console.log(chalk.green('\nMinecraft closed normally.'));
            } else {
                console.log(chalk.yellow(`\nMinecraft exited with code ${code}`));
            }
        });

    } catch (error) {
        console.error(chalk.red('Error launching Minecraft:'), error.message);
        if (options.verbose) {
            console.error(error);
        }
    }
}

export default { launchInstance };
