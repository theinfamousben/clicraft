#! /usr/bin/env node

import { createInstance } from './commands/create.js';
import { searchMods } from './commands/search.js';
import { installMod } from './commands/install.js';
import { uninstallMod } from './commands/uninstall.js';
import { authCommand } from './commands/auth.js';
import { launchInstance } from './commands/launch.js';
import { instanceInfo } from './commands/info.js';
import { upgrade } from './commands/upgrade.js';
import { showVersion } from './commands/version.js';
import { configCommand } from './commands/config.js';

import {program} from 'commander'; 

program
    .option('-v, --version', 'Show the curent version')
    .action(showVersion)

program
    .command('search <query>')
    .description('Search for Minecraft mods on Modrinth')
    .option('-l, --limit <number>', 'Number of results to show', '10')
    .option('-v, --version <version>', 'Filter by Minecraft version')
    .option('--loader <loader>', 'Filter by mod loader (fabric, forge, quilt, neoforge)')
    .option('--verbose', 'Enable verbose output')
    .action(searchMods);

program
    .command('create')
    .description('Create a new Minecraft instance')
    .option('--verbose', 'Enable verbose output')
    .action(createInstance);

program
    .command('install <mod>')
    .description('Install a mod to the current Minecraft instance')
    .option('-i, --instance <path>', 'Path to the instance directory')
    .option('-f, --force', 'Force reinstall/update if already installed')
    .option('--verbose', 'Enable verbose output')
    .action(installMod);

program
    .command('uninstall [mod]')
    .description('Uninstall a mod from the current Minecraft instance')
    .option('-i, --instance <path>', 'Path to the instance directory')
    .option('-f, --force', 'Skip confirmation prompt')
    .option('--verbose', 'Enable verbose output')
    .action(uninstallMod);

program
    .command('auth [action] [args...]')
    .description('Manage Minecraft accounts (login, logout, switch, status)')
    .option('-f, --force', 'Skip confirmation prompts')
    .option('--verbose', 'Enable verbose output')
    .action(authCommand);

program
    .command('launch')
    .description('Launch the Minecraft instance')
    .option('-i, --instance <path>', 'Path to the instance directory')
    .option('--offline', 'Launch in offline mode')
    .option('--verbose', 'Enable verbose output')
    .action(launchInstance);

program
    .command('info')
    .description('Show information about the current Minecraft instance')
    .option('-i, --instance <path>', 'Path to the instance directory')
    .option('--verbose', 'Show detailed information')
    .option('--mods', 'List installed mods')
    .action(instanceInfo);

program
    .command('upgrade [mod]')
    .description('Upgrade mods, Minecraft version, or mod loader')
    .option('-i, --instance <path>', 'Path to the instance directory')
    .option('-f, --force', 'Force upgrade even if already up to date')
    .option('--verbose', 'Enable verbose output')
    .action(upgrade);

program
    .command('config [action] [args...]')
    .description('Manage CLI settings and game settings')
    .option('-i, --instance <path>', 'Path to the instance directory')
    .option('--verbose', 'Show detailed output')
    .action(configCommand);

program.parse();