import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { downloadFile, loadConfig, saveConfig, getInstancePath, requireConfig } from '../helpers/utils.js';
import { getProject, getProjectVersions } from '../helpers/modrinth.js';
import { loadSettings } from '../helpers/config.js';
import { callPostCommandActions } from '../helpers/post-command.js';

export async function installMod(modSlugs, options) {
    const instancePath = getInstancePath(options);
    
    const config = requireConfig(instancePath);
    if (!config) return;

    // Determine project type
    let projectType = 'mod';
    let projectTypePlural = 'mods';
    let targetFolder = 'mods';
    
    if (options.resourcepacks) {
        projectType = 'resourcepack';
        projectTypePlural = 'resource packs';
        targetFolder = 'resourcepacks';
    } else if (options.shaders) {
        projectType = 'shader';
        projectTypePlural = 'shaders';
        targetFolder = 'shaderpacks';
    }

    // Initialize arrays in config if needed
    if (!config.mods) config.mods = [];
    if (!config.resourcepacks) config.resourcepacks = [];
    if (!config.shaderpacks) config.shaderpacks = [];

    // Handle multiple items
    const slugs = Array.isArray(modSlugs) ? modSlugs : [modSlugs];
    
    let successCount = 0;
    let failCount = 0;

    for (const slug of slugs) {
        const success = await installSingleItem(slug, instancePath, config, options, projectType, targetFolder);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    // Show summary if multiple items were requested
    if (slugs.length > 1) {
        console.log(chalk.cyan('\n📊 Installation Summary:'));
        console.log(chalk.green(`   ✅ ${successCount} ${projectTypePlural} installed successfully`));
        if (failCount > 0) {
            console.log(chalk.red(`   ❌ ${failCount} ${projectTypePlural} failed to install`));
        }
    }

    callPostCommandActions();
}

async function installSingleItem(slug, instancePath, config, options, projectType, targetFolder) {
    const typeLabel = projectType === 'resourcepack' ? 'resource pack' : projectType;

    console.log(chalk.cyan(`\n📦 Installing ${typeLabel} "${slug}" to ${config.name}...\n`));

    try {
        // Get project info
        const project = await getProject(slug);
        if (!project) {
            console.log(chalk.red(`Error: "${slug}" not found on Modrinth.`));
            console.log(chalk.gray(`Use "clicraft search <query>${projectType !== 'mod' ? ` --${projectType}s` : ''}" to find available ${typeLabel}s.`));
            return false;
        }

        // Validate project type
        if (project.project_type !== projectType) {
            console.log(chalk.red(`Error: "${slug}" is a ${project.project_type}, not a ${typeLabel}.`));
            return false;
        }

        console.log(chalk.gray(`Found: ${project.title}`));
        
        // For mods, we need loader compatibility; for others, just version
        let versions;
        if (projectType === 'mod') {
            console.log(chalk.gray(`Looking for ${config.modLoader} version for Minecraft ${config.minecraftVersion}...`));
            versions = await getProjectVersions(slug, config.minecraftVersion, config.modLoader);
        } else {
            console.log(chalk.gray(`Looking for Minecraft ${config.minecraftVersion} version...`));
            versions = await getProjectVersions(slug, config.minecraftVersion);
        }
        
        if (versions.length === 0) {
            if (projectType === 'mod') {
                console.log(chalk.red(`\nNo compatible version found for ${config.modLoader} on Minecraft ${config.minecraftVersion}`));
            } else {
                console.log(chalk.red(`\nNo compatible version found for Minecraft ${config.minecraftVersion}`));
            }
            
            // Show available versions
            const allVersions = await getProjectVersions(slug);
            if (allVersions.length > 0) {
                if (projectType === 'mod') {
                    const loaders = [...new Set(allVersions.flatMap(v => v.loaders))];
                    console.log(chalk.gray(`\nAvailable loaders: ${loaders.join(', ')}`));
                }
                const gameVersions = [...new Set(allVersions.flatMap(v => v.game_versions))].slice(0, 10);
                console.log(chalk.gray(`Recent game versions: ${gameVersions.join(', ')}`));
            }
            return false;
        }

        // Use the latest compatible version
        const version = versions[0];
        const file = version.files.find(f => f.primary) || version.files[0];

        if (!file) {
            console.log(chalk.red('Error: No downloadable file found for this version.'));
            return false;
        }

        // Get the correct config array for this project type
        const configKey = targetFolder === 'mods' ? 'mods' : targetFolder;
        const configArray = config[configKey] || [];

        // Check if already installed
        const existingItem = configArray.find(m => m.projectId === project.id);
        if (existingItem && !options.force) {
            console.log(chalk.yellow(`\n⚠️  ${project.title} is already installed (version ${existingItem.versionNumber})`));
            console.log(chalk.gray('Use --force to reinstall or update.'));
            return false;
        }

        // Create target folder if needed
        const targetPath = path.join(instancePath, targetFolder);
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        // Remove old version if updating
        if (existingItem) {
            const oldFilePath = path.join(targetPath, existingItem.fileName);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
                console.log(chalk.gray(`Removed old version: ${existingItem.fileName}`));
            }
            config[configKey] = configArray.filter(m => m.projectId !== project.id);
        }

        // Download the file
        const destPath = path.join(targetPath, file.filename);
        console.log(chalk.gray(`Downloading ${file.filename}...`));
        await downloadFile(file.url, destPath, null, false);

        // Update config
        if (!config[configKey]) config[configKey] = [];
        config[configKey].push({
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
        console.log(chalk.gray(`   File: ${targetFolder}/${file.filename}`));

        // Handle dependencies (only for mods)
        if (projectType === 'mod' && version.dependencies?.length > 0) {
            const requiredDeps = version.dependencies.filter(d => d.dependency_type === 'required');
            let notInstalledDeps = [];
            
            for (const dep of requiredDeps) {
                if (dep.project_id) {
                    const depProject = await getProject(dep.project_id);
                    if (depProject) {
                        const isInstalled = config.mods.some(m => m.projectId === dep.project_id);
                        if (!isInstalled) {
                            notInstalledDeps.push({ project: depProject, title: depProject.title, slug: depProject.slug });
                        }
                    }
                }
            }
            
            if (notInstalledDeps.length > 0) {
                const settings = loadSettings();
                
                // Commander.js sets options.deps = false when --no-deps is passed
                const skipDeps = options.deps === false;
                
                if (settings.autoInstallDeps && !skipDeps) {
                    console.log(chalk.cyan(`\n📦 Installing ${notInstalledDeps.length} required dependenc${notInstalledDeps.length === 1 ? 'y' : 'ies'}...`));
                    
                    for (const dep of notInstalledDeps) {
                        // Recursively install dependency
                        await installSingleItem(dep.slug, instancePath, config, { ...options, _isDep: true }, 'mod', 'mods');
                    }
                } else {
                    console.log(chalk.yellow(`\n⚠️  Missing ${notInstalledDeps.length} required dependenc${notInstalledDeps.length === 1 ? 'y' : 'ies'}:`));
                    notInstalledDeps.forEach(dep => {
                        console.log(chalk.yellow(`   - ${dep.title} (${dep.slug})`));
                    });
                    console.log(chalk.gray('\nInstall with: clicraft install ' + notInstalledDeps.map(d => d.slug).join(' ')));
                }
            }
        }

        return true;

    } catch (error) {
        console.error(chalk.red(`Error installing ${typeLabel}:`), error.message);
        if (options.verbose) {
            console.error(error);
        }
        return false;
    }
}

export default { installMod };
