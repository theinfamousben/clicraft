import chalk from 'chalk';
import { searchMods as searchModrinth } from '../helpers/modrinth.js';
import { formatDownloads } from '../helpers/utils.js';
import { callPostCommandActions } from '../helpers/post-command.js';

export async function searchMods(query, options) {
    if (!query) {
        console.log(chalk.red('Error: Please provide a search query'));
        console.log(chalk.gray('Usage: clicraft search <query> [options]'));
        return;
    }

    console.log(chalk.cyan(`\n🔍 Searching for "${query}" on Modrinth...\n`));

    try {
        const results = await searchModrinth(query, {
            limit: options.limit || 10,
            version: options.version,
            loader: options.loader
        });

        if (results.hits.length === 0) {
            console.log(chalk.yellow('No mods found matching your search.'));
            return;
        }

        console.log(chalk.gray(`Found ${results.total_hits} results (showing ${results.hits.length}):\n`));

        results.hits.forEach((mod, index) => {
            const downloads = formatDownloads(mod.downloads);
            const loaders = mod.categories?.filter(c => 
                ['fabric', 'forge', 'quilt', 'neoforge'].includes(c)
            ).join(', ') || 'Unknown';
            
            console.log(chalk.bold.white(`${index + 1}. ${mod.title}`));
            console.log(chalk.gray(`   Slug: ${chalk.cyan(mod.slug)}`));
            console.log(chalk.gray(`   ${mod.description}`));
            console.log(chalk.gray(`   📥 ${chalk.green(downloads)} downloads  |  🔧 ${chalk.yellow(loaders)}`));
            console.log(chalk.gray(`   🔗 https://modrinth.com/mod/${mod.slug}`));
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
