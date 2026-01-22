import readline from 'readline';

// Using the legacy live.com OAuth with the special desktop redirect URI
// This is the official approach for native/desktop applications
const CLIENT_ID = '00000000402b5328'; // Official Minecraft launcher client ID
const REDIRECT_URI = 'https://login.live.com/oauth20_desktop.srf';

/**
 * Prompt user for input
 */
export function prompt(question) {
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

/**
 * Extract authorization code from redirect URL
 */
export function extractCodeFromUrl(url) {
    try {
        if (url.startsWith('http')) {
            const parsed = new URL(url);
            return parsed.searchParams.get('code');
        }
        return url;
    } catch {
        return url;
    }
}

/**
 * Open URL in browser
 */
export async function openBrowser(url) {
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
        command = `xdg-open "${url}" || sensible-browser "${url}" || x-www-browser "${url}" || gnome-open "${url}"`;
    }

    try {
        await execAsync(command);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get OAuth URL for Microsoft login
 */
export function getOAuthUrl() {
    return `https://login.live.com/oauth20_authorize.srf?` +
        `client_id=${CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent('service::user.auth.xboxlive.com::MBI_SSL')}`;
}

/**
 * Exchange code for Microsoft token
 */
export async function getMicrosoftToken(code) {
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

/**
 * Refresh Microsoft token
 */
export async function refreshMicrosoftToken(refreshToken) {
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

/**
 * Get Xbox Live token
 */
export async function getXboxLiveToken(msAccessToken) {
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
                RpsTicket: msAccessToken
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

/**
 * Get XSTS token
 */
export async function getXSTSToken(xblToken) {
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

/**
 * Get Minecraft token
 */
export async function getMinecraftToken(xstsToken, userHash) {
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

/**
 * Get Minecraft profile
 */
export async function getMinecraftProfile(mcAccessToken) {
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

/**
 * Full authentication flow - returns account data
 */
export async function performAuthentication(onStatus) {
    const log = onStatus || (() => {});
    
    const authUrl = getOAuthUrl();
    
    log('open_url', authUrl);
    
    const opened = await openBrowser(authUrl);
    log('browser_opened', opened);
    
    const redirectUrl = await prompt('\nPaste the redirect URL here: ');
    
    if (!redirectUrl) {
        throw new Error('No URL provided');
    }

    const code = extractCodeFromUrl(redirectUrl);
    if (!code) {
        throw new Error('Could not extract authorization code from URL');
    }

    log('status', 'Getting Microsoft token...');
    const msToken = await getMicrosoftToken(code);

    log('status', 'Getting Xbox Live token...');
    const xblResponse = await getXboxLiveToken(msToken.access_token);
    const xblToken = xblResponse.Token;
    const userHash = xblResponse.DisplayClaims.xui[0].uhs;

    log('status', 'Getting XSTS token...');
    const xstsResponse = await getXSTSToken(xblToken);
    const xstsToken = xstsResponse.Token;

    log('status', 'Getting Minecraft token...');
    const mcToken = await getMinecraftToken(xstsToken, userHash);

    log('status', 'Getting Minecraft profile...');
    const profile = await getMinecraftProfile(mcToken.access_token);

    return {
        accessToken: mcToken.access_token,
        refreshToken: msToken.refresh_token,
        expiresAt: Date.now() + (mcToken.expires_in * 1000),
        uuid: profile.id,
        username: profile.name,
        authenticatedAt: new Date().toISOString()
    };
}

/**
 * Refresh authentication for an account
 */
export async function refreshAccountAuth(accountData) {
    if (!accountData.refreshToken) {
        return null;
    }

    const msToken = await refreshMicrosoftToken(accountData.refreshToken);
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

    return {
        accessToken: mcToken.access_token,
        refreshToken: msToken.refresh_token,
        expiresAt: Date.now() + (mcToken.expires_in * 1000),
        uuid: profile.id,
        username: profile.name,
        authenticatedAt: accountData.authenticatedAt,
        refreshedAt: new Date().toISOString()
    };
}

export default {
    prompt,
    extractCodeFromUrl,
    openBrowser,
    getOAuthUrl,
    getMicrosoftToken,
    refreshMicrosoftToken,
    getXboxLiveToken,
    getXSTSToken,
    getMinecraftToken,
    getMinecraftProfile,
    performAuthentication,
    refreshAccountAuth
};
