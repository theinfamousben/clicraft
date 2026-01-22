import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import version from '../helpers/getv.js';
import { writeGameSettings, loadDefaultGameSettings } from '../helpers/config.js';
import { 
    fetchJson, 
    downloadFile, 
    loadConfig, 
    saveConfig, 
    paginatedSelect 
} from '../helpers/utils.js';
import { downloadMod } from '../helpers/modrinth.js';
import {
    fetchMinecraftVersions,
    getVersionManifest,
    fetchFabricLoaderVersions,
    fetchFabricGameVersions,
    fetchFabricProfile,
    fetchFabricInstallerVersions,
    fetchForgeVersions,
    fetchForgeGameVersions,
    downloadLibraries,
    downloadAssets
} from '../helpers/minecraft.js';
import { FORGE_MAVEN } from '../helpers/constants.js';

const execAsync = promisify(exec);

// ============================================
// Fabric Installation
// ============================================

async function installFabricClient(instancePath, mcVersion, loaderVersion) {
    console.log(chalk.cyan('\n📥 Installing Fabric client...\n'));

    const versionsPath = path.join(instancePath, 'versions');
    const versionId = `fabric-loader-${loaderVersion}-${mcVersion}`;
    const versionPath = path.join(versionsPath, versionId);
    fs.mkdirSync(versionPath, { recursive: true });

    // Get vanilla version data
    console.log(chalk.gray('   Fetching Minecraft version data...'));
    const vanillaData = await getVersionManifest(mcVersion);

    // Download vanilla client jar
    const vanillaVersionPath = path.join(versionsPath, mcVersion);
    fs.mkdirSync(vanillaVersionPath, { recursive: true });

    const clientJarPath = path.join(vanillaVersionPath, `${mcVersion}.jar`);
    if (!fs.existsSync(clientJarPath)) {
        console.log(chalk.gray('   Downloading Minecraft client...'));
        await downloadFile(vanillaData.downloads.client.url, clientJarPath, 'Minecraft client');
    }

    // Save vanilla version JSON
    fs.writeFileSync(
        path.join(vanillaVersionPath, `${mcVersion}.json`),
        JSON.stringify(vanillaData, null, 2)
    );

    // Get Fabric profile
    console.log(chalk.gray('   Fetching Fabric profile...'));
    const fabricProfile = await fetchFabricProfile(mcVersion, loaderVersion);

    // Save Fabric version JSON
    fs.writeFileSync(
        path.join(versionPath, `${versionId}.json`),
        JSON.stringify(fabricProfile, null, 2)
    );

    // Download libraries
    console.log(chalk.gray('   Downloading vanilla libraries...'));
    await downloadLibraries(vanillaData, instancePath);

    console.log(chalk.gray('   Downloading Fabric libraries...'));
    await downloadLibraries(fabricProfile, instancePath);

    // Download assets
    console.log(chalk.gray('   Downloading assets (this may take a while)...'));
    await downloadAssets(vanillaData, instancePath);

    // Create launch script
    createClientLaunchScript(instancePath, versionId);

    return versionId;
}

async function installFabricServer(instancePath, mcVersion, loaderVersion) {
    console.log(chalk.cyan('\n📥 Installing Fabric server...\n'));

    const installerVersions = await fetchFabricInstallerVersions();
    const installerVersion = installerVersions[0].version;

    const serverJarPath = path.join(instancePath, 'fabric-server-launch.jar');
    const serverUrl = `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}/${loaderVersion}/${installerVersion}/server/jar`;

    console.log(chalk.gray('   Downloading Fabric server launcher...'));
    await downloadFile(serverUrl, serverJarPath, 'Fabric server');

    fs.writeFileSync(path.join(instancePath, 'eula.txt'), 'eula=true\n');
    createServerStartScript(instancePath, 'fabric-server-launch.jar');

    console.log(chalk.gray('   Server will download remaining files on first launch.'));
}

// ============================================
// Forge Installation
// ============================================

async function installForgeClient(instancePath, mcVersion, forgeVersion) {
    console.log(chalk.cyan('\n📥 Installing Forge client...\n'));

    const versionsPath = path.join(instancePath, 'versions');
    fs.mkdirSync(versionsPath, { recursive: true });

    console.log(chalk.gray('   Fetching Minecraft version data...'));
    const vanillaData = await getVersionManifest(mcVersion);

    const vanillaVersionPath = path.join(versionsPath, mcVersion);
    fs.mkdirSync(vanillaVersionPath, { recursive: true });

    const clientJarPath = path.join(vanillaVersionPath, `${mcVersion}.jar`);
    if (!fs.existsSync(clientJarPath)) {
        console.log(chalk.gray('   Downloading Minecraft client...'));
        await downloadFile(vanillaData.downloads.client.url, clientJarPath, 'Minecraft client');
    }

    fs.writeFileSync(
        path.join(vanillaVersionPath, `${mcVersion}.json`),
        JSON.stringify(vanillaData, null, 2)
    );

    console.log(chalk.gray('   Downloading vanilla libraries...'));
    await downloadLibraries(vanillaData, instancePath);

    console.log(chalk.gray('   Downloading assets (this may take a while)...'));
    await downloadAssets(vanillaData, instancePath);

    // Download Forge installer
    const installerPath = path.join(instancePath, 'forge-installer.jar');
    const forgeFullVersion = `${mcVersion}-${forgeVersion}`;
    const forgeInstallerUrl = `${FORGE_MAVEN}/net/minecraftforge/forge/${forgeFullVersion}/forge-${forgeFullVersion}-installer.jar`;

    console.log(chalk.gray('   Downloading Forge installer...'));
    try {
        await downloadFile(forgeInstallerUrl, installerPath, 'Forge installer');
    } catch (err) {
        console.log(chalk.yellow(`   Warning: Could not download Forge installer.`));
        console.log(chalk.gray(`   URL: ${forgeInstallerUrl}`));
        return `${mcVersion}-forge-${forgeVersion}`;
    }

    console.log(chalk.gray('   Running Forge installer (this may take a while)...'));
    try {
        await execAsync(`java -jar "${installerPath}" --installClient "${instancePath}"`, {
            cwd: instancePath,
            timeout: 300000
        });
        console.log(chalk.green('   Forge installed successfully!'));
    } catch (err) {
        console.log(chalk.yellow('   Note: Forge installer requires Java. Run manually:'));
        console.log(chalk.gray(`   java -jar "${installerPath}" --installClient`));
    }

    createClientLaunchScript(instancePath, `${mcVersion}-forge-${forgeVersion}`);

    return `${mcVersion}-forge-${forgeVersion}`;
}

async function installForgeServer(instancePath, mcVersion, forgeVersion) {
    console.log(chalk.cyan('\n📥 Installing Forge server...\n'));

    const forgeFullVersion = `${mcVersion}-${forgeVersion}`;
    const installerPath = path.join(instancePath, 'forge-installer.jar');
    const forgeInstallerUrl = `${FORGE_MAVEN}/net/minecraftforge/forge/${forgeFullVersion}/forge-${forgeFullVersion}-installer.jar`;

    console.log(chalk.gray('   Downloading Forge installer...'));
    try {
        await downloadFile(forgeInstallerUrl, installerPath, 'Forge installer');
    } catch (err) {
        console.log(chalk.yellow(`   Warning: Could not download Forge installer.`));
        return;
    }

    console.log(chalk.gray('   Running Forge installer (this may take a while)...'));
    try {
        await execAsync(`java -jar "${installerPath}" --installServer`, {
            cwd: instancePath,
            timeout: 300000
        });
        console.log(chalk.green('   Forge server installed successfully!'));

        const files = fs.readdirSync(instancePath);
        const serverJar = files.find(f => f.includes('forge') && f.endsWith('.jar') && !f.includes('installer'));
        if (serverJar) {
            createServerStartScript(instancePath, serverJar);
        }
    } catch (err) {
        console.log(chalk.yellow('   Note: Forge installer requires Java. Run manually:'));
        console.log(chalk.gray(`   cd "${instancePath}" && java -jar forge-installer.jar --installServer`));
    }

    fs.writeFileSync(path.join(instancePath, 'eula.txt'), 'eula=true\n');
}

// ============================================
// Launch Script Creation
// ============================================

function createClientLaunchScript(instancePath, versionId) {
    const isWindows = process.platform === 'win32';
    const scriptName = isWindows ? 'launch.bat' : 'launch.sh';
    const scriptPath = path.join(instancePath, scriptName);

    let script;
    if (isWindows) {
        script = `@echo off
cd /d "%~dp0"
echo Starting ${versionId}...
clicraft launch --instance "%~dp0"
if %ERRORLEVEL% neq 0 (
    echo.
    echo If clicraft is not installed globally, run:
    echo   npx clicraft launch --instance "%~dp0"
    pause
)
`;
    } else {
        script = `#!/bin/bash
cd "$(dirname "$0")"
echo "Starting ${versionId}..."
clicraft launch --instance "$(pwd)" || {
    echo ""
    echo "If clicraft is not installed globally, run:"
    echo "  npx clicraft launch --instance \\"$(pwd)\\""
}
`;
    }

    fs.writeFileSync(scriptPath, script);
    if (!isWindows) {
        fs.chmodSync(scriptPath, '755');
    }
}

function createServerStartScript(instancePath, serverJar) {
    const isWindows = process.platform === 'win32';
    const scriptName = isWindows ? 'start.bat' : 'start.sh';
    const scriptPath = path.join(instancePath, scriptName);

    let script;
    if (isWindows) {
        script = `@echo off
cd /d "%~dp0"
java -Xmx2G -Xms1G -jar ${serverJar} nogui
pause
`;
    } else {
        script = `#!/bin/bash
cd "$(dirname "$0")"
java -Xmx2G -Xms1G -jar ${serverJar} nogui
`;
    }

    fs.writeFileSync(scriptPath, script);
    if (!isWindows) {
        fs.chmodSync(scriptPath, '755');
    }
}

// ============================================
// Instance Installation
// ============================================

async function installModLoader(instancePath, type, loader, mcVersion, loaderVersion) {
    const isClient = type === 'client';
    const isFabric = loader === 'fabric';

    if (isFabric) {
        if (isClient) {
            return await installFabricClient(instancePath, mcVersion, loaderVersion);
        } else {
            await installFabricServer(instancePath, mcVersion, loaderVersion);
            return `fabric-server-${mcVersion}`;
        }
    } else {
        if (isClient) {
            return await installForgeClient(instancePath, mcVersion, loaderVersion);
        } else {
            await installForgeServer(instancePath, mcVersion, loaderVersion);
            return `forge-server-${mcVersion}`;
        }
    }
}

// ============================================
// Create from Config
// ============================================

async function createFromConfig(existingConfig, options) {
    console.log(chalk.cyan(`\n🎮 Creating instance from mcconfig.json\n`));
    console.log(chalk.gray(`   Name: ${existingConfig.name}`));
    console.log(chalk.gray(`   Type: ${existingConfig.type}`));
    console.log(chalk.gray(`   Mod Loader: ${existingConfig.modLoader}`));
    console.log(chalk.gray(`   Minecraft: ${existingConfig.minecraftVersion}`));
    console.log(chalk.gray(`   Loader Version: ${existingConfig.loaderVersion}`));
    if (existingConfig.mods?.length > 0) {
        console.log(chalk.gray(`   Mods: ${existingConfig.mods.length}`));
    }

    const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Create instance from this configuration?',
        default: true
    }]);

    if (!confirm) {
        console.log(chalk.yellow('\nInstance creation cancelled.'));
        return;
    }

    const { instanceName } = await inquirer.prompt([{
        type: 'input',
        name: 'instanceName',
        message: 'Instance Name:',
        default: existingConfig.name,
        validate: (input) => {
            if (!input.trim()) return 'Instance name is required';
            if (fs.existsSync(input.trim())) return 'A folder with this name already exists';
            return true;
        }
    }]);

    const instancePath = path.resolve(instanceName.trim());
    fs.mkdirSync(instancePath, { recursive: true });
    fs.mkdirSync(path.join(instancePath, 'mods'), { recursive: true });

    const versionId = await installModLoader(
        instancePath,
        existingConfig.type,
        existingConfig.modLoader,
        existingConfig.minecraftVersion,
        existingConfig.loaderVersion
    );

    const newConfig = {
        configVersion: version,
        name: instanceName.trim(),
        type: existingConfig.type,
        modLoader: existingConfig.modLoader,
        minecraftVersion: existingConfig.minecraftVersion,
        loaderVersion: existingConfig.loaderVersion,
        versionId: versionId,
        createdAt: new Date().toISOString(),
        mods: []
    };

    // Install mods
    if (existingConfig.mods?.length > 0) {
        console.log(chalk.cyan('\n📦 Installing mods from configuration...\n'));
        const modsPath = path.join(instancePath, 'mods');

        for (const mod of existingConfig.mods) {
            console.log(chalk.gray(`   Installing ${mod.name}...`));
            try {
                const installedMod = await downloadMod(
                    mod.projectId,
                    existingConfig.minecraftVersion,
                    existingConfig.modLoader,
                    modsPath
                );

                if (installedMod) {
                    newConfig.mods.push(installedMod);
                    console.log(chalk.green(`   ✓ ${mod.name} installed`));
                } else {
                    console.log(chalk.yellow(`   ⚠ Could not find compatible version for ${mod.name}`));
                }
            } catch (err) {
                console.log(chalk.yellow(`   ⚠ Failed to install ${mod.name}: ${err.message}`));
            }
        }
    }

    // Apply game settings
    if (existingConfig.type === 'client' && existingConfig.gameSettings && Object.keys(existingConfig.gameSettings).length > 0) {
        console.log(chalk.cyan('\n⚙️  Applying game settings...'));
        writeGameSettings(instancePath, existingConfig.gameSettings);
        newConfig.gameSettings = existingConfig.gameSettings;
        console.log(chalk.gray(`   Applied ${Object.keys(existingConfig.gameSettings).length} settings`));
    }

    saveConfig(instancePath, newConfig);

    console.log(chalk.green(`\n✅ Instance "${instanceName}" created successfully!`));
    console.log(chalk.gray(`   Location: ${instancePath}`));
    if (newConfig.mods.length > 0) {
        console.log(chalk.gray(`   Mods installed: ${newConfig.mods.length}/${existingConfig.mods.length}`));
    }
    if (existingConfig.type === 'client') {
        console.log(chalk.gray(`   Use this folder as game directory in your Minecraft launcher`));
    } else {
        console.log(chalk.gray(`   Start the server with: ./start.sh (or start.bat on Windows)`));
    }
}

// ============================================
// Main Create Command
// ============================================

export async function createInstance(options) {
    // Check for existing config
    const existingConfig = loadConfig(process.cwd());
    if (existingConfig) {
        console.log(chalk.cyan('\n📋 Found mcconfig.json in current directory'));
        return await createFromConfig(existingConfig, options);
    }

    console.log(chalk.cyan('\n🎮 Create a new Minecraft instance\n'));

    try {
        const { instanceName } = await inquirer.prompt([{
            type: 'input',
            name: 'instanceName',
            message: 'Instance Name:',
            validate: (input) => {
                if (!input.trim()) return 'Instance name is required';
                if (fs.existsSync(input.trim())) return 'A folder with this name already exists';
                return true;
            }
        }]);

        const { instanceType } = await inquirer.prompt([{
            type: 'rawlist',
            name: 'instanceType',
            message: 'Client or Server:',
            choices: ['Client', 'Server']
        }]);

        const { modLoader } = await inquirer.prompt([{
            type: 'rawlist',
            name: 'modLoader',
            message: 'Mod Loader:',
            choices: ['Fabric', 'Forge']
        }]);

        console.log(chalk.gray('Fetching available Minecraft versions...'));
        const availableVersions = modLoader === 'Fabric' 
            ? await fetchFabricGameVersions() 
            : await fetchForgeGameVersions();

        const mcVersion = await paginatedSelect('Minecraft Version:', availableVersions);

        console.log(chalk.gray(`Fetching available ${modLoader} versions...`));
        let loaderVersion;
        if (modLoader === 'Fabric') {
            const fabricVersions = await fetchFabricLoaderVersions();
            loaderVersion = await paginatedSelect('Fabric Loader Version:', fabricVersions);
        } else {
            const forgeVersions = await fetchForgeVersions(mcVersion);
            if (forgeVersions.length === 0) {
                console.log(chalk.yellow(`No Forge versions found for Minecraft ${mcVersion}`));
                return;
            }
            const forgeChoices = forgeVersions.map(v => ({
                name: `${v.label} (${v.version})`,
                value: v.version
            }));
            loaderVersion = await paginatedSelect('Forge Version:', forgeChoices);
        }

        const instancePath = path.resolve(instanceName.trim());
        fs.mkdirSync(instancePath, { recursive: true });
        fs.mkdirSync(path.join(instancePath, 'mods'), { recursive: true });

        const isClient = instanceType === 'Client';
        const versionId = await installModLoader(
            instancePath,
            instanceType.toLowerCase(),
            modLoader.toLowerCase(),
            mcVersion,
            loaderVersion
        );

        const config = {
            configVersion: version,
            name: instanceName.trim(),
            type: instanceType.toLowerCase(),
            modLoader: modLoader.toLowerCase(),
            minecraftVersion: mcVersion,
            loaderVersion: loaderVersion,
            versionId: versionId,
            createdAt: new Date().toISOString(),
            mods: []
        };

        saveConfig(instancePath, config);

        // Apply default game settings for clients
        if (isClient) {
            const defaultGameSettings = loadDefaultGameSettings();
            if (defaultGameSettings && Object.keys(defaultGameSettings).length > 0) {
                console.log(chalk.cyan('\n⚙️  Applying default game settings...'));
                writeGameSettings(instancePath, defaultGameSettings);
                console.log(chalk.gray(`   Applied ${Object.keys(defaultGameSettings).length} settings`));
            }
        }

        console.log(chalk.green(`\n✅ Instance "${instanceName}" created successfully!`));
        console.log(chalk.gray(`   Location: ${instancePath}`));
        if (isClient) {
            console.log(chalk.gray(`   Use this folder as game directory in your Minecraft launcher`));
        } else {
            console.log(chalk.gray(`   Start the server with: ./start.sh (or start.bat on Windows)`));
        }

    } catch (error) {
        if (error.name === 'ExitPromptError') {
            console.log(chalk.yellow('\nInstance creation cancelled.'));
            return;
        }
        console.error(chalk.red('Error creating instance:'), error.message);
        if (options?.verbose) {
            console.error(error);
        }
    }
}

export default { createInstance };
