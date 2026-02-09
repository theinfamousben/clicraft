import chalk from 'chalk';
import os from 'os';
import path from 'path';
import { searchMods as searchModrinth } from '../helpers/modrinth.js';
import { formatDownloads, loadConfig, getInstancePath } from '../helpers/utils.js';
import { callPostCommandActions } from '../helpers/post-command.js';

// Expand ~ to home directory
function expandHome(filePath) {
    if (filePath.startsWith('~/') || filePath === '~') {
        return path.join(os.homedir(), filePath.slice(1));
    }
    return filePath;
}

export async function searchMods(query, options) {
    if (!query) {
        console.log(chalk.red('Error: Please provide a search query'));
        console.log(chalk.gray('Usage: clicraft search <query> [options]'));
        return;
    }

    // Validate limit is a positive integer
    const limit = parseInt(options.limit, 10);
    if (isNaN(limit) || limit < 1) {
        console.log(chalk.red('Error: --limit must be a positive number'));
        return;
    }

    // Determine project type
    let projectType = 'mod';
    let projectTypeLabel = 'mods';
    if (options.resourcepacks) {
        projectType = 'resourcepack';
        projectTypeLabel = 'resource packs';
    } else if (options.shaders) {
        projectType = 'shader';
        projectTypeLabel = 'shaders';
    }

    // Determine version and loader filters
    let targetVersion = options.mcVersion || null;
    let targetLoader = options.loader || null;
    let instanceName = null;

    // Try to load instance config if -i flag is provided or if in an instance directory
    if (!options.any) {
        let config = null;
        
        if (options.instance) {
            // Explicit instance path provided - expand ~ if present
            const instancePath = expandHome(options.instance);
            config = loadConfig(instancePath);
            if (!config) {
                console.log(chalk.yellow(`Warning: No mcconfig.json found at ${instancePath}`));
            }
        } else {
            // Try current directory
            try {
                const instancePath = getInstancePath({});
                config = loadConfig(instancePath);
            } catch {
                // Not in an instance directory, that's fine
            }
        }

        if (config) {
            instanceName = config.name;
            // Only use config values if not overridden by flags
            if (!targetVersion) targetVersion = config.minecraftVersion;
            if (!targetLoader) targetLoader = config.modLoader;
        }
    }

    // Build search description
    let searchDesc = `Searching for ${projectTypeLabel}: "${query}"`;
    if (targetVersion || targetLoader) {
        const filters = [];
        if (targetLoader) filters.push(targetLoader);
        if (targetVersion) filters.push(`MC ${targetVersion}`);
        searchDesc += ` (${filters.join(', ')})`;
        if (instanceName) searchDesc += ` for ${instanceName}`;
    }
    console.log(chalk.cyan(`\n🔍 ${searchDesc}...\n`));

    try {
        const results = await searchModrinth(query, {
            limit: limit,
            version: targetVersion,
            loader: targetLoader,
            type: projectType
        });

        if (results.hits.length === 0) {
            console.log(chalk.yellow(`No ${projectTypeLabel} found matching your search.`));
            return;
        }

        console.log(chalk.gray(`Found ${results.total_hits} results (showing ${results.hits.length}):\n`));

        results.hits.forEach((item, index) => {
            const downloads = formatDownloads(item.downloads);
            const loaders = item.categories?.filter(c => 
                ['fabric', 'forge', 'quilt', 'neoforge'].includes(c)
            ).join(', ') || 'Unknown';
            
            console.log(chalk.bold.white(`${index + 1}. ${item.title}`));
            console.log(chalk.gray(`   Slug: ${chalk.cyan(item.slug)}`));
            console.log(chalk.gray(`   ${item.description}`));
            
            // Show loaders only for mods and shaders
            if (projectType === 'mod') {
                console.log(chalk.gray(`   📥 ${chalk.green(downloads)} downloads  |  🔧 ${chalk.yellow(loaders)}`));
            } else {
                console.log(chalk.gray(`   📥 ${chalk.green(downloads)} downloads`));
            }
            
            console.log(chalk.gray(`   🔗 https://modrinth.com/${projectType}/${item.slug}`));
            console.log();
        });

    } catch (error) {
        console.error(chalk.red('Error searching Modrinth:'), error.message);
        if (options.verbose) {
            console.error(error);
        }
    }

    callPostCommandActions();
}

export default { searchMods };
