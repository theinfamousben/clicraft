import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Minecraft version to required Java version mapping
const JAVA_REQUIREMENTS = {
    // 1.21+ requires Java 21
    '1.21': 21,
    // 1.18-1.20.x requires Java 17
    '1.18': 17, '1.19': 17, '1.20': 17,
    // 1.17 requires Java 16
    '1.17': 16,
    // 1.12-1.16 requires Java 8
    '1.12': 8, '1.13': 8, '1.14': 8, '1.15': 8, '1.16': 8,
    // Older versions (fallback to Java 8)
    'default': 8
};

/**
 * Get the required Java version for a Minecraft version
 * @param {string} mcVersion - Minecraft version (e.g., "1.21.11")
 * @returns {number} - Required Java major version
 */
export function getRequiredJavaVersion(mcVersion) {
    // Extract major.minor from version (e.g., "1.21" from "1.21.11")
    const parts = mcVersion.split('.');
    const majorMinor = `${parts[0]}.${parts[1]}`;
    
    // Find matching requirement
    for (const [prefix, version] of Object.entries(JAVA_REQUIREMENTS)) {
        if (majorMinor.startsWith(prefix)) {
            return version;
        }
    }
    
    return JAVA_REQUIREMENTS.default;
}

/**
 * Detect installed Java version
 * @returns {{ version: number|null, path: string|null, fullVersion: string|null }}
 */
export function detectJavaVersion() {
    const javaCommands = ['java'];
    
    // Also check JAVA_HOME
    if (process.env.JAVA_HOME) {
        const javaPath = path.join(process.env.JAVA_HOME, 'bin', 'java');
        if (fs.existsSync(javaPath)) {
            javaCommands.unshift(javaPath);
        }
    }

    for (const javaCmd of javaCommands) {
        try {
            const output = execSync(`${javaCmd} -version 2>&1`, { encoding: 'utf8' });
            const match = output.match(/version "(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
            
            if (match) {
                // Java 8 and earlier use "1.8.x", Java 9+ use "17.x"
                let majorVersion;
                if (match[1] === '1') {
                    majorVersion = parseInt(match[2], 10);
                } else {
                    majorVersion = parseInt(match[1], 10);
                }

                // Extract full version string
                const fullMatch = output.match(/version "([^"]+)"/);
                const fullVersion = fullMatch ? fullMatch[1] : match[0];

                return {
                    version: majorVersion,
                    path: javaCmd === 'java' ? 'java (PATH)' : javaCmd,
                    fullVersion: fullVersion
                };
            }
        } catch {
            // Continue to next command
        }
    }

    return { version: null, path: null, fullVersion: null };
}

/**
 * Check Java compatibility for a Minecraft version
 * @param {string} mcVersion - Minecraft version
 * @returns {{ compatible: boolean, installed: number|null, required: number, message: string }}
 */
export function checkJavaCompatibility(mcVersion) {
    const required = getRequiredJavaVersion(mcVersion);
    const { version: installed, fullVersion } = detectJavaVersion();

    if (installed === null) {
        return {
            compatible: false,
            installed: null,
            required,
            message: `Java not found. Minecraft ${mcVersion} requires Java ${required}.`
        };
    }

    if (installed < required) {
        return {
            compatible: false,
            installed,
            required,
            message: `Java ${installed} detected. Minecraft ${mcVersion} requires Java ${required}.`
        };
    }

    return {
        compatible: true,
        installed,
        required,
        fullVersion,
        message: `Java ${installed} (${fullVersion}) is compatible with Minecraft ${mcVersion}.`
    };
}

/**
 * Print Java compatibility info/warning
 * @param {string} mcVersion - Minecraft version
 * @param {boolean} verbose - Show even if compatible
 */
export function printJavaInfo(mcVersion, verbose = false) {
    const result = checkJavaCompatibility(mcVersion);

    if (!result.compatible) {
        console.log(chalk.red(`\n⚠️  ${result.message}`));
        console.log(chalk.gray(`   Install Java ${result.required} from https://adoptium.net/`));
        return false;
    }

    if (verbose) {
        console.log(chalk.green(`✓ ${result.message}`));
    }

    return true;
}

export default {
    getRequiredJavaVersion,
    detectJavaVersion,
    checkJavaCompatibility,
    printJavaInfo
};
