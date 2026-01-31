import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { downloadFile, loadConfig, saveConfig, getInstancePath, requireConfig } from '../helpers/utils.js';
import { getProject, getProjectVersions } from '../helpers/modrinth.js';
import { callPostCommandActions } from '../helpers/post-command.js';

export async function installMod(modSlugs, options) {
    const instancePath = getInstancePath(options);
    
    const config = requireConfig(instancePath);
    if (!config) return;

    // Handle multiple mods
    const slugs = Array.isArray(modSlugs) ? modSlugs : [modSlugs];
    
    let successCount = 0;
    let failCount = 0;

    for (const modSlug of slugs) {
        const success = await installSingleMod(modSlug, instancePath, config, options);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    // Show summary if multiple mods were requested
    if (slugs.length > 1) {
        console.log(chalk.cyan('\n📊 Installation Summary:'));
        console.log(chalk.green(`   ✅ ${successCount} mod(s) installed successfully`));
        if (failCount > 0) {
            console.log(chalk.red(`   ❌ ${failCount} mod(s) failed to install`));
        }
    }

    callPostCommandActions();
}

async function installSingleMod(modSlug, instancePath, config, options) {

    console.log(chalk.cyan(`\n📦 Installing "${modSlug}" to ${config.name}...\n`));

    try {
        // Get project info
        const project = await getProject(modSlug);
        if (!project) {
            console.log(chalk.red(`Error: Mod "${modSlug}" not found on Modrinth.`));
            console.log(chalk.gray('Use "clicraft search <query>" to find available mods.'));
            return false;
        }

        if (project.project_type !== 'mod') {
            console.log(chalk.red(`Error: "${modSlug}" is a ${project.project_type}, not a mod.`));
            return false;
        }

        console.log(chalk.gray(`Found: ${project.title}`));
        console.log(chalk.gray(`Looking for ${config.modLoader} version for Minecraft ${config.minecraftVersion}...`));

        // Get compatible versions
        const versions = await getProjectVersions(modSlug, config.minecraftVersion, config.modLoader);
        
        if (versions.length === 0) {
            console.log(chalk.red(`\nNo compatible version found for ${config.modLoader} on Minecraft ${config.minecraftVersion}`));
            
            // Show available versions
            const allVersions = await getProjectVersions(modSlug);
            if (allVersions.length > 0) {
                const loaders = [...new Set(allVersions.flatMap(v => v.loaders))];
                const gameVersions = [...new Set(allVersions.flatMap(v => v.game_versions))].slice(0, 10);
                console.log(chalk.gray(`\nAvailable loaders: ${loaders.join(', ')}`));
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

        // Check if already installed
        const existingMod = config.mods.find(m => m.projectId === project.id);
        if (existingMod && !options.force) {
            console.log(chalk.yellow(`\n⚠️  ${project.title} is already installed (version ${existingMod.versionNumber})`));
            console.log(chalk.gray('Use --force to reinstall or update.'));
            return false;
        }

        // Create mods folder if needed
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
        await downloadFile(file.url, destPath, null, false);

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
        if (version.dependencies?.length > 0) {
            const requiredDeps = version.dependencies.filter(d => d.dependency_type === 'required');
            let totalDeps = [];
            let notInstalledDeps = [];
            
            for (const dep of requiredDeps) {
                if (dep.project_id) {
                    const depProject = await getProject(dep.project_id);
                    if (depProject) {
                        const isInstalled = config.mods.some(m => m.projectId === dep.project_id);
                        // const status = isInstalled ? chalk.green('✓') : chalk.red('✗');
                        totalDeps.push({ project: depProject, title: depProject.title, slug: depProject.slug, installed: isInstalled });
                    }
                }
            }

            for (const dep of totalDeps) {
                if (!dep.installed) {
                    notInstalledDeps.push(dep); 
                }
            }
            
            if (notInstalledDeps.length > 0) {
                console.log(chalk.yellow(`\n⚠️  This mod has ${notInstalledDeps.length} dependencies which are not installed:`));
                totalDeps.forEach(dep => {
                    if(dep.installed)
                        console.log(chalk.green(`   - ${dep.title} (${dep.slug})`));
                    if(!dep.installed)
                        console.log(chalk.yellow(`   - ${dep.title} (${dep.slug})`));
                });
                console.log(chalk.gray('\nInstall dependencies with: clicraft install <slug>'));
            }

            if (notInstalledDeps.length === 0) {
                console.log(chalk.green('\n✅  All dependencies are already installed.'));
                
            }
        }

        return true;

    } catch (error) {
        console.error(chalk.red('Error installing mod:'), error.message);
        if (options.verbose) {
            console.error(error);
        }
        return false;
    }
}

export default { installMod };
