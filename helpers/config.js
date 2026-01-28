import fs from 'fs';
import path from 'path';
import os from 'os';

// Get the .clicraft config directory path
export function getConfigDir() {
    const configDir = path.join(os.homedir(), '.clicraft');
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    return configDir;
}

// Default settings
const DEFAULT_SETTINGS = {
    // to implement in the future

    // Default Java path (null = auto-detect)
    // javaPath: null,
    // Default memory allocation
    // minMemory: '1G',
    // maxMemory: '2G',

    checkUpdates: true,
    autoSaveToConfig: true,
    autoLoadConfigOnLaunch: true,
    settingsVersion: '0.3.0',
};

// Default game settings to apply to new instances
// These are Minecraft options.txt settings
const DEFAULT_GAME_SETTINGS = {
    // Common defaults - users can customize in ~/.clicraft/default-game-settings.json
    // renderDistance: 12,
    // fov: 70,
    // guiScale: 0,
    // gamma: 0.5,
    // maxFps: 120,
    // lang: 'en_us'
};

// Default list of game settings to ignore when sharing configs
// These are typically user-specific or machine-specific
const DEFAULT_GAME_SETTINGS_IGNORE = [
    // Window/display settings (machine-specific)
    'fullscreen',
    'overrideWidth',
    'overrideHeight',
    'fullscreenResolution',
    // Account/identity (user-specific)
    'lastServer',
    'resourcePacks',
    'incompatibleResourcePacks',
    // Keybinds (often personal preference, can cause issues)
    'key_*',
    // Accessibility (personal)
    'narrator',
    'highContrast',
    // Telemetry
    'telemetryOptInExtra',
    'onboardAccessibility'
];



// Load global settings from ~/.clicraft/settings.json
export function loadSettings() {
    const configDir = getConfigDir();
    const settingsPath = path.join(configDir, 'settings.json');
    
    if (!fs.existsSync(settingsPath)) {
        // Create default settings file
        saveSettings(DEFAULT_SETTINGS);
        return { ...DEFAULT_SETTINGS };
    }
    
    try {
        const content = fs.readFileSync(settingsPath, 'utf-8');
        const userSettings = JSON.parse(content);
        // Merge with defaults to ensure all keys exist
        return { ...DEFAULT_SETTINGS, ...userSettings };
    } catch (err) {
        console.error('Warning: Could not parse settings.json, using defaults');
        return { ...DEFAULT_SETTINGS };
    }
}

// Save global settings to ~/.clicraft/settings.json
export function saveSettings(settings) {
    const configDir = getConfigDir();
    const settingsPath = path.join(configDir, 'settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

// Load the game settings ignore list from ~/.clicraft/game-settings-ignore.json
export function loadGameSettingsIgnore() {
    const configDir = getConfigDir();
    const ignorePath = path.join(configDir, 'game-settings-ignore.json');
    
    if (!fs.existsSync(ignorePath)) {
        // Create default ignore file
        saveGameSettingsIgnore(DEFAULT_GAME_SETTINGS_IGNORE);
        return [...DEFAULT_GAME_SETTINGS_IGNORE];
    }
    
    try {
        const content = fs.readFileSync(ignorePath, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        console.error('Warning: Could not parse game-settings-ignore.json, using defaults');
        return [...DEFAULT_GAME_SETTINGS_IGNORE];
    }
}

// Save the game settings ignore list
export function saveGameSettingsIgnore(ignoreList) {
    const configDir = getConfigDir();
    const ignorePath = path.join(configDir, 'game-settings-ignore.json');
    fs.writeFileSync(ignorePath, JSON.stringify(ignoreList, null, 2));
}

// Load default game settings from ~/.clicraft/default-game-settings.json
export function loadDefaultGameSettings() {
    const configDir = getConfigDir();
    const defaultsPath = path.join(configDir, 'default-game-settings.json');
    
    if (!fs.existsSync(defaultsPath)) {
        // Create default file with commented example
        saveDefaultGameSettings(DEFAULT_GAME_SETTINGS);
        return { ...DEFAULT_GAME_SETTINGS };
    }
    
    try {
        const content = fs.readFileSync(defaultsPath, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        console.error('Warning: Could not parse default-game-settings.json, using defaults');
        return { ...DEFAULT_GAME_SETTINGS };
    }
}

// Save default game settings
export function saveDefaultGameSettings(settings) {
    const configDir = getConfigDir();
    const defaultsPath = path.join(configDir, 'default-game-settings.json');
    fs.writeFileSync(defaultsPath, JSON.stringify(settings, null, 2));
}

// Check if a setting key matches the ignore list (supports wildcards)
export function isSettingIgnored(key, ignoreList) {
    for (const pattern of ignoreList) {
        if (pattern.endsWith('*')) {
            // Wildcard match
            const prefix = pattern.slice(0, -1);
            if (key.startsWith(prefix)) {
                return true;
            }
        } else if (key === pattern) {
            return true;
        }
    }
    return false;
}

// Parse Minecraft options.txt into an object
export function parseOptionsTxt(content) {
    const options = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes(':')) continue;
        
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex);
        const value = trimmed.substring(colonIndex + 1);
        
        // Try to parse as number or boolean
        if (value === 'true') {
            options[key] = true;
        } else if (value === 'false') {
            options[key] = false;
        } else if (!isNaN(value) && value !== '') {
            options[key] = parseFloat(value);
        } else {
            options[key] = value;
        }
    }
    
    return options;
}

// Generate options.txt content from an object
export function generateOptionsTxt(options) {
    const lines = [];
    
    for (const [key, value] of Object.entries(options)) {
        lines.push(`${key}:${value}`);
    }
    
    return lines.join('\n');
}

// Extract game settings from options.txt, filtering out ignored settings
export function extractGameSettings(optionsTxtPath) {
    if (!fs.existsSync(optionsTxtPath)) {
        return null;
    }
    
    const content = fs.readFileSync(optionsTxtPath, 'utf-8');
    const allOptions = parseOptionsTxt(content);
    const ignoreList = loadGameSettingsIgnore();
    
    const filteredOptions = {};
    for (const [key, value] of Object.entries(allOptions)) {
        if (!isSettingIgnored(key, ignoreList)) {
            filteredOptions[key] = value;
        }
    }
    
    return filteredOptions;
}

// Write game settings to options.txt in an instance
export function writeGameSettings(instancePath, gameSettings) {
    if (!gameSettings || Object.keys(gameSettings).length === 0) {
        return;
    }
    
    const optionsPath = path.join(instancePath, 'options.txt');
    
    // If options.txt already exists, merge with existing settings
    let existingOptions = {};
    if (fs.existsSync(optionsPath)) {
        const content = fs.readFileSync(optionsPath, 'utf-8');
        existingOptions = parseOptionsTxt(content);
    }
    
    // Merge: gameSettings values override existing
    const mergedOptions = { ...existingOptions, ...gameSettings };
    
    fs.writeFileSync(optionsPath, generateOptionsTxt(mergedOptions));
}

export default {
    getConfigDir,
    loadSettings,
    saveSettings,
    loadGameSettingsIgnore,
    saveGameSettingsIgnore,
    loadDefaultGameSettings,
    saveDefaultGameSettings,
    isSettingIgnored,
    parseOptionsTxt,
    generateOptionsTxt,
    extractGameSettings,
    writeGameSettings,
    loadAliases,
    saveAlias,
    removeAlias,
    getAliasByName,
    getAliasByPath
};

// ============================================
// Alias Management
// ============================================

/**
 * Load aliases from ~/.clicraft/aliases.json
 * @returns {object} - Object mapping alias names to instance paths
 */
export function loadAliases() {
    const configDir = getConfigDir();
    const aliasPath = path.join(configDir, 'aliases.json');
    
    if (!fs.existsSync(aliasPath)) {
        return {};
    }
    
    try {
        const content = fs.readFileSync(aliasPath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return {};
    }
}

/**
 * Save all aliases to ~/.clicraft/aliases.json
 * @param {object} aliases - Object mapping alias names to instance paths
 */
function saveAliases(aliases) {
    const configDir = getConfigDir();
    const aliasPath = path.join(configDir, 'aliases.json');
    fs.writeFileSync(aliasPath, JSON.stringify(aliases, null, 2));
}

/**
 * Add or update an alias
 * @param {string} name - Alias name
 * @param {string} instancePath - Path to the instance
 */
export function saveAlias(name, instancePath) {
    const aliases = loadAliases();
    aliases[name] = instancePath;
    saveAliases(aliases);
}

/**
 * Remove an alias by name
 * @param {string} name - Alias name to remove
 */
export function removeAlias(name) {
    const aliases = loadAliases();
    delete aliases[name];
    saveAliases(aliases);
}

/**
 * Get an alias by name
 * @param {string} name - Alias name
 * @returns {string|null} - Instance path or null if not found
 */
export function getAliasByName(name) {
    const aliases = loadAliases();
    return aliases[name] || null;
}

/**
 * Get an alias by its path
 * @param {string} instancePath - Path to search for
 * @returns {{name: string, path: string}|null} - Alias entry or null if not found
 */
export function getAliasByPath(instancePath) {
    const aliases = loadAliases();
    for (const [name, aliasPath] of Object.entries(aliases)) {
        if (aliasPath === instancePath) {
            return { name, path: aliasPath };
        }
    }
    return null;
}
