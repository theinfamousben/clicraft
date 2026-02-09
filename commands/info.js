import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { 
    loadConfig, 
    getInstancePath, 
    requireConfig, 
    formatBytes, 
    formatDate, 
    getDirSize 
} from '../helpers/utils.js';
import { checkJavaCompatibility, detectJavaVersion } from '../helpers/java.js';
import { callPostCommandActions } from '../helpers/post-command.js';

export async function instanceInfo(options) {
    const instancePath = getInstancePath(options);
    
    const config = requireConfig(instancePath);
    if (!config) return;

    // Mods-only mode
    if (options.mods) {
        const installedMods = config.mods || [];
        if (installedMods.length > 0) {
            console.log(chalk.cyan('\n📦 Installed Mods\n'));
            for (const mod of installedMods) {
                console.log(chalk.gray(`    - ${mod.name} (${mod.fileName}) [${mod.versionNumber}]`));
            }
        } else {
            console.log(chalk.yellow('\nNo mods are currently installed in this instance.\n'));
        }
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

    console.log(chalk.white('  Location:        ') + chalk.gray(instancePath));

    // Java compatibility check
    const java = detectJavaVersion();
    const javaCompat = checkJavaCompatibility(config.minecraftVersion);
    
    console.log();
    console.log(chalk.cyan('☕ Java'));
    if (java.version) {
        console.log(chalk.white('  Installed:       ') + chalk.gray(`Java ${java.version} (${java.fullVersion})`));
        console.log(chalk.white('  Required:        ') + chalk.gray(`Java ${javaCompat.required}+`));
        if (javaCompat.compatible) {
            console.log(chalk.white('  Status:          ') + chalk.green('✓ Compatible'));
        } else {
            console.log(chalk.white('  Status:          ') + chalk.red(`✗ Incompatible (need Java ${javaCompat.required})`));
        }
    } else {
        console.log(chalk.white('  Status:          ') + chalk.red('✗ Java not found'));
        console.log(chalk.gray('  Install Java from https://adoptium.net/'));
    }

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
        { name: 'Mods', path: 'mods' },
        { name: 'Versions', path: 'versions' },
        { name: 'Saves', path: 'saves' }
    ];

    let totalSize = 0;
    for (const dir of directories) {
        const dirPath = path.join(instancePath, dir.path);
        const size = getDirSize(dirPath);
        totalSize += size;
        if (size > 0) {
            console.log(chalk.white(`  ${dir.name}:`.padEnd(16)) + chalk.gray(formatBytes(size)));
        }
    }
    console.log(chalk.white('  Total:'.padEnd(16)) + chalk.yellow(formatBytes(totalSize)));

    // World saves
    const savesPath = path.join(instancePath, 'saves');
    if (fs.existsSync(savesPath)) {
        const saves = fs.readdirSync(savesPath, { withFileTypes: true })
            .filter(d => d.isDirectory());
        if (saves.length > 0) {
            console.log();
            console.log(chalk.cyan('🌍 Worlds'));
            console.log(chalk.white('  Save Count:      ') + chalk.yellow(saves.length));
            if (options.verbose) {
                for (const save of saves) {
                    console.log(chalk.gray(`    - ${save.name}`));
                }
            }
        }
    }

    console.log();

    callPostCommandActions();
}

export default { instanceInfo };
