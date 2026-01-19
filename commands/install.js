import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const MODRINTH_API = 'https://api.modrinth.com/v2';

// Get project info from Modrinth
async function getProject(slugOrId) {
    const response = await fetch(`${MODRINTH_API}/project/${slugOrId}`, {
        headers: {
            'User-Agent': 'clicraft/0.1.0 (https://github.com/theinfamousben/clicraft)'
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`Modrinth API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
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

    const response = await fetch(`${MODRINTH_API}/project/${slugOrId}/version?${params}`, {
        headers: {
            'User-Agent': 'clicraft/0.1.0 (https://github.com/theinfamousben/clicraft)'
        }
    });

    if (!response.ok) {
        throw new Error(`Modrinth API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

// Download a file
async function downloadFile(url, destPath) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'clicraft/0.1.0 (https://github.com/theinfamousben/clicraft)'
        }
    });

    if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(destPath);
    await pipeline(Readable.fromWeb(response.body), fileStream);
}

// Load mcconfig.json from current directory or specified path
function loadConfig(instancePath) {
    const configPath = path.join(instancePath, 'mcconfig.json');
    
    if (!fs.existsSync(configPath)) {
        return null;
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
}

// Save mcconfig.json
function saveConfig(instancePath, config) {
    const configPath = path.join(instancePath, 'mcconfig.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export async function installMod(modSlug, options) {
    const instancePath = options.instance ? path.resolve(options.instance) : process.cwd();
    
    // Load instance config
    const config = loadConfig(instancePath);
    if (!config) {
        console.log(chalk.red('Error: No mcconfig.json found.'));
        console.log(chalk.gray('Make sure you are in a Minecraft instance directory or use --instance <path>'));
        return;
    }

    console.log(chalk.cyan(`\n📦 Installing "${modSlug}" to ${config.name}...\n`));

    try {
        // Get project info
        const project = await getProject(modSlug);
        if (!project) {
            console.log(chalk.red(`Error: Mod "${modSlug}" not found on Modrinth.`));
            console.log(chalk.gray('Use "clicraft search <query>" to find available mods.'));
            return;
        }

        if (project.project_type !== 'mod') {
            console.log(chalk.red(`Error: "${modSlug}" is a ${project.project_type}, not a mod.`));
            return;
        }

        console.log(chalk.gray(`Found: ${project.title}`));
        console.log(chalk.gray(`Looking for ${config.modLoader} version for Minecraft ${config.minecraftVersion}...`));

        // Get compatible versions
        const versions = await getProjectVersions(modSlug, config.minecraftVersion, config.modLoader);
        
        if (versions.length === 0) {
            console.log(chalk.red(`\nNo compatible version found for ${config.modLoader} on Minecraft ${config.minecraftVersion}`));
            
            // Try to find any versions to show what's available
            const allVersions = await getProjectVersions(modSlug);
            if (allVersions.length > 0) {
                const loaders = [...new Set(allVersions.flatMap(v => v.loaders))];
                const gameVersions = [...new Set(allVersions.flatMap(v => v.game_versions))].slice(0, 10);
                console.log(chalk.gray(`\nAvailable loaders: ${loaders.join(', ')}`));
                console.log(chalk.gray(`Recent game versions: ${gameVersions.join(', ')}`));
            }
            return;
        }

        // Use the latest compatible version
        const version = versions[0];
        const file = version.files.find(f => f.primary) || version.files[0];

        if (!file) {
            console.log(chalk.red('Error: No downloadable file found for this version.'));
            return;
        }

        // Check if already installed
        const existingMod = config.mods.find(m => m.projectId === project.id);
        if (existingMod && !options.force) {
            console.log(chalk.yellow(`\n⚠️  ${project.title} is already installed (version ${existingMod.versionNumber})`));
            console.log(chalk.gray('Use --force to reinstall or update.'));
            return;
        }

        // Create mods folder if it doesn't exist
        const modsPath = path.join(instancePath, 'mods');
        if (!fs.existsSync(modsPath)) {
            fs.mkdirSync(modsPath, { recursive: true });
        }

        // Remove old version if updating
        if (existingMod) {
            const oldFilePath = path.join(modsPath, existingMod.fileName);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
                console.log(chalk.gray(`Removed old version: ${existingMod.fileName}`));
            }
            config.mods = config.mods.filter(m => m.projectId !== project.id);
        }

        // Download the mod
        const destPath = path.join(modsPath, file.filename);
        console.log(chalk.gray(`Downloading ${file.filename}...`));
        await downloadFile(file.url, destPath);

        // Update config
        config.mods.push({
            projectId: project.id,
            slug: project.slug,
            name: project.title,
            versionId: version.id,
            versionNumber: version.version_number,
            fileName: file.filename,
            installedAt: new Date().toISOString()
        });

        saveConfig(instancePath, config);

        console.log(chalk.green(`\n✅ Successfully installed ${project.title} v${version.version_number}`));
        console.log(chalk.gray(`   File: mods/${file.filename}`));

        // Show dependencies if any
        if (version.dependencies && version.dependencies.length > 0) {
            const requiredDeps = version.dependencies.filter(d => d.dependency_type === 'required');
            if (requiredDeps.length > 0) {
                console.log(chalk.yellow(`\n⚠️  This mod has ${requiredDeps.length} required dependencies:`));
                for (const dep of requiredDeps) {
                    if (dep.project_id) {
                        const depProject = await getProject(dep.project_id);
                        if (depProject) {
                            const isInstalled = config.mods.some(m => m.projectId === dep.project_id);
                            const status = isInstalled ? chalk.green('✓') : chalk.red('✗');
                            console.log(chalk.gray(`   ${status} ${depProject.title} (${depProject.slug})`));
                        }
                    }
                }
                console.log(chalk.gray('\nInstall dependencies with: clicraft install <slug>'));
            }
        }

    } catch (error) {
        console.error(chalk.red('Error installing mod:'), error.message);
        if (options.verbose) {
            console.error(error);
        }
    }
}

export default { installMod };
