import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// User agent for API requests
const USER_AGENT = 'mcpkg/0.1.0 (https://github.com/theinfamousben/mcpkg)';

// Download a file with progress indication
async function downloadFile(url, destPath, description) {
    const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const totalSize = parseInt(response.headers.get('content-length') || '0');
    let downloadedSize = 0;

    const fileStream = fs.createWriteStream(destPath);
    
    if (totalSize > 0) {
        const reader = response.body.getReader();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            downloadedSize += value.length;
            const percent = Math.round((downloadedSize / totalSize) * 100);
            process.stdout.write(`\r${chalk.gray(`   ${description}: ${percent}%`)}`);
            
            fileStream.write(Buffer.from(value));
        }
        process.stdout.write('\n');
        fileStream.end();
    } else {
        await pipeline(Readable.fromWeb(response.body), fileStream);
        console.log(chalk.gray(`   ${description}: Done`));
    }
}

// Fetch JSON from URL
async function fetchJson(url) {
    const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

// Fetch available Minecraft versions from Mojang API
async function fetchMinecraftVersions() {
    const data = await fetchJson('https://launchermeta.mojang.com/mc/game/version_manifest.json');
    return data.versions.filter(v => v.type === 'release');
}

// Fetch Fabric loader versions
async function fetchFabricLoaderVersions() {
    const data = await fetchJson('https://meta.fabricmc.net/v2/versions/loader');
    return data.map(v => v.version);
}

// Fetch Fabric game versions (to verify compatibility)
async function fetchFabricGameVersions() {
    const data = await fetchJson('https://meta.fabricmc.net/v2/versions/game');
    return data.filter(v => v.stable).map(v => v.version);
}

// Fetch Forge versions for a specific Minecraft version
async function fetchForgeVersions(mcVersion) {
    const data = await fetchJson('https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json');
    
    // Extract versions that match the Minecraft version
    const versions = [];
    for (const [key, value] of Object.entries(data.promos)) {
        if (key.startsWith(mcVersion)) {
            versions.push({ label: key, version: value });
        }
    }
    return versions;
}

// Fetch all available Forge Minecraft versions
async function fetchForgeGameVersions() {
    const data = await fetchJson('https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json');
    
    // Extract unique Minecraft versions from promo keys
    const mcVersions = new Set();
    for (const key of Object.keys(data.promos)) {
        const mcVersion = key.split('-')[0];
        mcVersions.add(mcVersion);
    }
    return Array.from(mcVersions).sort((a, b) => {
        // Sort by version number descending
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aVal = aParts[i] || 0;
            const bVal = bParts[i] || 0;
            if (aVal !== bVal) return bVal - aVal;
        }
        return 0;
    });
}

// Paginated selection prompt
const PAGE_SIZE = 10;
const NEXT_PAGE = '__NEXT_PAGE__';
const PREV_PAGE = '__PREV_PAGE__';

async function paginatedSelect(message, allChoices, getChoiceDisplay = (c) => c) {
    let currentPage = 0;
    const totalPages = Math.ceil(allChoices.length / PAGE_SIZE);

    while (true) {
        const startIdx = currentPage * PAGE_SIZE;
        const endIdx = Math.min(startIdx + PAGE_SIZE, allChoices.length);
        const pageChoices = allChoices.slice(startIdx, endIdx);

        // Build choices for this page
        const choices = pageChoices.map((choice, idx) => ({
            name: typeof choice === 'object' && choice.name ? choice.name : getChoiceDisplay(choice),
            value: typeof choice === 'object' && choice.value !== undefined ? choice.value : choice
        }));

        // Add navigation options
        if (currentPage > 0) {
            choices.push({ name: chalk.cyan('← Previous page'), value: PREV_PAGE });
        }
        if (currentPage < totalPages - 1) {
            choices.push({ name: chalk.cyan('→ Next page'), value: NEXT_PAGE });
        }

        const pageInfo = totalPages > 1 ? ` (page ${currentPage + 1}/${totalPages})` : '';
        
        const { selection } = await inquirer.prompt([
            {
                type: 'rawlist',
                name: 'selection',
                message: `${message}${pageInfo}`,
                choices: choices
            }
        ]);

        if (selection === NEXT_PAGE) {
            currentPage++;
            continue;
        } else if (selection === PREV_PAGE) {
            currentPage--;
            continue;
        }

        return selection;
    }
}

// Get Minecraft version manifest entry
async function getVersionManifest(mcVersion) {
    const manifest = await fetchJson('https://launchermeta.mojang.com/mc/game/version_manifest.json');
    const versionEntry = manifest.versions.find(v => v.id === mcVersion);
    if (!versionEntry) {
        throw new Error(`Minecraft version ${mcVersion} not found`);
    }
    return await fetchJson(versionEntry.url);
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

// Download and extract libraries for client
async function downloadLibraries(versionData, instancePath, isServer = false) {
    const librariesPath = path.join(instancePath, 'libraries');
    fs.mkdirSync(librariesPath, { recursive: true });

    const libraries = versionData.libraries || [];
    let downloadCount = 0;
    const totalLibraries = libraries.filter(lib => {
        // Check if library applies to current OS
        if (lib.rules) {
            const dominated = lib.rules.some(rule => {
                if (rule.os && rule.os.name) {
                    const osName = process.platform === 'darwin' ? 'osx' : 
                                   process.platform === 'win32' ? 'windows' : 'linux';
                    return rule.action === 'allow' && rule.os.name === osName;
                }
                return rule.action === 'allow';
            });
            if (!dominated) return false;
        }
        return true;
    }).length;

    for (const lib of libraries) {
        // Check OS rules
        if (lib.rules) {
            const dominated = lib.rules.some(rule => {
                if (rule.os && rule.os.name) {
                    const osName = process.platform === 'darwin' ? 'osx' : 
                                   process.platform === 'win32' ? 'windows' : 'linux';
                    return rule.action === 'allow' && rule.os.name === osName;
                }
                return rule.action === 'allow';
            });
            if (!dominated) continue;
        }

        let libPath = null;
        let downloadUrl = null;

        // Format 1: downloads.artifact (vanilla Minecraft)
        if (lib.downloads?.artifact) {
            const artifact = lib.downloads.artifact;
            libPath = path.join(librariesPath, artifact.path);
            downloadUrl = artifact.url;
        }
        // Format 2: name with Maven coordinates (Fabric/Forge)
        else if (lib.name && lib.url) {
            const relativePath = mavenToPath(lib.name);
            if (relativePath) {
                libPath = path.join(librariesPath, relativePath);
                // lib.url is the base Maven repo URL
                downloadUrl = lib.url + relativePath;
            }
        }
        // Format 3: name only (Fabric libraries from maven.fabricmc.net by default)
        else if (lib.name) {
            const relativePath = mavenToPath(lib.name);
            if (relativePath) {
                libPath = path.join(librariesPath, relativePath);
                downloadUrl = `https://maven.fabricmc.net/${relativePath}`;
            }
        }

        if (libPath && downloadUrl) {
            // Skip if already downloaded
            if (fs.existsSync(libPath)) {
                downloadCount++;
                continue;
            }

            fs.mkdirSync(path.dirname(libPath), { recursive: true });
            
            try {
                await downloadFile(downloadUrl, libPath, `Library ${++downloadCount}/${totalLibraries}`);
            } catch (err) {
                console.log(chalk.yellow(`   Warning: Failed to download ${lib.name}`));
            }
        }
    }
}

// Download assets for client
async function downloadAssets(versionData, instancePath) {
    const assetsPath = path.join(instancePath, 'assets');
    const indexesPath = path.join(assetsPath, 'indexes');
    const objectsPath = path.join(assetsPath, 'objects');
    
    fs.mkdirSync(indexesPath, { recursive: true });
    fs.mkdirSync(objectsPath, { recursive: true });

    // Download asset index
    const assetIndex = versionData.assetIndex;
    const indexPath = path.join(indexesPath, `${assetIndex.id}.json`);
    
    if (!fs.existsSync(indexPath)) {
        await downloadFile(assetIndex.url, indexPath, 'Asset index');
    }

    const assets = await fetchJson(assetIndex.url);
    const objects = Object.entries(assets.objects);
    
    console.log(chalk.gray(`   Downloading ${objects.length} assets...`));
    
    let downloaded = 0;
    for (const [name, obj] of objects) {
        const hash = obj.hash;
        const prefix = hash.substring(0, 2);
        const objectDir = path.join(objectsPath, prefix);
        const objectPath = path.join(objectDir, hash);

        if (fs.existsSync(objectPath)) {
            downloaded++;
            continue;
        }

        fs.mkdirSync(objectDir, { recursive: true });
        
        const url = `https://resources.download.minecraft.net/${prefix}/${hash}`;
        try {
            const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                fs.writeFileSync(objectPath, Buffer.from(buffer));
            }
        } catch (err) {
            // Skip failed assets
        }
        
        downloaded++;
        if (downloaded % 100 === 0) {
            process.stdout.write(`\r${chalk.gray(`   Assets: ${downloaded}/${objects.length}`)}`);
        }
    }
    process.stdout.write(`\r${chalk.gray(`   Assets: ${downloaded}/${objects.length}`)}\n`);
}

// Install Fabric client
async function installFabricClient(instancePath, mcVersion, loaderVersion) {
    console.log(chalk.cyan('\n📥 Installing Fabric client...\n'));

    // Create directories
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
    const vanillaJsonPath = path.join(vanillaVersionPath, `${mcVersion}.json`);
    fs.writeFileSync(vanillaJsonPath, JSON.stringify(vanillaData, null, 2));

    // Get Fabric profile
    console.log(chalk.gray('   Fetching Fabric profile...'));
    const fabricProfile = await fetchJson(
        `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}/${loaderVersion}/profile/json`
    );

    // Save Fabric version JSON
    const fabricJsonPath = path.join(versionPath, `${versionId}.json`);
    fs.writeFileSync(fabricJsonPath, JSON.stringify(fabricProfile, null, 2));

    // Download libraries
    console.log(chalk.gray('   Downloading vanilla libraries...'));
    await downloadLibraries(vanillaData, instancePath);

    console.log(chalk.gray('   Downloading Fabric libraries...'));
    await downloadLibraries(fabricProfile, instancePath);

    // Download assets
    console.log(chalk.gray('   Downloading assets (this may take a while)...'));
    await downloadAssets(vanillaData, instancePath);

    // Create launch script
    createClientLaunchScript(instancePath, fabricProfile, versionId, mcVersion);

    return versionId;
}

// Install Fabric server
async function installFabricServer(instancePath, mcVersion, loaderVersion) {
    console.log(chalk.cyan('\n📥 Installing Fabric server...\n'));

    // Get Fabric installer version
    const installerVersions = await fetchJson('https://meta.fabricmc.net/v2/versions/installer');
    const installerVersion = installerVersions[0].version;

    // Download Fabric server launcher
    const serverJarPath = path.join(instancePath, 'fabric-server-launch.jar');
    const serverUrl = `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}/${loaderVersion}/${installerVersion}/server/jar`;
    
    console.log(chalk.gray('   Downloading Fabric server launcher...'));
    await downloadFile(serverUrl, serverJarPath, 'Fabric server');

    // Create eula.txt
    fs.writeFileSync(path.join(instancePath, 'eula.txt'), 'eula=true\n');

    // Create start script
    createServerStartScript(instancePath, 'fabric-server-launch.jar');

    console.log(chalk.gray('   Server will download remaining files on first launch.'));
}

// Install Forge client
async function installForgeClient(instancePath, mcVersion, forgeVersion) {
    console.log(chalk.cyan('\n📥 Installing Forge client...\n'));

    // Create directories
    const versionsPath = path.join(instancePath, 'versions');
    fs.mkdirSync(versionsPath, { recursive: true });

    // Get vanilla version data and download
    console.log(chalk.gray('   Fetching Minecraft version data...'));
    const vanillaData = await getVersionManifest(mcVersion);

    const vanillaVersionPath = path.join(versionsPath, mcVersion);
    fs.mkdirSync(vanillaVersionPath, { recursive: true });

    const clientJarPath = path.join(vanillaVersionPath, `${mcVersion}.jar`);
    if (!fs.existsSync(clientJarPath)) {
        console.log(chalk.gray('   Downloading Minecraft client...'));
        await downloadFile(vanillaData.downloads.client.url, clientJarPath, 'Minecraft client');
    }

    // Save vanilla version JSON
    const vanillaJsonPath = path.join(vanillaVersionPath, `${mcVersion}.json`);
    fs.writeFileSync(vanillaJsonPath, JSON.stringify(vanillaData, null, 2));

    // Download vanilla libraries
    console.log(chalk.gray('   Downloading vanilla libraries...'));
    await downloadLibraries(vanillaData, instancePath);

    // Download assets
    console.log(chalk.gray('   Downloading assets (this may take a while)...'));
    await downloadAssets(vanillaData, instancePath);

    // Download Forge installer
    const installerPath = path.join(instancePath, 'forge-installer.jar');
    const forgeFullVersion = `${mcVersion}-${forgeVersion}`;
    const forgeInstallerUrl = `https://maven.minecraftforge.net/net/minecraftforge/forge/${forgeFullVersion}/forge-${forgeFullVersion}-installer.jar`;

    console.log(chalk.gray('   Downloading Forge installer...'));
    try {
        await downloadFile(forgeInstallerUrl, installerPath, 'Forge installer');
    } catch (err) {
        console.log(chalk.yellow(`   Warning: Could not download Forge installer. You may need to download it manually.`));
        console.log(chalk.gray(`   URL: ${forgeInstallerUrl}`));
        return `${mcVersion}-forge-${forgeVersion}`;
    }

    // Run Forge installer
    console.log(chalk.gray('   Running Forge installer (this may take a while)...'));
    try {
        await execAsync(`java -jar "${installerPath}" --installClient "${instancePath}"`, {
            cwd: instancePath,
            timeout: 300000 // 5 minute timeout
        });
        console.log(chalk.green('   Forge installed successfully!'));
    } catch (err) {
        console.log(chalk.yellow('   Note: Forge installer requires Java. You may need to run it manually:'));
        console.log(chalk.gray(`   java -jar "${installerPath}" --installClient`));
    }

    // Create launch script
    createClientLaunchScript(instancePath, vanillaData, `${mcVersion}-forge-${forgeVersion}`, mcVersion);

    return `${mcVersion}-forge-${forgeVersion}`;
}

// Install Forge server
async function installForgeServer(instancePath, mcVersion, forgeVersion) {
    console.log(chalk.cyan('\n📥 Installing Forge server...\n'));

    // Download Forge installer
    const forgeFullVersion = `${mcVersion}-${forgeVersion}`;
    const installerPath = path.join(instancePath, 'forge-installer.jar');
    const forgeInstallerUrl = `https://maven.minecraftforge.net/net/minecraftforge/forge/${forgeFullVersion}/forge-${forgeFullVersion}-installer.jar`;

    console.log(chalk.gray('   Downloading Forge installer...'));
    try {
        await downloadFile(forgeInstallerUrl, installerPath, 'Forge installer');
    } catch (err) {
        console.log(chalk.yellow(`   Warning: Could not download Forge installer.`));
        console.log(chalk.gray(`   URL: ${forgeInstallerUrl}`));
        return;
    }

    // Run Forge installer for server
    console.log(chalk.gray('   Running Forge installer (this may take a while)...'));
    try {
        await execAsync(`java -jar "${installerPath}" --installServer`, {
            cwd: instancePath,
            timeout: 300000 // 5 minute timeout
        });
        console.log(chalk.green('   Forge server installed successfully!'));
        
        // Find the generated server jar
        const files = fs.readdirSync(instancePath);
        const serverJar = files.find(f => f.includes('forge') && f.endsWith('.jar') && !f.includes('installer'));
        
        if (serverJar) {
            createServerStartScript(instancePath, serverJar);
        }
    } catch (err) {
        console.log(chalk.yellow('   Note: Forge installer requires Java. Run manually:'));
        console.log(chalk.gray(`   cd "${instancePath}" && java -jar forge-installer.jar --installServer`));
    }

    // Create eula.txt
    fs.writeFileSync(path.join(instancePath, 'eula.txt'), 'eula=true\n');
}

// Create client launch script
function createClientLaunchScript(instancePath, versionData, versionId, mcVersion) {
    const isWindows = process.platform === 'win32';
    const scriptName = isWindows ? 'launch.bat' : 'launch.sh';
    const scriptPath = path.join(instancePath, scriptName);
    
    let script;
    if (isWindows) {
        script = `@echo off
cd /d "%~dp0"
echo Starting ${versionId}...
mcpkg launch --instance "%~dp0"
if %ERRORLEVEL% neq 0 (
    echo.
    echo If mcpkg is not installed globally, run:
    echo   npx mcpkg launch --instance "%~dp0"
    pause
)
`;
    } else {
        script = `#!/bin/bash
cd "$(dirname "$0")"
echo "Starting ${versionId}..."
mcpkg launch --instance "$(pwd)" || {
    echo ""
    echo "If mcpkg is not installed globally, run:"
    echo "  npx mcpkg launch --instance \\"$(pwd)\\""
}
`;
    }

    fs.writeFileSync(scriptPath, script);
    if (!isWindows) {
        fs.chmodSync(scriptPath, '755');
    }
}

// Create server start script
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

export async function createInstance(options) {
    console.log(chalk.cyan('\n🎮 Create a new Minecraft instance\n'));

    try {
        // Step 1: Ask for instance name
        const { instanceName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'instanceName',
                message: 'Instance Name:',
                validate: (input) => {
                    if (!input.trim()) return 'Instance name is required';
                    if (fs.existsSync(input.trim())) return 'A folder with this name already exists';
                    return true;
                }
            }
        ]);

        // Step 2: Ask for Client or Server
        const { instanceType } = await inquirer.prompt([
            {
                type: 'rawlist',
                name: 'instanceType',
                message: 'Client or Server:',
                choices: ['Client', 'Server']
            }
        ]);

        // Step 3: Ask for Fabric or Forge
        const { modLoader } = await inquirer.prompt([
            {
                type: 'rawlist',
                name: 'modLoader',
                message: 'Mod Loader:',
                choices: ['Fabric', 'Forge']
            }
        ]);

        // Step 4: Fetch and ask for Minecraft version
        console.log(chalk.gray('Fetching available Minecraft versions...'));
        
        let availableVersions;
        if (modLoader === 'Fabric') {
            availableVersions = await fetchFabricGameVersions();
        } else {
            availableVersions = await fetchForgeGameVersions();
        }

        const mcVersion = await paginatedSelect('Minecraft Version:', availableVersions);

        // Step 5: Fetch and ask for loader version
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

        // Step 6: Create the instance folder
        const instancePath = path.resolve(instanceName.trim());
        fs.mkdirSync(instancePath, { recursive: true });

        // Create mods folder
        fs.mkdirSync(path.join(instancePath, 'mods'), { recursive: true });

        // Step 7: Install Minecraft and mod loader
        const isClient = instanceType === 'Client';
        const isFabric = modLoader === 'Fabric';

        let versionId;
        if (isFabric) {
            if (isClient) {
                versionId = await installFabricClient(instancePath, mcVersion, loaderVersion);
            } else {
                await installFabricServer(instancePath, mcVersion, loaderVersion);
                versionId = `fabric-server-${mcVersion}`;
            }
        } else {
            if (isClient) {
                versionId = await installForgeClient(instancePath, mcVersion, loaderVersion);
            } else {
                await installForgeServer(instancePath, mcVersion, loaderVersion);
                versionId = `forge-server-${mcVersion}`;
            }
        }

        // Step 8: Create mcconfig.json
        const config = {
            name: instanceName.trim(),
            type: instanceType.toLowerCase(),
            modLoader: modLoader.toLowerCase(),
            minecraftVersion: mcVersion,
            loaderVersion: loaderVersion,
            versionId: versionId,
            createdAt: new Date().toISOString(),
            mods: []
        };

        const configPath = path.join(instancePath, 'mcconfig.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

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