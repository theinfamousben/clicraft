import chalk from 'chalk';
import inquirer from 'inquirer';
import {
    loadAccounts,
    getCurrentAccount,
    getAccount,
    addAccount,
    removeAccount,
    switchAccount as switchAccountStorage,
    getAllAccounts,
    getAccountCount,
    updateAccount,
    migrateFromLegacy
} from '../helpers/auth/index.js';
import {
    performAuthentication,
    refreshAccountAuth
} from '../helpers/auth/microsoft.js';

// Migrate from legacy auth.json on first run
migrateFromLegacy();

/**
 * Load current auth (for backward compatibility)
 */
export function loadAuth() {
    return getCurrentAccount();
}

/**
 * Refresh authentication for current account
 */
export async function refreshAuth() {
    const account = getCurrentAccount();

    if (!account) {
        return null;
    }

    // Check if token is still valid (with 5 min buffer)
    if (account.expiresAt && Date.now() < account.expiresAt - 300000) {
        return account;
    }

    // Try to refresh
    try {
        console.log(chalk.gray('Refreshing authentication...'));
        const refreshed = await refreshAccountAuth(account);
        
        if (refreshed) {
            updateAccount(account.uuid, refreshed);
            console.log(chalk.green('✓ Token refreshed successfully'));
            return refreshed;
        }
    } catch (err) {
        console.log(chalk.yellow('Token refresh failed, please login again.'));
    }

    return null;
}

/**
 * Login command - adds a new account or updates existing
 */
async function login(options) {
    try {
        console.log(chalk.cyan('\n🔐 Microsoft Login\n'));
        
        const existingCount = getAccountCount();
        if (existingCount > 0) {
            console.log(chalk.gray(`You have ${existingCount} account(s) saved.`));
            console.log(chalk.gray('This will add a new account or update an existing one.\n'));
        }

        const accountData = await performAuthentication((type, data) => {
            switch (type) {
                case 'open_url':
                    console.log(chalk.white('Please open this URL in your browser to login:\n'));
                    console.log(chalk.cyan(data));
                    console.log();
                    break;
                case 'browser_opened':
                    if (data) console.log(chalk.gray('(Browser opened automatically)'));
                    console.log(chalk.white('\nAfter logging in, you will be redirected to a blank page.'));
                    console.log(chalk.white('Copy the ENTIRE URL from your browser\'s address bar and paste it below:'));
                    break;
                case 'status':
                    console.log(chalk.gray(data));
                    break;
            }
        });

        // Check if account already exists
        const existing = getAccount(accountData.uuid);
        const action = existing ? 'updated' : 'added';
        
        addAccount(accountData, true);

        console.log(chalk.green(`\n✅ Successfully ${action} account: ${chalk.bold(accountData.username)}`));
        console.log(chalk.gray(`   UUID: ${accountData.uuid}`));
        
        const count = getAccountCount();
        if (count > 1) {
            console.log(chalk.gray(`   Total accounts: ${count}`));
            console.log(chalk.gray(`   This account is now active.`));
        }

    } catch (error) {
        console.error(chalk.red('\nLogin failed:'), error.message);
        if (options?.verbose) {
            console.error(error);
        }
    }
}

/**
 * Logout command - removes an account
 */
async function logout(identifier, options) {
    console.log(chalk.cyan('\n🔐 Logout\n'));

    const accounts = getAllAccounts();
    
    if (accounts.length === 0) {
        console.log(chalk.yellow('No accounts are logged in.'));
        return;
    }

    let accountToRemove;
    
    if (identifier) {
        // Remove specific account
        accountToRemove = getAccount(identifier);
        if (!accountToRemove) {
            console.log(chalk.red(`Account "${identifier}" not found.`));
            console.log(chalk.gray('Available accounts:'));
            for (const acc of accounts) {
                console.log(chalk.gray(`  - ${acc.username} (${acc.uuid})`));
            }
            return;
        }
    } else if (accounts.length === 1) {
        // Only one account, remove it
        accountToRemove = accounts[0];
    } else {
        // Multiple accounts, ask which one
        const { selected } = await inquirer.prompt([{
            type: 'list',
            name: 'selected',
            message: 'Which account do you want to logout?',
            choices: [
                ...accounts.map(acc => ({
                    name: `${acc.username} (${acc.uuid.substring(0, 8)}...)`,
                    value: acc.uuid
                })),
                { name: chalk.red('Cancel'), value: null }
            ]
        }]);

        if (!selected) {
            console.log(chalk.gray('Cancelled.'));
            return;
        }

        accountToRemove = getAccount(selected);
    }

    if (!options?.force) {
        const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to logout ${accountToRemove.username}?`,
            default: false
        }]);

        if (!confirm) {
            console.log(chalk.gray('Cancelled.'));
            return;
        }
    }

    const removed = removeAccount(accountToRemove.uuid);
    if (removed) {
        console.log(chalk.green(`✅ Logged out: ${removed.username}`));
        
        const remaining = getAccountCount();
        if (remaining > 0) {
            const current = getCurrentAccount();
            console.log(chalk.gray(`   Remaining accounts: ${remaining}`));
            if (current) {
                console.log(chalk.gray(`   Active account: ${current.username}`));
            }
        } else {
            console.log(chalk.gray('   No accounts remaining.'));
        }
    }
}

/**
 * Switch account command
 */
async function switchAccountCmd(identifier, options) {
    console.log(chalk.cyan('\n🔄 Switch Account\n'));

    const accounts = getAllAccounts();
    
    if (accounts.length === 0) {
        console.log(chalk.yellow('No accounts are logged in.'));
        console.log(chalk.gray('Use "clicraft auth login" to add an account.'));
        return;
    }

    if (accounts.length === 1) {
        console.log(chalk.yellow('Only one account is logged in.'));
        console.log(chalk.gray('Use "clicraft auth login" to add another account.'));
        return;
    }

    const currentAccount = getCurrentAccount();
    let targetAccount;

    if (identifier) {
        targetAccount = getAccount(identifier);
        if (!targetAccount) {
            console.log(chalk.red(`Account "${identifier}" not found.`));
            console.log(chalk.gray('Available accounts:'));
            for (const acc of accounts) {
                const current = acc.uuid === currentAccount?.uuid ? chalk.green(' (current)') : '';
                console.log(chalk.gray(`  - ${acc.username}${current}`));
            }
            return;
        }
    } else {
        // Interactive selection
        const { selected } = await inquirer.prompt([{
            type: 'list',
            name: 'selected',
            message: 'Select an account to switch to:',
            choices: accounts.map(acc => ({
                name: acc.uuid === currentAccount?.uuid 
                    ? `${acc.username} ${chalk.green('(current)')}`
                    : acc.username,
                value: acc.uuid,
                disabled: acc.uuid === currentAccount?.uuid ? 'current' : false
            }))
        }]);

        targetAccount = getAccount(selected);
    }

    if (targetAccount.uuid === currentAccount?.uuid) {
        console.log(chalk.yellow(`Already using account: ${targetAccount.username}`));
        return;
    }

    const switched = switchAccountStorage(targetAccount.uuid);
    if (switched) {
        console.log(chalk.green(`✅ Switched to: ${chalk.bold(switched.username)}`));
        
        // Check token status
        const isExpired = switched.expiresAt && Date.now() >= switched.expiresAt;
        if (isExpired) {
            console.log(chalk.yellow('   Token expired (will refresh on next launch)'));
        }
    }
}

/**
 * Status command - show all accounts or specific account info
 */
async function status(identifier, options) {
    console.log(chalk.cyan('\n🎮 Account Status\n'));

    const accounts = getAllAccounts();
    const currentAccount = getCurrentAccount();

    if (accounts.length === 0) {
        console.log(chalk.yellow('No accounts are logged in.'));
        console.log(chalk.gray('Use "clicraft auth login" to add an account.'));
        return;
    }

    if (identifier) {
        // Show specific account
        const account = getAccount(identifier);
        if (!account) {
            console.log(chalk.red(`Account "${identifier}" not found.`));
            return;
        }
        
        displayAccountDetails(account, account.uuid === currentAccount?.uuid);
    } else {
        // Show all accounts
        console.log(chalk.white(`${accounts.length} account(s) saved:\n`));
        
        for (const account of accounts) {
            const isCurrent = account.uuid === currentAccount?.uuid;
            displayAccountSummary(account, isCurrent);
        }
        
        console.log();
        console.log(chalk.gray('Use "clicraft auth status <username>" for detailed info.'));
    }
}

/**
 * Display account summary (one line)
 */
function displayAccountSummary(account, isCurrent) {
    const marker = isCurrent ? chalk.green('▶ ') : '  ';
    const username = isCurrent 
        ? chalk.bold.green(account.username)
        : chalk.white(account.username);
    
    const isExpired = account.expiresAt && Date.now() >= account.expiresAt;
    const tokenStatus = isExpired
        ? chalk.yellow('(expired)')
        : chalk.green('(valid)');
    
    console.log(`${marker}${username} ${chalk.gray(`(${account.uuid.substring(0, 8)}...)`)} ${tokenStatus}`);
}

/**
 * Display detailed account info
 */
function displayAccountDetails(account, isCurrent) {
    const status = isCurrent ? chalk.green(' (active)') : '';
    
    console.log(chalk.white(`Username: ${chalk.bold(account.username)}${status}`));
    console.log(chalk.gray(`UUID: ${account.uuid}`));
    console.log(chalk.gray(`Authenticated: ${account.authenticatedAt}`));
    
    if (account.refreshedAt) {
        console.log(chalk.gray(`Last Refreshed: ${account.refreshedAt}`));
    }

    const isExpired = account.expiresAt && Date.now() >= account.expiresAt;
    const canRefresh = !!account.refreshToken;

    if (isExpired) {
        if (canRefresh) {
            console.log(chalk.yellow('Token expired (will refresh on next launch)'));
        } else {
            console.log(chalk.red('Token expired (please login again)'));
        }
    } else {
        const expiresIn = Math.round((account.expiresAt - Date.now()) / 60000);
        console.log(chalk.green(`Token valid for ${expiresIn} minutes`));
    }
}

/**
 * List accounts (alias for status without args)
 */
async function listAccounts(options) {
    await status(null, options);
}

/**
 * Main auth command handler
 */
export async function authCommand(action, args, options) {
    // Handle the case where action might be in args for 'auth status <name>'
    const actionArg = Array.isArray(args) ? args[0] : args;
    
    switch (action) {
        case 'login':
        case 'add':
            await login(options);
            break;
            
        case 'logout':
        case 'remove':
            await logout(actionArg, options);
            break;
            
        case 'switch':
        case 'switch-account':
        case 'use':
            await switchAccountCmd(actionArg, options);
            break;
            
        case 'status':
        case 'info':
            await status(actionArg, options);
            break;
            
        case 'list':
        case 'accounts':
            await listAccounts(options);
            break;
            
        case undefined:
            // No action, show help
            console.log(chalk.cyan('\n🔐 Auth Commands\n'));
            console.log(chalk.gray('Available actions:\n'));
            console.log(`   ${chalk.white('login')}              Add a new account or update existing`);
            console.log(`   ${chalk.white('logout [account]')}   Remove an account`);
            console.log(`   ${chalk.white('switch [account]')}   Switch to a different account`);
            console.log(`   ${chalk.white('status [account]')}   Show account status`);
            console.log(`   ${chalk.white('list')}               List all accounts`);
            console.log();
            console.log(chalk.gray('Examples:'));
            console.log(chalk.gray('   clicraft auth login'));
            console.log(chalk.gray('   clicraft auth switch PlayerName'));
            console.log(chalk.gray('   clicraft auth logout'));
            console.log(chalk.gray('   clicraft auth status'));
            break;
            
        default:
            // Treat as account identifier for status
            await status(action, options);
            break;
    }
}

// Legacy exports for backward compatibility
export { login, logout };
export { status as authStatus };

export default { 
    authCommand, 
    login, 
    logout, 
    loadAuth, 
    refreshAuth 
};
