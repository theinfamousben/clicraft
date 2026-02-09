import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { downloadFile, loadConfig, saveConfig, getInstancePath } from '../helpers/utils.js';
import { getProject, getProjectVersions } from '../helpers/modrinth.js';
import { callPostCommandActions } from '../helpers/post-command.js';

// Dynamic import for adm-zip
let AdmZip;

async function loadAdmZip() {
    if (!AdmZip) {
        try {
            const module = await import('adm-zip');
            AdmZip = module.default;
        } catch {
            console.log(chalk.red('Error: adm-zip package is required for modpack import.'));
            console.log(chalk.gray('Run: npm install -g adm-zip'));
            process.exit(1);
        }
    }
    return AdmZip;
}

export async function importModpack(packPath, options) {
    // Expand ~ to home directory
    if (packPath.startsWith('~')) {
        packPath = path.join(process.env.HOME, packPath.slice(1));
    }

    // Validate file exists
    if (!fs.existsSync(packPath)) {
        console.log(chalk.red(`Error: File not found: ${packPath}`));
        return;
    }

    const ext = path.extname(packPath).toLowerCase();
    if (ext !== '.mrpack') {
        console.log(chalk.red(`Error: Unsupported modpack format: ${ext}`));
        console.log(chalk.gray('Currently supported: .mrpack (Modrinth modpacks)'));
        return;
    }

    await importMrpack(packPath, options);
}

async function importMrpack(packPath, options) {
    console.log(chalk.cyan(`\n📦 Importing Modrinth modpack...`));
    console.log(chalk.gray(`   ${packPath}\n`));

    const Zip = await loadAdmZip();
    
    let zip;
    try {
        zip = new Zip(packPath);
    } catch (error) {
        console.log(chalk.red(`Error: Failed to open modpack: ${error.message}`));
        return;
    }

    // Read modrinth.index.json
    const indexEntry = zip.getEntry('modrinth.index.json');
    if (!indexEntry) {
        console.log(chalk.red('Error: Invalid modpack - missing modrinth.index.json'));
        return;
    }

    let packIndex;
    try {
        packIndex = JSON.parse(zip.readAsText(indexEntry));
    } catch (error) {
        console.log(chalk.red(`Error: Failed to parse modpack index: ${error.message}`));
        return;
    }

    console.log(chalk.white(`  Pack: ${packIndex.name}`));
    if (packIndex.versionId) {
        console.log(chalk.gray(`  Version: ${packIndex.versionId}`));
    }

    // Extract game info
    const mcVersion = packIndex.dependencies?.minecraft;
    const fabricVersion = packIndex.dependencies?.['fabric-loader'];
    const forgeVersion = packIndex.dependencies?.forge;
    const quiltVersion = packIndex.dependencies?.['quilt-loader'];
    const neoforgeVersion = packIndex.dependencies?.neoforge;

    let loader = 'fabric';
    let loaderVersion = fabricVersion;
    if (forgeVersion) {
        loader = 'forge';
        loaderVersion = forgeVersion;
    } else if (quiltVersion) {
        loader = 'quilt';
        loaderVersion = quiltVersion;
    } else if (neoforgeVersion) {
        loader = 'neoforge';
        loaderVersion = neoforgeVersion;
    }

    console.log(chalk.gray(`  Minecraft: ${mcVersion}`));
    console.log(chalk.gray(`  Loader: ${loader} ${loaderVersion || ''}`));
    console.log(chalk.gray(`  Files: ${packIndex.files?.length || 0}`));

    // Determine instance path
    let instancePath = getInstancePath(options);
    
    // If no instance specified, create one based on pack name
    if (!options.instance) {
        const packSlug = packIndex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        instancePath = path.join(process.cwd(), packSlug);
        
        if (fs.existsSync(instancePath) && !options.force) {
            console.log(chalk.red(`\nError: Directory already exists: ${instancePath}`));
            console.log(chalk.gray('Use -f/--force to overwrite, or -i to specify a different path.'));
            return;
        }
    }

    console.log(chalk.gray(`\n  Target: ${instancePath}`));

    // Create instance directory structure
    const modsDir = path.join(instancePath, 'mods');
    if (!fs.existsSync(modsDir)) {
        fs.mkdirSync(modsDir, { recursive: true });
    }

    // Create or load config
    let config = loadConfig(instancePath);
    if (!config) {
        config = {
            name: packIndex.name,
            minecraftVersion: mcVersion,
            modLoader: loader,
            loaderVersion: loaderVersion || null,
            mods: [],
            type: 'client'
        };
    } else {
        // Update existing config
        config.minecraftVersion = mcVersion;
        config.modLoader = loader;
        config.loaderVersion = loaderVersion || null;
    }

    // Process mod files
    const files = packIndex.files || [];
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    console.log(chalk.cyan(`\n📥 Downloading ${files.length} files...\n`));

    for (const file of files) {
        const fileName = path.basename(file.path);
        const destPath = path.join(instancePath, file.path);
        const destDir = path.dirname(destPath);

        // Create destination directory if needed
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // Check if file already exists
        if (fs.existsSync(destPath) && !options.force) {
            console.log(chalk.gray(`  ⏭️  ${fileName} (exists)`));
            skipCount++;
            continue;
        }

        // Try each download URL
        let downloaded = false;
        for (const url of file.downloads || []) {
            try {
                process.stdout.write(chalk.gray(`  📥 ${fileName}...`));
                await downloadFile(url, destPath);
                console.log(chalk.green(` ✓`));
                downloaded = true;
                successCount++;

                // Extract mod info from Modrinth URLs
                if (url.includes('cdn.modrinth.com/data/')) {
                    const match = url.match(/data\/([^/]+)\/versions\/([^/]+)/);
                    if (match && file.path.startsWith('mods/')) {
                        const projectId = match[1];
                        const versionId = match[2];

                        // Try to get project info
                        try {
                            const project = await getProject(projectId);
                            if (project) {
                                // Check if already in config
                                const existingIndex = config.mods.findIndex(m => m.slug === project.slug);
                                const modEntry = {
                                    slug: project.slug,
                                    name: project.title,
                                    versionId: versionId,
                                    versionNumber: 'imported',
                                    fileName: fileName
                                };

                                if (existingIndex >= 0) {
                                    config.mods[existingIndex] = modEntry;
                                } else {
                                    config.mods.push(modEntry);
                                }
                            }
                        } catch {
                            // Ignore project lookup errors
                        }
                    }
                }
                break;
            } catch (error) {
                // Try next URL
            }
        }

        if (!downloaded) {
            console.log(chalk.red(`  ❌ ${fileName} (download failed)`));
            failCount++;
        }
    }

    // Extract overrides folder
    const overridesEntry = zip.getEntries().filter(e => 
        e.entryName.startsWith('overrides/') || e.entryName.startsWith('client-overrides/')
    );

    if (overridesEntry.length > 0) {
        console.log(chalk.cyan(`\n📁 Extracting ${overridesEntry.length} override files...`));
        
        for (const entry of overridesEntry) {
            if (entry.isDirectory) continue;
            
            // Remove 'overrides/' or 'client-overrides/' prefix
            let relativePath = entry.entryName;
            if (relativePath.startsWith('overrides/')) {
                relativePath = relativePath.slice('overrides/'.length);
            } else if (relativePath.startsWith('client-overrides/')) {
                relativePath = relativePath.slice('client-overrides/'.length);
            }

            const destPath = path.join(instancePath, relativePath);
            const destDir = path.dirname(destPath);

            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            try {
                fs.writeFileSync(destPath, entry.getData());
            } catch {
                // Ignore extraction errors for overrides
            }
        }
    }

    // Save config
    saveConfig(instancePath, config);

    // Summary
    console.log(chalk.cyan('\n📊 Import Summary:'));
    console.log(chalk.green(`   ✅ ${successCount} files downloaded`));
    if (skipCount > 0) {
        console.log(chalk.gray(`   ⏭️  ${skipCount} files skipped (already exist)`));
    }
    if (failCount > 0) {
        console.log(chalk.red(`   ❌ ${failCount} files failed`));
    }
    console.log(chalk.gray(`   📝 ${config.mods.length} mods tracked in mcconfig.json`));

    console.log(chalk.green(`\n✅ Modpack imported to ${instancePath}`));
    console.log(chalk.gray(`   cd ${instancePath}`));
    console.log(chalk.gray(`   clicraft launch`));

    callPostCommandActions();
}
