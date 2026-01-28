import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { loadAliases, saveAlias, removeAlias, getAliasByName, getAliasByPath } from '../helpers/config.js';
import { loadConfig } from '../helpers/utils.js';

/**
 * Display the list of all aliases
 */
function listAliases() {
    const aliases = loadAliases();
    
    if (Object.keys(aliases).length === 0) {
        console.log(chalk.yellow('\nNo aliases configured.'));
        console.log(chalk.gray('Use "clicraft alias add <name> <path>" to add an alias.'));
        return;
    }

    console.log(chalk.cyan('\n📋 Configured Aliases:\n'));
    
    for (const [name, aliasPath] of Object.entries(aliases)) {
        const config = loadConfig(aliasPath);
        const exists = fs.existsSync(aliasPath);
        
        if (!exists) {
            console.log(chalk.red(`  ${name}`));
            console.log(chalk.gray(`    Path: ${aliasPath} (not found)`));
        } else if (!config) {
            console.log(chalk.yellow(`  ${name}`));
            console.log(chalk.gray(`    Path: ${aliasPath} (no mcconfig.json)`));
        } else {
            console.log(chalk.green(`  ${name}`));
            console.log(chalk.gray(`    Path: ${aliasPath}`));
            console.log(chalk.gray(`    ${config.modLoader} ${config.loaderVersion} | MC ${config.minecraftVersion} | ${config.type}`));
        }
        console.log();
    }
}

/**
 * Add a new alias
 */
function addAlias(name, instancePath) {
    if (!name) {
        console.log(chalk.red('Error: Alias name is required.'));
        console.log(chalk.gray('Usage: clicraft alias add <name> [path]'));
        return false;
    }

    // Default to current directory if no path provided
    const resolvedPath = instancePath ? path.resolve(instancePath) : process.cwd();

    // Validate the path exists
    if (!fs.existsSync(resolvedPath)) {
        console.log(chalk.red(`Error: Path does not exist: ${resolvedPath}`));
        return false;
    }

    // Check for mcconfig.json
    const config = loadConfig(resolvedPath);
    if (!config) {
        console.log(chalk.yellow(`Warning: No mcconfig.json found at ${resolvedPath}`));
        console.log(chalk.gray('This may not be a valid Minecraft instance.'));
    }

    // Check if alias already exists
    const existing = getAliasByName(name);
    if (existing) {
        console.log(chalk.yellow(`Alias "${name}" already exists, updating path...`));
    }

    saveAlias(name, resolvedPath);
    
    console.log(chalk.green(`\n✅ Alias "${name}" added successfully!`));
    console.log(chalk.gray(`   Path: ${resolvedPath}`));
    if (config) {
        console.log(chalk.gray(`   Instance: ${config.name} (${config.modLoader} ${config.minecraftVersion})`));
    }
    console.log(chalk.gray(`\n   Launch with: clicraft launch ${name}`));
    
    return true;
}

/**
 * Remove an alias by name or path
 */
function removeAliasCommand(identifier) {
    if (!identifier) {
        console.log(chalk.red('Error: Alias name or path is required.'));
        console.log(chalk.gray('Usage: clicraft alias remove <name|path>'));
        return false;
    }

    const aliases = loadAliases();
    
    // First try to find by name
    if (aliases[identifier]) {
        const aliasPath = aliases[identifier];
        removeAlias(identifier);
        console.log(chalk.green(`\n✅ Alias "${identifier}" removed.`));
        console.log(chalk.gray(`   Was pointing to: ${aliasPath}`));
        return true;
    }

    // Try to find by path
    const resolvedPath = path.resolve(identifier);
    const aliasEntry = getAliasByPath(resolvedPath);
    
    if (aliasEntry) {
        removeAlias(aliasEntry.name);
        console.log(chalk.green(`\n✅ Alias "${aliasEntry.name}" removed.`));
        console.log(chalk.gray(`   Was pointing to: ${aliasEntry.path}`));
        return true;
    }

    console.log(chalk.red(`Error: No alias found matching "${identifier}"`));
    return false;
}

/**
 * Main alias command handler
 */
export async function aliasCommand(action, args, options) {
    const subcommand = action?.toLowerCase();

    switch (subcommand) {
        case 'add':
            addAlias(args[0], args[1]);
            break;
        case 'remove':
        case 'rm':
        case 'delete':
            removeAliasCommand(args[0]);
            break;
        case 'list':
        case 'ls':
        case undefined:
            listAliases();
            break;
        default:
            console.log(chalk.red(`Unknown alias action: ${action}`));
            console.log(chalk.gray('\nAvailable actions:'));
            console.log(chalk.gray('  alias add <name> [path]   Add an alias for an instance'));
            console.log(chalk.gray('  alias remove <name|path>  Remove an alias'));
            console.log(chalk.gray('  alias list                List all aliases'));
    }
}

export default { aliasCommand, addAlias };