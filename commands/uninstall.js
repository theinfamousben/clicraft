import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

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

// Find mod by slug or name (case-insensitive)
function findMod(mods, query) {
    const lowerQuery = query.toLowerCase();
    return mods.find(m => 
        m.slug.toLowerCase() === lowerQuery || 
        m.name.toLowerCase() === lowerQuery ||
        m.projectId === query
    );
}

export async function uninstallMod(modSlug, options) {
    const instancePath = options.instance ? path.resolve(options.instance) : process.cwd();
    
    // Load instance config
    const config = loadConfig(instancePath);
    if (!config) {
        console.log(chalk.red('Error: No mcconfig.json found.'));
        console.log(chalk.gray('Make sure you are in a Minecraft instance directory or use --instance <path>'));
        return;
    }

    // If no mod specified, show interactive selection
    if (!modSlug) {
        if (!config.mods || config.mods.length === 0) {
            console.log(chalk.yellow('\nNo mods installed in this instance.'));
            return;
        }

        const { selectedMods } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedMods',
                message: 'Select mods to uninstall:',
                choices: config.mods.map(m => ({
                    name: `${m.name} (${m.versionNumber})`,
                    value: m.slug
                }))
            }
        ]);

        if (selectedMods.length === 0) {
            console.log(chalk.yellow('\nNo mods selected.'));
            return;
        }

        // Uninstall each selected mod
        for (const slug of selectedMods) {
            await uninstallSingleMod(instancePath, config, slug, options);
        }

        return;
    }

    // Uninstall specific mod
    await uninstallSingleMod(instancePath, config, modSlug, options);
}

async function uninstallSingleMod(instancePath, config, modSlug, options) {
    // Find the mod
    const mod = findMod(config.mods, modSlug);
    
    if (!mod) {
        console.log(chalk.red(`Error: Mod "${modSlug}" is not installed.`));
        console.log(chalk.gray('Use "clicraft info --mods" to see installed mods.'));
        return;
    }

    console.log(chalk.cyan(`\n🗑️  Uninstalling "${mod.name}"...\n`));

    // Ask for confirmation unless --force is used
    if (!options.force) {
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Are you sure you want to uninstall ${mod.name}?`,
                default: false
            }
        ]);

        if (!confirm) {
            console.log(chalk.yellow('Uninstall cancelled.'));
            return;
        }
    }

    try {
        // Remove the mod file
        const modsPath = path.join(instancePath, 'mods');
        const modFilePath = path.join(modsPath, mod.fileName);
        
        if (fs.existsSync(modFilePath)) {
            fs.unlinkSync(modFilePath);
            console.log(chalk.gray(`Deleted: mods/${mod.fileName}`));
        } else {
            console.log(chalk.yellow(`Warning: Mod file not found: mods/${mod.fileName}`));
        }

        // Remove from config
        config.mods = config.mods.filter(m => m.projectId !== mod.projectId);
        saveConfig(instancePath, config);

        console.log(chalk.green(`\n✅ Successfully uninstalled ${mod.name}`));

    } catch (error) {
        console.error(chalk.red('Error uninstalling mod:'), error.message);
        if (options.verbose) {
            console.error(error);
        }
    }
}

export default { uninstallMod };
