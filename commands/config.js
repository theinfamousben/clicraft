import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import {
    getConfigDir,
    loadSettings,
    saveSettings,
    loadGameSettingsIgnore,
    saveGameSettingsIgnore,
    loadDefaultGameSettings,
    saveDefaultGameSettings,
    extractGameSettings
} from '../helpers/config.js';
import { 
    loadConfig, 
    saveConfig, 
    getInstancePath, 
    requireConfig,
    parseValue
} from '../helpers/utils.js';
import { callPostCommandActions } from '../helpers/post-command.js';

// Show current CLI settings
async function showSettings() {
    const settings = loadSettings();
    const configDir = getConfigDir();
    
    console.log(chalk.cyan('\n⚙️  CLI Settings\n'));
    console.log(chalk.gray(`   Config directory: ${configDir}`));
    console.log('');
    
    for (const [key, value] of Object.entries(settings)) {
        const displayValue = value === null ? chalk.gray('(auto)') : chalk.white(value);
        console.log(`   ${chalk.cyan(key)}: ${displayValue}`);
    }
    console.log('');
}

// Edit a CLI setting
async function editSetting(key, value) {
    const settings = loadSettings();
    
    if (!(key in settings)) {
        console.log(chalk.red(`\nError: Unknown setting "${key}"`));
        console.log(chalk.gray('Available settings:'));
        for (const k of Object.keys(settings)) {
            console.log(chalk.gray(`   - ${k}`));
        }
        return;
    }
    
    let parsedValue = value === 'null' || value === 'auto' ? null : parseValue(value);
    settings[key] = parsedValue;
    saveSettings(settings);
    
    console.log(chalk.green(`\n✓ Set ${key} = ${parsedValue === null ? '(auto)' : parsedValue}`));
}

// Show game settings ignore list
async function showIgnoreList() {
    const ignoreList = loadGameSettingsIgnore();
    const configDir = getConfigDir();
    
    console.log(chalk.cyan('\n🚫 Game Settings Ignore List\n'));
    console.log(chalk.gray(`   File: ${path.join(configDir, 'game-settings-ignore.json')}`));
    console.log(chalk.gray('   These settings are excluded when saving game settings to mcconfig.json\n'));
    
    for (const pattern of ignoreList) {
        console.log(`   ${chalk.gray('-')} ${pattern}`);
    }
    console.log('');
    console.log(chalk.gray('   Tip: Use * as wildcard (e.g., key_* ignores all keybinds)'));
    console.log('');
}

// Add to ignore list
async function addToIgnoreList(pattern) {
    const ignoreList = loadGameSettingsIgnore();
    
    if (ignoreList.includes(pattern)) {
        console.log(chalk.yellow(`\n"${pattern}" is already in the ignore list`));
        return;
    }
    
    ignoreList.push(pattern);
    saveGameSettingsIgnore(ignoreList);
    
    console.log(chalk.green(`\n✓ Added "${pattern}" to ignore list`));
}

// Remove from ignore list
async function removeFromIgnoreList(pattern) {
    const ignoreList = loadGameSettingsIgnore();
    
    const index = ignoreList.indexOf(pattern);
    if (index === -1) {
        console.log(chalk.yellow(`\n"${pattern}" is not in the ignore list`));
        return;
    }
    
    ignoreList.splice(index, 1);
    saveGameSettingsIgnore(ignoreList);
    
    console.log(chalk.green(`\n✓ Removed "${pattern}" from ignore list`));
}

// Capture game settings from an instance's options.txt
export async function captureGameSettings(options, autoSaveToConfig = false) {
    const instancePath = getInstancePath(options);
    
    const config = loadConfig(instancePath);
    if (!config) {
        console.log(chalk.red('Error: No mcconfig.json found.'));
        console.log(chalk.gray('Make sure you are in a Minecraft instance directory or use --instance <path>'));
        return;
    }
    
    const optionsPath = path.join(instancePath, 'options.txt');
    if (!fs.existsSync(optionsPath)) {
        console.log(chalk.red('Error: No options.txt found.'));
        console.log(chalk.gray('Launch Minecraft at least once to generate options.txt'));
        return;
    }
    
    const gameSettings = extractGameSettings(optionsPath);
    
    if (!gameSettings || Object.keys(gameSettings).length === 0) {
        console.log(chalk.yellow('No game settings to capture (all settings are in ignore list)'));
        return;
    }
    
    const message = autoSaveToConfig 
        ? chalk.gray('(auto-saved to mcconfig.json)\nDisable this by setting autoSaveToConfig to false in ~/.clicraft/settings.json')
        : '';
    console.log(chalk.cyan(`\n⚙️  Captured ${Object.keys(gameSettings).length} game settings\n ${message}\n`));
    
    if (options.verbose) {
        for (const [key, value] of Object.entries(gameSettings)) {
            console.log(chalk.gray(`   ${key}: ${value}`));
        }
        console.log('');
    }
    
    if (!autoSaveToConfig) {
        const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: 'Save these settings to mcconfig.json?',
            default: true
        }]);

        if (!confirm) {
            console.log(chalk.yellow('\nCancelled.'));
            return;
        }
    }
    
    config.gameSettings = gameSettings;
    saveConfig(instancePath, config);
    
    console.log(chalk.green(`\n✓ Saved ${Object.keys(gameSettings).length} game settings to mcconfig.json`));
    console.log(chalk.gray('   These settings will be applied when creating an instance from this config'));
}

// Show game settings from mcconfig
async function showGameSettings(options) {
    const instancePath = getInstancePath(options);
    
    const config = loadConfig(instancePath);
    if (!config) {
        console.log(chalk.red('Error: No mcconfig.json found.'));
        return;
    }
    
    if (!config.gameSettings || Object.keys(config.gameSettings).length === 0) {
        console.log(chalk.yellow('\nNo game settings saved in this instance.'));
        console.log(chalk.gray('Use "clicraft config capture" to capture settings from options.txt'));
        return;
    }
    
    console.log(chalk.cyan(`\n⚙️  Game Settings (${Object.keys(config.gameSettings).length} saved)\n`));
    
    for (const [key, value] of Object.entries(config.gameSettings)) {
        console.log(`   ${chalk.cyan(key)}: ${value}`);
    }
    console.log('');
}

// Clear game settings from mcconfig
async function clearGameSettings(options) {
    const instancePath = getInstancePath(options);
    
    const config = loadConfig(instancePath);
    if (!config) {
        console.log(chalk.red('Error: No mcconfig.json found.'));
        return;
    }
    
    if (!config.gameSettings || Object.keys(config.gameSettings).length === 0) {
        console.log(chalk.yellow('\nNo game settings to clear.'));
        return;
    }
    
    const count = Object.keys(config.gameSettings).length;
    delete config.gameSettings;
    saveConfig(instancePath, config);
    
    console.log(chalk.green(`\n✓ Cleared ${count} game settings from mcconfig.json`));
}

// Show default game settings
async function showDefaultGameSettings() {
    const configDir = getConfigDir();
    const defaults = loadDefaultGameSettings();
    
    console.log(chalk.cyan('\n🎮 Default Game Settings\n'));
    console.log(chalk.gray(`   File: ${path.join(configDir, 'default-game-settings.json')}`));
    console.log(chalk.gray('   These settings are applied to all new instances\n'));
    
    if (Object.keys(defaults).length === 0) {
        console.log(chalk.gray('   (No default settings configured)'));
        console.log('');
        console.log(chalk.gray('   Add settings with: clicraft config defaults-set <key> <value>'));
        console.log(chalk.gray('   Example: clicraft config defaults-set renderDistance 16'));
    } else {
        for (const [key, value] of Object.entries(defaults)) {
            console.log(`   ${chalk.cyan(key)}: ${value}`);
        }
    }
    console.log('');
}

// Set a default game setting
async function setDefaultGameSetting(key, value) {
    const defaults = loadDefaultGameSettings();
    defaults[key] = parseValue(value);
    saveDefaultGameSettings(defaults);
    
    console.log(chalk.green(`\n✓ Set default ${key} = ${defaults[key]}`));
    console.log(chalk.gray('   This will be applied to all new instances'));
}

// Remove a default game setting
async function removeDefaultGameSetting(key) {
    const defaults = loadDefaultGameSettings();
    
    if (!(key in defaults)) {
        console.log(chalk.yellow(`\n"${key}" is not in default settings`));
        return;
    }
    
    delete defaults[key];
    saveDefaultGameSettings(defaults);
    
    console.log(chalk.green(`\n✓ Removed "${key}" from default settings`));
}

// Clear all default game settings
async function clearDefaultGameSettings() {
    saveDefaultGameSettings({});
    console.log(chalk.green('\n✓ Cleared all default game settings'));
}

// Main config command handler
export async function configCommand(action, args, options) {
    switch (action) {
        case 'show':
        case undefined:
            await showSettings();
            break;
            
        case 'set':
            if (!args || args.length < 2) {
                console.log(chalk.red('Usage: clicraft config set <key> <value>'));
                return;
            }
            await editSetting(args[0], args[1]);
            break;
            
        case 'ignore':
            await showIgnoreList();
            break;
            
        case 'ignore-add':
            if (!args || args.length < 1) {
                console.log(chalk.red('Usage: clicraft config ignore-add <pattern>'));
                return;
            }
            await addToIgnoreList(args[0]);
            break;
            
        case 'ignore-remove':
            if (!args || args.length < 1) {
                console.log(chalk.red('Usage: clicraft config ignore-remove <pattern>'));
                return;
            }
            await removeFromIgnoreList(args[0]);
            break;
            
        case 'capture':
            await captureGameSettings(options);
            break;
            
        case 'game-settings':
            await showGameSettings(options);
            break;
            
        case 'clear-game-settings':
            await clearGameSettings(options);
            break;
            
        case 'defaults':
            await showDefaultGameSettings();
            break;
            
        case 'defaults-set':
            if (!args || args.length < 2) {
                console.log(chalk.red('Usage: clicraft config defaults-set <key> <value>'));
                console.log(chalk.gray('\nExample: clicraft config defaults-set renderDistance 16'));
                return;
            }
            await setDefaultGameSetting(args[0], args[1]);
            break;
            
        case 'defaults-remove':
            if (!args || args.length < 1) {
                console.log(chalk.red('Usage: clicraft config defaults-remove <key>'));
                return;
            }
            await removeDefaultGameSetting(args[0]);
            break;
            
        case 'defaults-clear':
            await clearDefaultGameSettings();
            break;
            
        default:
            console.log(chalk.red(`Unknown action: ${action}`));
            console.log(chalk.gray('\nAvailable actions:'));
            console.log(chalk.gray('   show                  - Show CLI settings'));
            console.log(chalk.gray('   set <key> <value>     - Set a CLI setting'));
            console.log(chalk.gray('   ignore                - Show game settings ignore list'));
            console.log(chalk.gray('   ignore-add <pattern>  - Add to ignore list'));
            console.log(chalk.gray('   ignore-remove <pattern> - Remove from ignore list'));
            console.log(chalk.gray('   defaults              - Show default game settings'));
            console.log(chalk.gray('   defaults-set <key> <value> - Set a default game setting'));
            console.log(chalk.gray('   defaults-remove <key> - Remove a default game setting'));
            console.log(chalk.gray('   defaults-clear        - Clear all default game settings'));
            console.log(chalk.gray('   capture               - Capture game settings from options.txt'));
            console.log(chalk.gray('   game-settings         - Show saved game settings'));
            console.log(chalk.gray('   clear-game-settings   - Clear saved game settings'));
            break;
    }

    callPostCommandActions();
}

export default { configCommand };
