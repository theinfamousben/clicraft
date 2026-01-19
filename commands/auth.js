import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import { getConfigDir } from '../helpers/config.js';

// Config directory for storing auth tokens
const CONFIG_DIR = getConfigDir();
const AUTH_FILE = path.join(CONFIG_DIR, 'auth.json');

// Using the legacy live.com OAuth with the special desktop redirect URI
// This is the official approach for native/desktop applications
const CLIENT_ID = '00000000402b5328'; // Official Minecraft launcher client ID
const REDIRECT_URI = 'https://login.live.com/oauth20_desktop.srf';

// Ensure config directory exists
function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
}

// Load saved auth data
export function loadAuth() {
    ensureConfigDir();
    if (fs.existsSync(AUTH_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
        } catch {
            return null;
        }
    }
    return null;
}

// Save auth data
function saveAuth(authData) {
    ensureConfigDir();
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));
}

// Clear auth data
function clearAuth() {
    if (fs.existsSync(AUTH_FILE)) {
        fs.unlinkSync(AUTH_FILE);
    }
}

// Prompt user for input
function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// Extract authorization code from redirect URL
function extractCodeFromUrl(url) {
    try {
        // Handle both full URL and just the code
        if (url.startsWith('http')) {
            const parsed = new URL(url);
            return parsed.searchParams.get('code');
        }
        // User might have just pasted the code
        return url;
    } catch {
        return url; // Assume it's the code itself
    }
}

// Exchange code for Microsoft token using live.com
async function getMicrosoftToken(code) {
    const response = await fetch('https://login.live.com/oauth20_token.srf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            scope: 'service::user.auth.xboxlive.com::MBI_SSL'
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to get Microsoft token: ${text}`);
    }

    return await response.json();
}

// Refresh Microsoft token
async function refreshMicrosoftToken(refreshToken) {
    const response = await fetch('https://login.live.com/oauth20_token.srf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            scope: 'service::user.auth.xboxlive.com::MBI_SSL'
        })
    });

    if (!response.ok) {
        return null;
    }

    return await response.json();
}

// Get Xbox Live token
async function getXboxLiveToken(msAccessToken) {
    const response = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            Properties: {
                AuthMethod: 'RPS',
                SiteName: 'user.auth.xboxlive.com',
                RpsTicket: msAccessToken // Note: no 'd=' prefix for live.com tokens
            },
            RelyingParty: 'http://auth.xboxlive.com',
            TokenType: 'JWT'
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to get Xbox Live token: ${text}`);
    }

    return await response.json();
}

// Get XSTS token
async function getXSTSToken(xblToken) {
    const response = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            Properties: {
                SandboxId: 'RETAIL',
                UserTokens: [xblToken]
            },
            RelyingParty: 'rp://api.minecraftservices.com/',
            TokenType: 'JWT'
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (error.XErr === 2148916233) {
            throw new Error('This Microsoft account does not have an Xbox account. Please create one at xbox.com');
        } else if (error.XErr === 2148916238) {
            throw new Error('This account belongs to someone under 18 and needs to be added to a family');
        }
        throw new Error(`Failed to get XSTS token: ${JSON.stringify(error)}`);
    }

    return await response.json();
}

// Get Minecraft token
async function getMinecraftToken(xstsToken, userHash) {
    const response = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            identityToken: `XBL3.0 x=${userHash};${xstsToken}`
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to get Minecraft token: ${text}`);
    }

    return await response.json();
}

// Get Minecraft profile
async function getMinecraftProfile(mcAccessToken) {
    const response = await fetch('https://api.minecraftservices.com/minecraft/profile', {
        headers: {
            'Authorization': `Bearer ${mcAccessToken}`
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('You do not own Minecraft Java Edition. Please purchase it at minecraft.net');
        }
        throw new Error('Failed to get Minecraft profile');
    }

    return await response.json();
}

// Open URL in browser
async function openBrowser(url) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const platform = process.platform;
    let command;

    if (platform === 'darwin') {
        command = `open "${url}"`;
    } else if (platform === 'win32') {
        command = `start "" "${url}"`;
    } else {
        // Linux - try common browsers
        command = `xdg-open "${url}" || sensible-browser "${url}" || x-www-browser "${url}" || gnome-open "${url}"`;
    }

    try {
        await execAsync(command);
        return true;
    } catch {
        return false;
    }
}

// Full authentication flow
async function authenticate() {
    console.log(chalk.cyan('\n🔐 Microsoft Login\n'));

    // Build OAuth URL
    const authUrl = `https://login.live.com/oauth20_authorize.srf?` +
        `client_id=${CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent('service::user.auth.xboxlive.com::MBI_SSL')}`;

    console.log(chalk.white('Please open this URL in your browser to login:\n'));
    console.log(chalk.cyan(authUrl));
    console.log();

    // Try to open browser
    const opened = await openBrowser(authUrl);
    if (opened) {
        console.log(chalk.gray('(Browser opened automatically)'));
    }

    console.log(chalk.white('\nAfter logging in, you will be redirected to a blank page.'));
    console.log(chalk.white('Copy the ENTIRE URL from your browser\'s address bar and paste it below:\n'));

    const redirectUrl = await prompt(chalk.yellow('Paste the redirect URL here: '));
    
    if (!redirectUrl) {
        throw new Error('No URL provided');
    }

    const code = extractCodeFromUrl(redirectUrl);
    if (!code) {
        throw new Error('Could not extract authorization code from URL');
    }

    console.log(chalk.green('\n✓ Received authorization code'));
    console.log(chalk.gray('Getting Microsoft token...'));
    const msToken = await getMicrosoftToken(code);

    console.log(chalk.gray('Getting Xbox Live token...'));
    const xblResponse = await getXboxLiveToken(msToken.access_token);
    const xblToken = xblResponse.Token;
    const userHash = xblResponse.DisplayClaims.xui[0].uhs;

    console.log(chalk.gray('Getting XSTS token...'));
    const xstsResponse = await getXSTSToken(xblToken);
    const xstsToken = xstsResponse.Token;

    console.log(chalk.gray('Getting Minecraft token...'));
    const mcToken = await getMinecraftToken(xstsToken, userHash);

    console.log(chalk.gray('Getting Minecraft profile...'));
    const profile = await getMinecraftProfile(mcToken.access_token);

    // Save auth data
    const authData = {
        accessToken: mcToken.access_token,
        refreshToken: msToken.refresh_token,
        expiresAt: Date.now() + (mcToken.expires_in * 1000),
        uuid: profile.id,
        username: profile.name,
        authenticatedAt: new Date().toISOString()
    };

    saveAuth(authData);

    return authData;
}

// Refresh authentication if needed
export async function refreshAuth() {
    const auth = loadAuth();

    if (!auth) {
        return null;
    }

    // Check if token is still valid (with 5 min buffer)
    if (auth.expiresAt && Date.now() < auth.expiresAt - 300000) {
        return auth;
    }

    // Try to refresh
    if (auth.refreshToken) {
        try {
            console.log(chalk.gray('Refreshing authentication...'));

            const msToken = await refreshMicrosoftToken(auth.refreshToken);
            if (!msToken) {
                return null;
            }

            const xblResponse = await getXboxLiveToken(msToken.access_token);
            const xstsResponse = await getXSTSToken(xblResponse.Token);
            const mcToken = await getMinecraftToken(
                xstsResponse.Token,
                xblResponse.DisplayClaims.xui[0].uhs
            );
            const profile = await getMinecraftProfile(mcToken.access_token);

            const authData = {
                accessToken: mcToken.access_token,
                refreshToken: msToken.refresh_token,
                expiresAt: Date.now() + (mcToken.expires_in * 1000),
                uuid: profile.id,
                username: profile.name,
                authenticatedAt: auth.authenticatedAt,
                refreshedAt: new Date().toISOString()
            };

            saveAuth(authData);
            console.log(chalk.green('✓ Token refreshed successfully'));
            return authData;
        } catch (err) {
            console.log(chalk.yellow('Token refresh failed, please login again.'));
            return null;
        }
    }

    return null;
}

// Login command
export async function login(options) {
    try {
        // Check if already logged in
        const existingAuth = await refreshAuth();
        if (existingAuth && !options.force) {
            console.log(chalk.green(`\n✅ Already logged in as ${chalk.bold(existingAuth.username)}`));
            console.log(chalk.gray('Use --force to login with a different account.'));
            return;
        }

        const auth = await authenticate();

        console.log(chalk.green(`\n✅ Successfully logged in as ${chalk.bold(auth.username)}!`));
        console.log(chalk.gray(`   UUID: ${auth.uuid}`));
        console.log(chalk.gray(`   Credentials saved to: ${AUTH_FILE}`));

    } catch (error) {
        console.error(chalk.red('\nLogin failed:'), error.message);
        if (options.verbose) {
            console.error(error);
        }
    }
}

// Logout command
export async function logout(options) {
    console.log(chalk.cyan('\n🎮 Minecraft Logout\n'));

    const auth = loadAuth();
    if (!auth) {
        console.log(chalk.yellow('You are not logged in.'));
        return;
    }

    clearAuth();
    console.log(chalk.green(`✅ Logged out successfully (was: ${auth.username})`));
}

// Status command
export async function authStatus(options) {
    console.log(chalk.cyan('\n🎮 Login Status\n'));

    const auth = loadAuth();
    if (!auth) {
        console.log(chalk.yellow('Not logged in.'));
        console.log(chalk.gray('Use "clicraft login" to authenticate.'));
        return;
    }

    const isExpired = auth.expiresAt && Date.now() >= auth.expiresAt;
    const canRefresh = !!auth.refreshToken;

    console.log(chalk.white(`Username: ${chalk.bold(auth.username)}`));
    console.log(chalk.gray(`UUID: ${auth.uuid}`));
    console.log(chalk.gray(`Authenticated: ${auth.authenticatedAt}`));

    if (isExpired) {
        if (canRefresh) {
            console.log(chalk.yellow('Token expired (will refresh on next launch)'));
        } else {
            console.log(chalk.red('Token expired (please login again)'));
        }
    } else {
        const expiresIn = Math.round((auth.expiresAt - Date.now()) / 60000);
        console.log(chalk.green(`Token valid for ${expiresIn} minutes`));
    }
}

export default { login, logout, authStatus, loadAuth, refreshAuth };
