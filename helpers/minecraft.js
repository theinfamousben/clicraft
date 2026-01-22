import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fetchJson, downloadFile, mavenToPath } from './utils.js';
import { 
    MOJANG_VERSION_MANIFEST, 
    MOJANG_RESOURCES, 
    FABRIC_META, 
    FABRIC_MAVEN,
    FORGE_PROMOS,
    FORGE_MAVEN,
    USER_AGENT 
} from './constants.js';

// ============================================
// Mojang/Minecraft APIs
// ============================================

/**
 * Fetch available Minecraft versions (releases only)
 * @returns {Promise<Array>} - Array of version objects
 */
export async function fetchMinecraftVersions() {
    const data = await fetchJson(MOJANG_VERSION_MANIFEST);
    return data.versions.filter(v => v.type === 'release');
}

/**
 * Get version manifest for a specific Minecraft version
 * @param {string} mcVersion - Minecraft version
 * @returns {Promise<object>} - Version manifest data
 */
export async function getVersionManifest(mcVersion) {
    const manifest = await fetchJson(MOJANG_VERSION_MANIFEST);
    const versionEntry = manifest.versions.find(v => v.id === mcVersion);
    if (!versionEntry) {
        throw new Error(`Minecraft version ${mcVersion} not found`);
    }
    return await fetchJson(versionEntry.url);
}

// ============================================
// Fabric APIs
// ============================================

/**
 * Fetch Fabric loader versions
 * @returns {Promise<Array<string>>} - Array of version strings
 */
export async function fetchFabricLoaderVersions() {
    const data = await fetchJson(`${FABRIC_META}/versions/loader`);
    return data.map(v => v.version);
}

/**
 * Fetch Fabric-supported game versions
 * @returns {Promise<Array<string>>} - Array of stable Minecraft versions
 */
export async function fetchFabricGameVersions() {
    const data = await fetchJson(`${FABRIC_META}/versions/game`);
    return data.filter(v => v.stable).map(v => v.version);
}

/**
 * Fetch Fabric profile JSON for a version
 * @param {string} mcVersion - Minecraft version
 * @param {string} loaderVersion - Fabric loader version
 * @returns {Promise<object>} - Fabric profile data
 */
export async function fetchFabricProfile(mcVersion, loaderVersion) {
    return await fetchJson(`${FABRIC_META}/versions/loader/${mcVersion}/${loaderVersion}/profile/json`);
}

/**
 * Fetch Fabric installer versions
 * @returns {Promise<Array>} - Array of installer version objects
 */
export async function fetchFabricInstallerVersions() {
    return await fetchJson(`${FABRIC_META}/versions/installer`);
}

// ============================================
// Forge APIs
// ============================================

/**
 * Fetch Forge versions for a specific Minecraft version
 * @param {string} mcVersion - Minecraft version
 * @returns {Promise<Array>} - Array of Forge version objects
 */
export async function fetchForgeVersions(mcVersion) {
    const data = await fetchJson(FORGE_PROMOS);
    const versions = [];
    for (const [key, value] of Object.entries(data.promos)) {
        if (key.startsWith(mcVersion)) {
            versions.push({ label: key, version: value });
        }
    }
    return versions;
}

/**
 * Fetch all Forge-supported Minecraft versions
 * @returns {Promise<Array<string>>} - Array of Minecraft versions
 */
export async function fetchForgeGameVersions() {
    const data = await fetchJson(FORGE_PROMOS);
    const mcVersions = new Set();
    for (const key of Object.keys(data.promos)) {
        const mcVersion = key.split('-')[0];
        mcVersions.add(mcVersion);
    }
    return Array.from(mcVersions).sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aVal = aParts[i] || 0;
            const bVal = bParts[i] || 0;
            if (aVal !== bVal) return bVal - aVal;
        }
        return 0;
    });
}

// ============================================
// Library Download
// ============================================

/**
 * Check if library applies to current OS
 * @param {object} lib - Library object with rules
 * @returns {boolean} - Whether library should be used
 */
function checkLibraryRules(lib) {
    if (!lib.rules) return true;
    
    const osName = process.platform === 'darwin' ? 'osx' :
                   process.platform === 'win32' ? 'windows' : 'linux';
    
    return lib.rules.some(rule => {
        if (rule.os && rule.os.name) {
            return rule.action === 'allow' && rule.os.name === osName;
        }
        return rule.action === 'allow';
    });
}

/**
 * Download libraries from version data
 * @param {object} versionData - Version manifest data
 * @param {string} instancePath - Instance directory path
 */
export async function downloadLibraries(versionData, instancePath) {
    const librariesPath = path.join(instancePath, 'libraries');
    fs.mkdirSync(librariesPath, { recursive: true });

    const libraries = versionData.libraries || [];
    const applicableLibs = libraries.filter(checkLibraryRules);
    let downloadCount = 0;

    for (const lib of applicableLibs) {
        let libPath = null;
        let downloadUrl = null;

        // Format 1: downloads.artifact (vanilla Minecraft)
        if (lib.downloads?.artifact) {
            const artifact = lib.downloads.artifact;
            libPath = path.join(librariesPath, artifact.path);
            downloadUrl = artifact.url;
        }
        // Format 2: name with Maven coordinates + url (Fabric/Forge)
        else if (lib.name && lib.url) {
            const relativePath = mavenToPath(lib.name);
            if (relativePath) {
                libPath = path.join(librariesPath, relativePath);
                downloadUrl = lib.url + relativePath;
            }
        }
        // Format 3: name only (defaults to Fabric Maven)
        else if (lib.name) {
            const relativePath = mavenToPath(lib.name);
            if (relativePath) {
                libPath = path.join(librariesPath, relativePath);
                downloadUrl = `${FABRIC_MAVEN}/${relativePath}`;
            }
        }

        if (libPath && downloadUrl) {
            // Skip if already downloaded
            if (fs.existsSync(libPath)) {
                downloadCount++;
                continue;
            }

            fs.mkdirSync(path.dirname(libPath), { recursive: true });

            try {
                await downloadFile(downloadUrl, libPath, `Library ${++downloadCount}/${applicableLibs.length}`);
            } catch (err) {
                console.log(chalk.yellow(`   Warning: Failed to download ${lib.name}`));
            }
        }
    }
}

/**
 * Download assets from version data
 * @param {object} versionData - Version manifest data
 * @param {string} instancePath - Instance directory path
 */
export async function downloadAssets(versionData, instancePath) {
    const assetsPath = path.join(instancePath, 'assets');
    const indexesPath = path.join(assetsPath, 'indexes');
    const objectsPath = path.join(assetsPath, 'objects');

    fs.mkdirSync(indexesPath, { recursive: true });
    fs.mkdirSync(objectsPath, { recursive: true });

    // Download asset index
    const assetIndex = versionData.assetIndex;
    const indexPath = path.join(indexesPath, `${assetIndex.id}.json`);

    if (!fs.existsSync(indexPath)) {
        await downloadFile(assetIndex.url, indexPath, 'Asset index');
    }

    const assets = await fetchJson(assetIndex.url);
    const objects = Object.entries(assets.objects);

    console.log(chalk.gray(`   Downloading ${objects.length} assets...`));

    let downloaded = 0;
    for (const [name, obj] of objects) {
        const hash = obj.hash;
        const prefix = hash.substring(0, 2);
        const objectDir = path.join(objectsPath, prefix);
        const objectPath = path.join(objectDir, hash);

        if (fs.existsSync(objectPath)) {
            downloaded++;
            continue;
        }

        fs.mkdirSync(objectDir, { recursive: true });

        const url = `${MOJANG_RESOURCES}/${prefix}/${hash}`;
        try {
            const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                fs.writeFileSync(objectPath, Buffer.from(buffer));
            }
        } catch (err) {
            // Skip failed assets
        }

        downloaded++;
        process.stdout.write(`\r${chalk.gray(`   Assets: ${downloaded}/${objects.length}`)}`);
    }
    process.stdout.write(`\r${chalk.gray(`   Assets: ${downloaded}/${objects.length}`)}\n`);
}

/**
 * Build classpath from version data
 * @param {string} instancePath - Instance directory path
 * @param {object} versionData - Version manifest data
 * @returns {string} - Classpath string
 */
export function buildClasspath(instancePath, versionData) {
    const sep = process.platform === 'win32' ? ';' : ':';
    const librariesPath = path.join(instancePath, 'libraries');
    const classpath = [];

    for (const lib of versionData.libraries || []) {
        if (!checkLibraryRules(lib)) continue;

        let libPath = null;

        if (lib.downloads?.artifact) {
            libPath = path.join(librariesPath, lib.downloads.artifact.path);
        } else if (lib.name) {
            const relativePath = mavenToPath(lib.name);
            if (relativePath) {
                libPath = path.join(librariesPath, relativePath);
            }
        }

        if (libPath && fs.existsSync(libPath)) {
            classpath.push(libPath);
        }
    }

    return classpath.join(sep);
}

export default {
    fetchMinecraftVersions,
    getVersionManifest,
    fetchFabricLoaderVersions,
    fetchFabricGameVersions,
    fetchFabricProfile,
    fetchFabricInstallerVersions,
    fetchForgeVersions,
    fetchForgeGameVersions,
    downloadLibraries,
    downloadAssets,
    buildClasspath
};
