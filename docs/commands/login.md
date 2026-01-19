---
layout: default
title: login
parent: Commands
nav_order: 4
description: "Authenticate with Microsoft account"
permalink: /commands/login
---

# login Command

Authenticate with your Microsoft account to play Minecraft online.

## 📝 Synopsis

```bash
clicraft login [options]
clicraft status
clicraft logout
```

## 📖 Description

The authentication commands manage your Microsoft account login for Minecraft. A valid Microsoft account (with Minecraft purchased) is required to play Minecraft online with multiplayer servers.

### Commands

- **`clicraft login`** - Login to your Microsoft account
- **`clicraft status`** - Check your current login status
- **`clicraft logout`** - Logout and clear authentication tokens

## 🎯 Options

### login
| Option | Description | Default |
|--------|-------------|---------|
| `-f, --force` | Force re-login even if already logged in | false |
| `--verbose` | Enable verbose output | false |

### status
No options available.

### logout
No options available.

## 📋 Examples

### Login to Microsoft
```bash
clicraft login
```

### Check login status
```bash
clicraft status
```

### Logout
```bash
clicraft logout
```

### Force re-login
```bash
clicraft login --force
```
Useful if your tokens are expired or you want to switch accounts.

## 🎮 Login Process

### Step-by-Step

```bash
$ clicraft login

Opening browser for Microsoft authentication...

Please login at:
https://login.microsoftonline.com/...

After logging in, paste the redirect URL here:
```

1. **Browser Opens**: Your default browser opens to Microsoft's login page
2. **Sign In**: Login with your Microsoft account (the one that owns Minecraft)
3. **Authorization**: Approve the authentication request
4. **Copy URL**: After approval, you'll be redirected to a URL starting with `http://localhost`
5. **Paste URL**: Copy that entire URL and paste it into the terminal
6. **Complete**: Authentication tokens are saved

### Example Session

```bash
$ clicraft login

Opening browser for Microsoft authentication...

Please login at:
https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?...

After logging in, paste the redirect URL here:
> http://localhost:1234/?code=M.R3_BAY...

✓ Successfully authenticated!
✓ Minecraft profile found: Player123
✓ Authentication tokens saved

You are now logged in and can play Minecraft online.
```

## 🔍 Authentication Flow

### What Happens

1. **OAuth Flow**: Uses Microsoft's OAuth 2.0 authentication
2. **Xbox Live**: Authenticates with Xbox Live services
3. **Minecraft**: Exchanges Xbox token for Minecraft token
4. **Profile**: Fetches your Minecraft profile (username, UUID)
5. **Storage**: Saves tokens to `~/.mcpkg/auth.json`

### Token Storage

Authentication data is stored at:
```
~/.mcpkg/auth.json
```

This file contains:
- Access tokens (encrypted)
- Refresh tokens
- Minecraft profile information
- Token expiration times

**Keep this file secure!** It contains your authentication credentials.

## 📊 Checking Status

```bash
$ clicraft status

Authentication Status:
✓ Logged in
Username: Player123
UUID: 123e4567-e89b-12d3-a456-426614174000
Token expires: 2024-01-20 15:30:00
```

Shows:
- Login status (logged in or not)
- Minecraft username
- Player UUID
- Token expiration time

## 🚪 Logging Out

```bash
$ clicraft logout

Logging out...
✓ Authentication tokens cleared

You are now logged out. Use 'clicraft login' to login again.
```

This removes all authentication data from `~/.mcpkg/auth.json`.

## 🎯 Use Cases

### First Time Setup
```bash
# Login before first launch
clicraft login

# Then launch the game
cd my-instance
clicraft launch
```

### Playing Online
```bash
# Login required for multiplayer
clicraft login

# Launch and join servers
clicraft launch
```

### Offline Mode
```bash
# No login needed for offline play
cd my-instance
clicraft launch --offline
```

### Switching Accounts
```bash
# Logout of current account
clicraft logout

# Login with different account
clicraft login
```

### Checking Login Before Launch
```bash
# Verify you're logged in
clicraft status

# If not logged in, login
clicraft login

# Then launch
clicraft launch
```

## 🔒 Security

### Best Practices

1. **Keep Tokens Private**: Don't share `~/.mcpkg/auth.json`
2. **Logout on Shared Systems**: Use `clicraft logout` on shared computers
3. **Regular Re-login**: Tokens expire, re-login when needed
4. **Use 2FA**: Enable two-factor authentication on your Microsoft account

### Token Security

- Tokens are stored locally on your machine
- clicraft never sends your credentials anywhere except Microsoft's official servers
- Tokens are automatically refreshed when they expire
- Old tokens are invalidated when you logout

## ⚠️ Common Issues

### "Browser didn't open"
If the browser doesn't open automatically:
- Copy the URL from the terminal
- Paste it into your browser manually
- Continue with the login process

### "Invalid redirect URL"
Make sure you copy the **entire** URL after being redirected:
```
http://localhost:1234/?code=M.R3_BAY...
```
Not just part of it.

### "No Minecraft profile found"
This means the Microsoft account you logged in with doesn't own Minecraft:
- Verify you're using the correct Microsoft account
- Check if Minecraft is purchased for that account
- Visit [minecraft.net](https://www.minecraft.net) to verify

### "Token expired"
Tokens expire after some time:
```bash
clicraft login --force
```
This will refresh your authentication.

### "Network error"
Authentication requires internet:
- Check your internet connection
- Verify you can access Microsoft services
- Try again in a few moments

### "Already logged in"
If you want to switch accounts:
```bash
clicraft logout
clicraft login
```

## 🎮 Online vs Offline Mode

### Online Mode (Requires Login)
- **Multiplayer**: Join online servers
- **Realms**: Access Minecraft Realms
- **Skins**: Use custom skins
- **Verification**: Verified as legitimate Minecraft account

### Offline Mode (No Login)
- **Singleplayer**: Play in single-player worlds
- **Local**: Play on LAN
- **No Auth**: Doesn't verify Minecraft ownership
- **Limited**: No online features

Launch offline:
```bash
clicraft launch --offline
```

## 📱 Microsoft Account

### Requirements
- Valid Microsoft account
- Minecraft purchased on that account
- Internet connection during login

### Account Migration
If you have an old Mojang account:
1. Migrate it to Microsoft at [minecraft.net/migrate](https://www.minecraft.net/migrate)
2. Then use `clicraft login` with your Microsoft account

## 💡 Pro Tips

1. **Login Once**: Tokens persist across sessions - no need to login every time
2. **Check Status First**: Use `clicraft status` before launching to verify login
3. **Offline Testing**: Use `--offline` for testing mods without authentication
4. **Multiple Instances**: One login works for all instances
5. **Token Refresh**: clicraft automatically refreshes tokens when needed

## 🔄 Token Management

### Automatic Refresh
clicraft automatically refreshes tokens when:
- They're about to expire
- You launch the game
- You check status

### Manual Refresh
Force a token refresh:
```bash
clicraft login --force
```

## 📚 Related Commands

- [`clicraft launch`](launch.md) - Launch requires login for online play
- [`clicraft status`](login.md) - Check login status
- [`clicraft logout`](login.md) - Logout from account

## 🔗 External Resources

- [Microsoft Account](https://account.microsoft.com/)
- [Minecraft Account](https://www.minecraft.net/profile)
- [Migrate to Microsoft](https://www.minecraft.net/migrate)
- [Get Minecraft](https://www.minecraft.net/get-minecraft)

## 🆘 Troubleshooting

### Can't Complete OAuth Flow
1. Make sure pop-ups aren't blocked in your browser
2. Try using a different browser
3. Check that you're not behind a restrictive firewall

### Authentication Loop
If you keep being asked to login:
```bash
# Clear tokens and re-login
clicraft logout
rm -rf ~/.mcpkg/auth.json
clicraft login
```

### Different Account
To use a different Microsoft account:
```bash
clicraft logout
clicraft login
# Use different account in browser
```

## 🔗 See Also

- [Commands Overview](../commands.md)
- [Launch Command](launch.md)
- [Configuration Guide](../configuration.md)

---

[← Back to Commands](../commands.md) | [Next: launch →](launch.md)
