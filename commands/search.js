import chalk from 'chalk';

const MODRINTH_API = 'https://api.modrinth.com/v2';

// Search for mods on Modrinth
async function searchModrinth(query, options = {}) {
    const params = new URLSearchParams({
        query: query,
        limit: options.limit || 10,
        facets: JSON.stringify([
            ['project_type:mod']
        ])
    });

    // Add version filter if specified
    if (options.version) {
        const facets = JSON.parse(params.get('facets'));
        facets.push([`versions:${options.version}`]);
        params.set('facets', JSON.stringify(facets));
    }

    // Add loader filter if specified
    if (options.loader) {
        const facets = JSON.parse(params.get('facets'));
        facets.push([`categories:${options.loader}`]);
        params.set('facets', JSON.stringify(facets));
    }

    const response = await fetch(`${MODRINTH_API}/search?${params}`, {
        headers: {
            'User-Agent': 'mcpkg/0.1.0 (https://github.com/theinfamousben/mcpkg)'
        }
    });

    if (!response.ok) {
        throw new Error(`Modrinth API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

// Format download count for display
function formatDownloads(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

export async function searchMods(query, options) {
    if (!query) {
        console.log(chalk.red('Error: Please provide a search query'));
        console.log(chalk.gray('Usage: mcpkg search <query> [options]'));
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
            const loaders = mod.categories?.filter(c => ['fabric', 'forge', 'quilt', 'neoforge'].includes(c)).join(', ') || 'Unknown';
            
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
}

export default { searchMods };
