import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import * as pkg from '../package.json' with { type: 'json' };

// Current mcconfig version
const CONFIG_VERSION = pkg.version;

// Load mcconfig.json
function loadConfig(instancePath) {
    const configPath = path.join(instancePath, 'mcconfig.json');
    if (!fs.existsSync(configPath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

// Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get directory size
function getDirSize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;
    
    let size = 0;
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
            size += getDirSize(filePath);
        } else {
            try {
                size += fs.statSync(filePath).size;
            } catch {
                // Skip files we can't read
            }
        }
    }
    
    return size;
}

// Count files in directory
function countFiles(dirPath, extension = null) {
    if (!fs.existsSync(dirPath)) return 0;
    
    let count = 0;
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
            count += countFiles(filePath, extension);
        } else if (!extension || file.name.endsWith(extension)) {
            count++;
        }
    }
    
    return count;
}

// Format date
function formatDate(isoString) {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export async function instanceInfo(options) {
    const instancePath = options.instance ? path.resolve(options.instance) : process.cwd();
    
    // Load instance config
    const config = loadConfig(instancePath);
    if (!config) {
        console.log(chalk.red('Error: No mcconfig.json found.'));
        console.log(chalk.gray('Make sure you are in a Minecraft instance directory or use --instance <path>'));
        return;
    }

    console.log(chalk.cyan('\n📦 Instance Information\n'));

    // Basic info
    console.log(chalk.white('  Name:            ') + chalk.yellow(config.name));
    console.log(chalk.white('  Type:            ') + chalk.gray(config.type === 'client' ? '🎮 Client' : '🖥️  Server'));
    console.log(chalk.white('  Mod Loader:      ') + chalk.gray(config.modLoader.charAt(0).toUpperCase() + config.modLoader.slice(1)));
    console.log(chalk.white('  Minecraft:       ') + chalk.green(config.minecraftVersion));
    console.log(chalk.white('  Loader Version:  ') + chalk.gray(config.loaderVersion));
    console.log(chalk.white('  Version ID:      ') + chalk.gray(config.versionId));
    console.log(chalk.white('  Created:         ') + chalk.gray(formatDate(config.createdAt)));
    
    if (config.configVersion) {
        console.log(chalk.white('  Config Version:  ') + chalk.gray(`v${config.configVersion}`));
    } else {
        console.log(chalk.white('  Config Version:  ') + chalk.yellow('legacy (no version)'));
    }

    // Location
    console.log(chalk.white('  Location:        ') + chalk.gray(instancePath));

    // Mods info
    const modsPath = path.join(instancePath, 'mods');
    const installedMods = config.mods || [];
    const modFiles = fs.existsSync(modsPath) ? 
        fs.readdirSync(modsPath).filter(f => f.endsWith('.jar')) : [];

    console.log();
    console.log(chalk.cyan('📚 Mods'));
    console.log(chalk.white('  Tracked Mods:    ') + chalk.yellow(installedMods.length));
    console.log(chalk.white('  Mod Files:       ') + chalk.gray(modFiles.length + ' .jar files'));

    if (installedMods.length > 0) {
        console.log(chalk.gray('\n  Installed mods:'));
        for (const mod of installedMods) {
            console.log(chalk.gray(`    - ${mod.name} (${mod.fileName}) [${mod.versionNumber}]`));
        }
    }

    // Storage info
    console.log();
    console.log(chalk.cyan('💾 Storage'));
    
    const directories = [
        { name: 'Libraries', path: 'libraries' },
        { name: 'Assets', path: 'assets' },
        { name: 'Versions', path: 'versions' },
        { name: 'Mods', path: 'mods' },
        { name: 'Saves', path: 'saves' },
        { name: 'Resource Packs', path: 'resourcepacks' },
        { name: 'Logs', path: 'logs' }
    ];

    let totalSize = 0;
    for (const dir of directories) {
        const dirPath = path.join(instancePath, dir.path);
        const size = getDirSize(dirPath);
        totalSize += size;
        
        if (size > 0 || options.verbose) {
            const sizeStr = size > 0 ? formatBytes(size) : chalk.gray('empty');
            console.log(chalk.white(`  ${dir.name.padEnd(16)} `) + sizeStr);
        }
    }

    console.log(chalk.white('  ────────────────────'));
    console.log(chalk.white('  Total:           ') + chalk.yellow(formatBytes(totalSize)));

    // World saves
    const savesPath = path.join(instancePath, 'saves');
    if (fs.existsSync(savesPath)) {
        const saves = fs.readdirSync(savesPath, { withFileTypes: true })
            .filter(d => d.isDirectory());
        
        if (saves.length > 0) {
            console.log();
            console.log(chalk.cyan('🌍 World Saves'));
            console.log(chalk.white('  Worlds:          ') + chalk.yellow(saves.length));
            
            if (options.verbose) {
                for (const save of saves) {
                    const savePath = path.join(savesPath, save.name);
                    const size = getDirSize(savePath);
                    console.log(chalk.gray(`    - ${save.name} (${formatBytes(size)})`));
                }
            }
        }
    }

    // Config version warning
    if (!config.configVersion || config.configVersion < CONFIG_VERSION) {
        console.log();
        console.log(chalk.yellow('⚠️  This instance uses an older config format.'));
        console.log(chalk.gray('   Run "mcpkg upgrade" to update to the latest format.'));
    }

    console.log();
}

export default { instanceInfo, CONFIG_VERSION };
