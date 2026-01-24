import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { loadConfig, saveConfig, getInstancePath, requireConfig } from '../helpers/utils.js';
import { findMod } from '../helpers/modrinth.js';
import { callPostCommandActions } from '../helpers/post-command.js';

export async function uninstallMod(modSlug, options) {
    const instancePath = getInstancePath(options);
    
    const config = requireConfig(instancePath);
    if (!config) return;

    // If no mod specified, show interactive selection
    if (!modSlug) {
        if (!config.mods || config.mods.length === 0) {
            console.log(chalk.yellow('\nNo mods installed in this instance.'));
            return;
        }

        const { selectedMods } = await inquirer.prompt([{
            type: 'checkbox',
            name: 'selectedMods',
            message: 'Select mods to uninstall:',
            choices: config.mods.map(m => ({
                name: `${m.name} (${m.versionNumber})`,
                value: m.slug
            }))
        }]);

        if (selectedMods.length === 0) {
            console.log(chalk.yellow('\nNo mods selected.'));
            return;
        }

        for (const slug of selectedMods) {
            await uninstallSingleMod(instancePath, config, slug, options);
        }
        return;
    }

    await uninstallSingleMod(instancePath, config, modSlug, options);
}

async function uninstallSingleMod(instancePath, config, modSlug, options) {
    const mod = findMod(config.mods, modSlug);
    
    if (!mod) {
        console.log(chalk.red(`Error: Mod "${modSlug}" is not installed.`));
        console.log(chalk.gray('Use "clicraft info --mods" to see installed mods.'));
        return;
    }

    console.log(chalk.cyan(`\n🗑️  Uninstalling "${mod.name}"...\n`));

    if (!options.force) {
        const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to uninstall ${mod.name}?`,
            default: false
        }]);

        if (!confirm) {
            console.log(chalk.yellow('Uninstall cancelled.'));
            return;
        }
    }

    try {
        const modsPath = path.join(instancePath, 'mods');
        const modFilePath = path.join(modsPath, mod.fileName);
        
        if (fs.existsSync(modFilePath)) {
            fs.unlinkSync(modFilePath);
            console.log(chalk.gray(`Deleted: mods/${mod.fileName}`));
        } else {
            console.log(chalk.yellow(`Warning: Mod file not found: mods/${mod.fileName}`));
        }

        config.mods = config.mods.filter(m => m.projectId !== mod.projectId);
        saveConfig(instancePath, config);

        console.log(chalk.green(`\n✅ Successfully uninstalled ${mod.name}`));

    } catch (error) {
        console.error(chalk.red('Error uninstalling mod:'), error.message);
        if (options.verbose) {
            console.error(error);
        }
    }

    callPostCommandActions();
}

export default { uninstallMod };
