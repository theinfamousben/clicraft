#! /usr/bin/env node

import { createInstance } from './commands/create.js';
import { searchMods } from './commands/search.js';
import { installMod } from './commands/install.js';
import { login, logout, authStatus } from './commands/auth.js';
import { launchInstance } from './commands/launch.js';

import {program} from 'commander'; 

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
    .command('login')
    .description('Login to your Minecraft account (Microsoft)')
    .option('-f, --force', 'Force re-login even if already logged in')
    .option('--verbose', 'Enable verbose output')
    .action(login);

program
    .command('logout')
    .description('Logout from your Minecraft account')
    .action(logout);

program
    .command('status')
    .description('Show current login status')
    .action(authStatus);

program
    .command('launch')
    .description('Launch the Minecraft instance')
    .option('-i, --instance <path>', 'Path to the instance directory')
    .option('--offline', 'Launch in offline mode')
    .option('--verbose', 'Enable verbose output')
    .action(launchInstance);

program.parse();