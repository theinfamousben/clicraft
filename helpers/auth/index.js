// Re-export everything from auth modules
export {
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
} from './storage.js';

export {
    performAuthentication,
    refreshAccountAuth
} from './microsoft.js';
