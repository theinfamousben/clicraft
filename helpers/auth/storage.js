import fs from 'fs';
import path from 'path';
import { getConfigDir } from '../config.js';

// Auth directory for storing multiple accounts
const CONFIG_DIR = getConfigDir();
const AUTH_DIR = path.join(CONFIG_DIR, 'auth');
const ACCOUNTS_FILE = path.join(AUTH_DIR, 'accounts.json');

// Ensure auth directory exists
function ensureAuthDir() {
    if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
    }
}

/**
 * Load all accounts data
 * @returns {{ accounts: Object.<string, AccountData>, currentAccount: string|null }}
 */
export function loadAccounts() {
    ensureAuthDir();
    if (fs.existsSync(ACCOUNTS_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
            return {
                accounts: data.accounts || {},
                currentAccount: data.currentAccount || null
            };
        } catch {
            return { accounts: {}, currentAccount: null };
        }
    }
    return { accounts: {}, currentAccount: null };
}

/**
 * Save accounts data
 * @param {{ accounts: Object, currentAccount: string|null }} data
 */
export function saveAccounts(data) {
    ensureAuthDir();
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Get the currently active account
 * @returns {AccountData|null}
 */
export function getCurrentAccount() {
    const data = loadAccounts();
    if (data.currentAccount && data.accounts[data.currentAccount]) {
        return data.accounts[data.currentAccount];
    }
    return null;
}

/**
 * Get account by UUID or username
 * @param {string} identifier - UUID or username
 * @returns {AccountData|null}
 */
export function getAccount(identifier) {
    const data = loadAccounts();
    const lowerIdentifier = identifier.toLowerCase();
    
    // Try UUID first
    if (data.accounts[identifier]) {
        return data.accounts[identifier];
    }
    
    // Try username (case-insensitive)
    for (const [uuid, account] of Object.entries(data.accounts)) {
        if (account.username.toLowerCase() === lowerIdentifier) {
            return account;
        }
    }
    
    return null;
}

/**
 * Add or update an account
 * @param {AccountData} accountData
 * @param {boolean} setAsCurrent - Whether to set as current account
 */
export function addAccount(accountData, setAsCurrent = true) {
    const data = loadAccounts();
    data.accounts[accountData.uuid] = accountData;
    
    if (setAsCurrent || !data.currentAccount) {
        data.currentAccount = accountData.uuid;
    }
    
    saveAccounts(data);
}

/**
 * Remove an account
 * @param {string} identifier - UUID or username
 * @returns {boolean} - Whether the account was removed
 */
export function removeAccount(identifier) {
    const data = loadAccounts();
    const lowerIdentifier = identifier.toLowerCase();
    
    let uuidToRemove = null;
    
    // Find by UUID
    if (data.accounts[identifier]) {
        uuidToRemove = identifier;
    } else {
        // Find by username
        for (const [uuid, account] of Object.entries(data.accounts)) {
            if (account.username.toLowerCase() === lowerIdentifier) {
                uuidToRemove = uuid;
                break;
            }
        }
    }
    
    if (!uuidToRemove) {
        return false;
    }
    
    const removedAccount = data.accounts[uuidToRemove];
    delete data.accounts[uuidToRemove];
    
    // If we removed the current account, switch to another one
    if (data.currentAccount === uuidToRemove) {
        const remaining = Object.keys(data.accounts);
        data.currentAccount = remaining.length > 0 ? remaining[0] : null;
    }
    
    saveAccounts(data);
    return removedAccount;
}

/**
 * Switch to a different account
 * @param {string} identifier - UUID or username
 * @returns {AccountData|null} - The account switched to, or null if not found
 */
export function switchAccount(identifier) {
    const data = loadAccounts();
    const lowerIdentifier = identifier.toLowerCase();
    
    let targetUuid = null;
    
    // Find by UUID
    if (data.accounts[identifier]) {
        targetUuid = identifier;
    } else {
        // Find by username
        for (const [uuid, account] of Object.entries(data.accounts)) {
            if (account.username.toLowerCase() === lowerIdentifier) {
                targetUuid = uuid;
                break;
            }
        }
    }
    
    if (!targetUuid) {
        return null;
    }
    
    data.currentAccount = targetUuid;
    saveAccounts(data);
    
    return data.accounts[targetUuid];
}

/**
 * Get all accounts
 * @returns {AccountData[]}
 */
export function getAllAccounts() {
    const data = loadAccounts();
    return Object.values(data.accounts);
}

/**
 * Get account count
 * @returns {number}
 */
export function getAccountCount() {
    const data = loadAccounts();
    return Object.keys(data.accounts).length;
}

/**
 * Check if an account exists
 * @param {string} identifier - UUID or username
 * @returns {boolean}
 */
export function accountExists(identifier) {
    return getAccount(identifier) !== null;
}

/**
 * Update account data (e.g., refresh token)
 * @param {string} uuid
 * @param {Partial<AccountData>} updates
 */
export function updateAccount(uuid, updates) {
    const data = loadAccounts();
    if (data.accounts[uuid]) {
        data.accounts[uuid] = { ...data.accounts[uuid], ...updates };
        saveAccounts(data);
    }
}

/**
 * Migrate from old auth.json format
 */
export function migrateFromLegacy() {
    const legacyFile = path.join(CONFIG_DIR, 'auth.json');
    
    if (fs.existsSync(legacyFile)) {
        try {
            const legacyAuth = JSON.parse(fs.readFileSync(legacyFile, 'utf-8'));
            
            if (legacyAuth.uuid && legacyAuth.username) {
                const data = loadAccounts();
                
                // Only migrate if not already present
                if (!data.accounts[legacyAuth.uuid]) {
                    data.accounts[legacyAuth.uuid] = legacyAuth;
                    data.currentAccount = legacyAuth.uuid;
                    saveAccounts(data);
                }
                
                // Backup and remove legacy file
                const backupFile = path.join(CONFIG_DIR, 'auth.json.backup');
                fs.renameSync(legacyFile, backupFile);
                
                return true;
            }
        } catch {
            // Ignore migration errors
        }
    }
    
    return false;
}

export default {
    loadAccounts,
    saveAccounts,
    getCurrentAccount,
    getAccount,
    addAccount,
    removeAccount,
    switchAccount,
    getAllAccounts,
    getAccountCount,
    accountExists,
    updateAccount,
    migrateFromLegacy
};
