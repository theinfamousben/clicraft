import fs from 'fs';
import path from 'path';
import { fetchJson, downloadFile } from './utils.js';
import { MODRINTH_API, USER_AGENT } from './constants.js';

/**
 * Get project info from Modrinth
 * @param {string} slugOrId - Project slug or ID
 * @returns {Promise<object|null>} - Project data or null if not found
 */
export async function getProject(slugOrId) {
    try {
        return await fetchJson(`${MODRINTH_API}/project/${slugOrId}`);
    } catch (error) {
        if (error.message.includes('404')) {
            return null;
        }
        throw error;
    }
}

/**
 * Get project versions from Modrinth
 * @param {string} slugOrId - Project slug or ID
 * @param {string} [mcVersion] - Filter by Minecraft version
 * @param {string} [loader] - Filter by mod loader
 * @returns {Promise<Array>} - Array of version objects
 */
export async function getProjectVersions(slugOrId, mcVersion = null, loader = null) {
    const params = new URLSearchParams();
    if (mcVersion) {
        params.set('game_versions', JSON.stringify([mcVersion]));
    }
    if (loader) {
        params.set('loaders', JSON.stringify([loader]));
    }

    const query = params.toString();
    const url = `${MODRINTH_API}/project/${slugOrId}/version${query ? '?' + query : ''}`;
    return await fetchJson(url);
}

/**
 * Search for mods on Modrinth
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @param {number} [options.limit=10] - Max results
 * @param {string} [options.version] - Minecraft version filter
 * @param {string} [options.loader] - Mod loader filter
 * @returns {Promise<object>} - Search results
 */
export async function searchMods(query, options = {}) {
    const params = new URLSearchParams({
        query: query,
        limit: options.limit || 10,
        facets: JSON.stringify([['project_type:mod']])
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

    return await fetchJson(`${MODRINTH_API}/search?${params}`);
}

/**
 * Download a mod from Modrinth
 * @param {string} projectId - Modrinth project ID
 * @param {string} mcVersion - Minecraft version
 * @param {string} loader - Mod loader (fabric, forge, etc.)
 * @param {string} modsPath - Path to mods directory
 * @returns {Promise<object|null>} - Mod info object or null if failed
 */
export async function downloadMod(projectId, mcVersion, loader, modsPath) {
    // Get project info
    const project = await getProject(projectId);
    if (!project) {
        return null;
    }

    // Get compatible versions
    const versions = await getProjectVersions(projectId, mcVersion, loader);
    if (versions.length === 0) {
        return null;
    }

    // Use the latest compatible version
    const modVersion = versions[0];
    const file = modVersion.files.find(f => f.primary) || modVersion.files[0];

    if (!file) {
        return null;
    }

    // Download the file
    const destPath = path.join(modsPath, file.filename);
    await downloadFile(file.url, destPath, project.title);

    return {
        projectId: project.id,
        slug: project.slug,
        name: project.title,
        versionId: modVersion.id,
        versionNumber: modVersion.version_number,
        fileName: file.filename,
        installedAt: new Date().toISOString()
    };
}

/**
 * Find mod in config by slug, name, or project ID
 * @param {Array} mods - Array of mod objects
 * @param {string} query - Search query
 * @returns {object|undefined} - Found mod or undefined
 */
export function findMod(mods, query) {
    const lowerQuery = query.toLowerCase();
    return mods.find(m =>
        m.slug.toLowerCase() === lowerQuery ||
        m.name.toLowerCase() === lowerQuery ||
        m.projectId === query
    );
}

export default {
    getProject,
    getProjectVersions,
    searchMods,
    downloadMod,
    findMod
};
