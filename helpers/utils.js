import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { USER_AGENT, PAGE_SIZE, NEXT_PAGE, PREV_PAGE } from './constants.js';

// ============================================
// HTTP Utilities
// ============================================

/**
 * Fetch JSON from URL with proper user agent
 */
export async function fetchJson(url) {
    const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
}

/**
 * Download a file with optional progress indication
 * @param {string} url - URL to download from
 * @param {string} destPath - Destination file path
 * @param {string} [description] - Optional description for progress display
 * @param {boolean} [showProgress=true] - Whether to show progress
 */
export async function downloadFile(url, destPath, description = null, showProgress = true) {
    const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const totalSize = parseInt(response.headers.get('content-length') || '0');
    const fileStream = fs.createWriteStream(destPath);

    if (showProgress && description && totalSize > 0) {
        let downloadedSize = 0;
        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            downloadedSize += value.length;
            const percent = Math.round((downloadedSize / totalSize) * 100);
            process.stdout.write(`\r${chalk.gray(`   ${description}: ${percent}%`)}`);

            fileStream.write(Buffer.from(value));
        }
        process.stdout.write('\n');
        fileStream.end();
    } else {
        await pipeline(Readable.fromWeb(response.body), fileStream);
        if (showProgress && description) {
            console.log(chalk.gray(`   ${description}: Done`));
        }
    }
}

// ============================================
// Instance Config Utilities
// ============================================

/**
 * Load mcconfig.json from an instance directory
 * @param {string} instancePath - Path to instance directory
 * @returns {object|null} - Config object or null if not found
 */
export function loadConfig(instancePath) {
    const configPath = path.join(instancePath, 'mcconfig.json');
    if (!fs.existsSync(configPath)) {
        return null;
    }
    try {
        const content = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

/**
 * Save mcconfig.json to an instance directory
 * @param {string} instancePath - Path to instance directory
 * @param {object} config - Config object to save
 */
export function saveConfig(instancePath, config) {
    const configPath = path.join(instancePath, 'mcconfig.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * Get instance path from options or current directory
 * @param {object} options - Command options
 * @returns {string} - Resolved instance path
 */
export function getInstancePath(options) {
    return options?.instance ? path.resolve(options.instance) : process.cwd();
}

/**
 * Load config with error handling and user feedback
 * @param {string} instancePath - Path to instance directory
 * @returns {object|null} - Config object or null with error printed
 */
export function requireConfig(instancePath) {
    const config = loadConfig(instancePath);
    if (!config) {
        console.log(chalk.red('Error: No mcconfig.json found.'));
        console.log(chalk.gray('Make sure you are in a Minecraft instance directory or use --instance <path>'));
        return null;
    }
    return config;
}

// ============================================
// Maven/Library Utilities
// ============================================

/**
 * Convert Maven coordinate to file path
 * e.g., "org.ow2.asm:asm:9.9" -> "org/ow2/asm/asm/9.9/asm-9.9.jar"
 * @param {string} name - Maven coordinate
 * @returns {string|null} - File path or null if invalid
 */
export function mavenToPath(name) {
    const parts = name.split(':');
    if (parts.length < 3) return null;

    const [group, artifact, version] = parts;
    const classifier = parts.length > 3 ? `-${parts[3]}` : '';
    const groupPath = group.replace(/\./g, '/');

    return `${groupPath}/${artifact}/${version}/${artifact}-${version}${classifier}.jar`;
}

// ============================================
// UI Utilities
// ============================================

/**
 * Paginated selection prompt for large lists
 * @param {string} message - Prompt message
 * @param {Array} allChoices - All choices to paginate
 * @param {Function} [getChoiceDisplay] - Function to get display text for a choice
 * @returns {Promise<any>} - Selected value
 */
export async function paginatedSelect(message, allChoices, getChoiceDisplay = (c) => c) {
    let currentPage = 0;
    const totalPages = Math.ceil(allChoices.length / PAGE_SIZE);

    while (true) {
        const startIdx = currentPage * PAGE_SIZE;
        const endIdx = Math.min(startIdx + PAGE_SIZE, allChoices.length);
        const pageChoices = allChoices.slice(startIdx, endIdx);

        // Build choices for this page
        const choices = pageChoices.map((choice) => ({
            name: typeof choice === 'object' && choice.name ? choice.name : getChoiceDisplay(choice),
            value: typeof choice === 'object' && choice.value !== undefined ? choice.value : choice
        }));

        // Add navigation options
        if (currentPage > 0) {
            choices.push({ name: chalk.cyan('← Previous page'), value: PREV_PAGE });
        }
        if (currentPage < totalPages - 1) {
            choices.push({ name: chalk.cyan('→ Next page'), value: NEXT_PAGE });
        }

        const pageInfo = totalPages > 1 ? ` (page ${currentPage + 1}/${totalPages})` : '';

        const { selection } = await inquirer.prompt([
            {
                type: 'rawlist',
                name: 'selection',
                message: `${message}${pageInfo}`,
                choices: choices
            }
        ]);

        if (selection === NEXT_PAGE) {
            currentPage++;
            continue;
        } else if (selection === PREV_PAGE) {
            currentPage--;
            continue;
        }

        return selection;
    }
}

// ============================================
// Formatting Utilities
// ============================================

/**
 * Format bytes to human readable string
 * @param {number} bytes - Byte count
 * @returns {string} - Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format download count for display
 * @param {number} count - Download count
 * @returns {string} - Formatted string (e.g., "1.5M")
 */
export function formatDownloads(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

/**
 * Format ISO date string to readable format
 * @param {string} isoString - ISO date string
 * @returns {string} - Formatted date string
 */
export function formatDate(isoString) {
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

// ============================================
// File System Utilities
// ============================================

/**
 * Get directory size recursively
 * @param {string} dirPath - Directory path
 * @returns {number} - Size in bytes
 */
export function getDirSize(dirPath) {
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

/**
 * Count files in directory recursively
 * @param {string} dirPath - Directory path
 * @param {string} [extension] - Optional extension filter
 * @returns {number} - File count
 */
export function countFiles(dirPath, extension = null) {
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

/**
 * Parse a value string into appropriate type (boolean, number, or string)
 * @param {string} value - Value to parse
 * @returns {boolean|number|string|null} - Parsed value
 */
export function parseValue(value) {
    if (value === 'null' || value === 'auto') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(value) && value !== '') return parseFloat(value);
    return value;
}

export default {
    fetchJson,
    downloadFile,
    loadConfig,
    saveConfig,
    getInstancePath,
    requireConfig,
    mavenToPath,
    paginatedSelect,
    formatBytes,
    formatDownloads,
    formatDate,
    getDirSize,
    countFiles,
    parseValue
};
