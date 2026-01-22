import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import version from '../helpers/getv.js';
import * as v from '../helpers/versions.js';

const CONFIG_VERSION = version;

const MODRINTH_API = 'https://api.modrinth.com/v2';
const PAGE_SIZE = 10;
const NEXT_PAGE = '__NEXT_PAGE__';
const PREV_PAGE = '__PREV_PAGE__';

// Fetch JSON helper
async function fetchJson(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': `clicraft/${CONFIG_VERSION} (https://github.com/theinfamousben/clicraft)`
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
}

// Download a file
async function downloadFile(url, destPath) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': `clicraft/${CONFIG_VERSION} (https://github.com/theinfamousben/clicraft)`
        }
    });

    if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(destPath);
    await pipeline(Readable.fromWeb(response.body), fileStream);
}

// Load mcconfig.json
function loadConfig(instancePath) {
    const configPath = path.join(instancePath, 'mcconfig.json');
    if (!fs.existsSync(configPath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

// Save mcconfig.json
function saveConfig(instancePath, config) {
    const configPath = path.join(instancePath, 'mcconfig.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Paginated select helper
async function paginatedSelect(message, allChoices, getChoiceDisplay = (c) => c) {
    let currentPage = 0;
    const totalPages = Math.ceil(allChoices.length / PAGE_SIZE);

    while (true) {
        const startIdx = currentPage * PAGE_SIZE;
        const endIdx = Math.min(startIdx + PAGE_SIZE, allChoices.length);
        const pageChoices = allChoices.slice(startIdx, endIdx);

        const choices = pageChoices.map((choice) => ({
            name: typeof choice === 'object' && choice.name ? choice.name : getChoiceDisplay(choice),
            value: typeof choice === 'object' && choice.value !== undefined ? choice.value : choice
        }));

        if (currentPage > 0) {
            choices.push({ name: chalk.cyan('← Previous page'), value: PREV_PAGE });
        }
        if (currentPage < totalPages - 1) {
            choices.push({ name: chalk.cyan('→ Next page'), value: NEXT_PAGE });
        }

        const pageInfo = totalPages > 1 ? ` (page ${currentPage + 1}/${totalPages})` : '';
        
        const { selection } = await inquirer.prompt([{
            type: 'rawlist',
            name: 'selection',
            message: `${message}${pageInfo}`,
            choices: choices
        }]);

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

// Get project versions from Modrinth
async function getProjectVersions(slugOrId, mcVersion, loader) {
    const params = new URLSearchParams();
    if (mcVersion) {
        params.set('game_versions', JSON.stringify([mcVersion]));
    }
    if (loader) {
        params.set('loaders', JSON.stringify([loader]));
    }

    return await fetchJson(`${MODRINTH_API}/project/${slugOrId}/version?${params}`);
}

// Update a single mod
async function updateMod(instancePath, config, mod, options) {
    console.log(chalk.gray(`\nChecking ${mod.name}...`));

    try {
        const versions = await getProjectVersions(mod.slug, config.minecraftVersion, config.modLoader);
        
        if (versions.length === 0) {
            console.log(chalk.yellow(`  ⚠️  No compatible version found for ${config.minecraftVersion}`));
            return false;
        }

        const latestVersion = versions[0];
        
        if (latestVersion.id === mod.versionId && !options.force) {
            console.log(chalk.gray(`  ✓ Already up to date (${mod.versionNumber})`));
            return false;
        }

        const file = latestVersion.files.find(f => f.primary) || latestVersion.files[0];
        if (!file) {
            console.log(chalk.red(`  ✗ No downloadable file found`));
            return false;
        }

        // Remove old file
        const modsPath = path.join(instancePath, 'mods');
        const oldFilePath = path.join(modsPath, mod.fileName);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }

        // Download new file
        const destPath = path.join(modsPath, file.filename);
        console.log(chalk.gray(`  Downloading ${file.filename}...`));
        await downloadFile(file.url, destPath);

        // Update mod entry
        mod.versionId = latestVersion.id;
        mod.versionNumber = latestVersion.version_number;
        mod.fileName = file.filename;
        mod.updatedAt = new Date().toISOString();

        console.log(chalk.green(`  ✓ Updated to ${latestVersion.version_number}`));
        return true;
    } catch (error) {
        console.log(chalk.red(`  ✗ Error: ${error.message}`));
        return false;
    }
}

// Upgrade all mods
async function upgradeMods(instancePath, config, options) {
    if (config.mods.length === 0) {
        console.log(chalk.yellow('No mods installed.'));
        return;
    }

    console.log(chalk.cyan(`\n📦 Checking ${config.mods.length} mods for updates...\n`));

    let updated = 0;
    for (const mod of config.mods) {
        if (await updateMod(instancePath, config, mod, options)) {
            updated++;
        }
    }

    saveConfig(instancePath, config);

    console.log();
    if (updated > 0) {
        console.log(chalk.green(`✅ Updated ${updated} mod(s)`));
    } else {
        console.log(chalk.gray('All mods are up to date.'));
    }
}

// Upgrade a single mod by name
async function upgradeSingleMod(instancePath, config, modName, options) {
    const mod = config.mods.find(m => 
        m.slug.toLowerCase() === modName.toLowerCase() ||
        m.name.toLowerCase() === modName.toLowerCase()
    );

    if (!mod) {
        console.log(chalk.red(`Error: Mod "${modName}" is not installed.`));
        console.log(chalk.gray('Installed mods:'));
        for (const m of config.mods) {
            console.log(chalk.gray(`  - ${m.name} (${m.slug})`));
        }
        return;
    }

    console.log(chalk.cyan(`\n📦 Upgrading ${mod.name}...`));

    if (await updateMod(instancePath, config, mod, { ...options, force: true })) {
        saveConfig(instancePath, config);
        console.log(chalk.green(`\n✅ Successfully upgraded ${mod.name}`));
    } else {
        console.log(chalk.yellow(`\n⚠️  Could not upgrade ${mod.name}`));
    }
}

// Upgrade Minecraft version
async function upgradeMinecraft(instancePath, config, options) {
    console.log(chalk.cyan('\n🎮 Upgrade Minecraft Version\n'));
    console.log(chalk.gray(`Current version: ${config.minecraftVersion}`));

    // Fetch available versions
    console.log(chalk.gray('Fetching available versions...'));
    const manifest = await fetchJson('https://launchermeta.mojang.com/mc/game/version_manifest.json');
    
    const releaseVersions = manifest.versions
        .filter(v => v.type === 'release')
        .map(v => v.id);

    const currentIndex = releaseVersions.indexOf(config.minecraftVersion);
    
    // Show versions newer than current
    const newerVersions = currentIndex > 0 ? releaseVersions.slice(0, currentIndex) : [];
    
    if (newerVersions.length === 0) {
        console.log(chalk.green('\n✓ You are already on the latest Minecraft version!'));
        return;
    }

    console.log(chalk.yellow(`\n${newerVersions.length} newer version(s) available`));

    const newVersion = await paginatedSelect('Select new Minecraft version:', newerVersions);

    // Confirm
    const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `Upgrade from ${config.minecraftVersion} to ${newVersion}?`,
        default: false
    }]);

    if (!confirm) {
        console.log(chalk.yellow('Upgrade cancelled.'));
        return;
    }

    console.log(chalk.yellow('\n⚠️  Warning: Changing Minecraft version requires:'));
    console.log(chalk.gray('   1. Re-downloading game files (libraries, assets)'));
    console.log(chalk.gray('   2. Updating mod loader'));
    console.log(chalk.gray('   3. Checking mod compatibility'));
    console.log();
    console.log(chalk.red('This feature is not yet fully implemented.'));
    console.log(chalk.gray('For now, create a new instance with the desired version.'));
    console.log(chalk.gray('You can manually copy your mods, saves, and resource packs.'));
}

// Upgrade mod loader version
async function upgradeLoader(instancePath, config, options) {
    console.log(chalk.cyan('\n🔧 Upgrade Mod Loader\n'));
    console.log(chalk.gray(`Current: ${config.modLoader} ${config.loaderVersion}`));

    if (config.modLoader === 'fabric') {
        console.log(chalk.gray('Fetching Fabric loader versions...'));
        const loaderVersions = await fetchJson('https://meta.fabricmc.net/v2/versions/loader');
        const stableVersions = loaderVersions.filter(v => v.stable).map(v => v.version);

        const currentIndex = stableVersions.indexOf(config.loaderVersion);
        const newerVersions = currentIndex > 0 ? stableVersions.slice(0, currentIndex) : 
                              currentIndex === -1 ? stableVersions.slice(0, 5) : [];

        if (newerVersions.length === 0) {
            console.log(chalk.green('\n✓ You are already on the latest Fabric loader version!'));
            return;
        }

        console.log(chalk.yellow(`\n${newerVersions.length} newer version(s) available`));

        const newVersion = await paginatedSelect('Select Fabric loader version:', stableVersions);

        if (newVersion === config.loaderVersion) {
            console.log(chalk.gray('No change selected.'));
            return;
        }

        // Update config
        const oldVersionId = config.versionId;
        config.loaderVersion = newVersion;
        config.versionId = `fabric-loader-${newVersion}-${config.minecraftVersion}`;

        // Download new Fabric profile
        console.log(chalk.gray('\nFetching new Fabric profile...'));
        const fabricProfile = await fetchJson(
            `https://meta.fabricmc.net/v2/versions/loader/${config.minecraftVersion}/${newVersion}/profile/json`
        );

        // Save new version JSON
        const versionsPath = path.join(instancePath, 'versions');
        const newVersionPath = path.join(versionsPath, config.versionId);
        fs.mkdirSync(newVersionPath, { recursive: true });
        fs.writeFileSync(
            path.join(newVersionPath, `${config.versionId}.json`),
            JSON.stringify(fabricProfile, null, 2)
        );

        // Download any new Fabric libraries
        console.log(chalk.gray('Checking for new libraries...'));
        const librariesPath = path.join(instancePath, 'libraries');
        
        for (const lib of fabricProfile.libraries) {
            const parts = lib.name.split(':');
            if (parts.length < 3) continue;
            
            const [group, artifact, version] = parts;
            const classifier = parts.length > 3 ? `-${parts[3]}` : '';
            const groupPath = group.replace(/\./g, '/');
            const relativePath = `${groupPath}/${artifact}/${version}/${artifact}-${version}${classifier}.jar`;
            const libPath = path.join(librariesPath, relativePath);

            if (!fs.existsSync(libPath)) {
                const url = (lib.url || 'https://maven.fabricmc.net/') + relativePath;
                console.log(chalk.gray(`  Downloading ${artifact}...`));
                fs.mkdirSync(path.dirname(libPath), { recursive: true });
                try {
                    await downloadFile(url, libPath);
                } catch (err) {
                    console.log(chalk.yellow(`  Warning: Failed to download ${artifact}`));
                }
            }
        }

        // Remove old version folder if different
        if (oldVersionId !== config.versionId) {
            const oldVersionPath = path.join(versionsPath, oldVersionId);
            if (fs.existsSync(oldVersionPath)) {
                fs.rmSync(oldVersionPath, { recursive: true });
            }
        }

        saveConfig(instancePath, config);

        console.log(chalk.green(`\n✅ Upgraded Fabric loader to ${newVersion}`));

    } else if (config.modLoader === 'forge') {
        console.log(chalk.yellow('\n⚠️  Forge loader upgrade is not yet implemented.'));
        console.log(chalk.gray('For now, create a new instance with the desired Forge version.'));
    } else {
        console.log(chalk.red(`Unknown mod loader: ${config.modLoader}`));
    }
}

// Upgrade config version
async function upgradeConfig(instancePath, config, options) {
    // -1 = no version
    // -2 = invalid version
    const configVersionInt = v.enumerate(config.configVersion) ?? -1;
    const currentVersionInt = v.enumerate(CONFIG_VERSION);

    if (configVersionInt === currentVersionInt) {
        console.log(chalk.green('✓ Config is already up to date.'));
        return;
    }

    if (configVersionInt > currentVersionInt) {
        console.log(chalk.yellow('Config Version is than CLIcraft version. Please update CLIcraft. If the issue persists, please check mcconfig.json'));
        return;
    }

    console.log(chalk.cyan('\n🔄 Upgrading config format...\n'));


    // Apply migrations based on version
    if (configVersionInt === -1) {
        // Migration to v1: add configVersion field
        config.configVersion = CONFIG_VERSION;
        console.log(chalk.gray('  + Added configVersion field'));
    }

    if (configVersionInt === -2) {
        // Handle invalid version case
        config.configVersion = CONFIG_VERSION;
        console.log(chalk.gray('  + Set configVersion to current version due to invalid previous version'));
    }

    // Future migrations would go here:
    // if (oldVersion < 2) { ... }

    saveConfig(instancePath, config);
    console.log(chalk.green(`\n✅ Config upgraded from v${config.configVersion} to v${CONFIG_VERSION}`));
}

// Main upgrade command
export async function upgrade(modName, options) {
    const instancePath = options.instance ? path.resolve(options.instance) : process.cwd();
    
    // Load instance config
    const config = loadConfig(instancePath);
    if (!config) {
        console.log(chalk.red('Error: No mcconfig.json found.'));
        console.log(chalk.gray('Make sure you are in a Minecraft instance directory or use --instance <path>'));
        return;
    }

    try {
        // If a mod name is provided, upgrade just that mod
        if (modName) {
            await upgradeSingleMod(instancePath, config, modName, options);
            return;
        }

        // Otherwise, show upgrade menu
        console.log(chalk.cyan(`\n🔄 Upgrade ${config.name}\n`));

        const { upgradeType } = await inquirer.prompt([{
            type: 'rawlist',
            name: 'upgradeType',
            message: 'What would you like to upgrade?',
            choices: [
                { name: '📦 All mods', value: 'mods' },
                { name: '🎮 Minecraft version', value: 'minecraft' },
                { name: '🔧 Mod loader version', value: 'loader' },
                { name: '⚙️  Config format', value: 'config' },
                { name: '❌ Cancel', value: 'cancel' }
            ]
        }]);

        switch (upgradeType) {
            case 'mods':
                await upgradeMods(instancePath, config, options);
                break;
            case 'minecraft':
                await upgradeMinecraft(instancePath, config, options);
                break;
            case 'loader':
                await upgradeLoader(instancePath, config, options);
                break;
            case 'config':
                await upgradeConfig(instancePath, config, options);
                break;
            case 'cancel':
                console.log(chalk.gray('Upgrade cancelled.'));
                break;
        }

    } catch (error) {
        if (error.name === 'ExitPromptError') {
            console.log(chalk.yellow('\nUpgrade cancelled.'));
            return;
        }
        console.error(chalk.red('Error during upgrade:'), error.message);
        if (options.verbose) {
            console.error(error);
        }
    }
}

export default { upgrade };
