---
layout: default
title: auth
parent: Commands
nav_order: 4
description: "Manage Minecraft accounts"
permalink: /commands/auth
---

# auth Command

Manage your Microsoft/Minecraft accounts. CLIcraft supports multiple accounts with easy switching between them.

## Usage

```bash
clicraft auth [action] [args...] [options]
```

## 📖 Description

The auth command provides a unified interface for managing Microsoft account authentication. You can have multiple accounts saved and easily switch between them.

### Available Actions

| Action | Description |
|--------|-------------|
| `login` | Add a new account or update existing |
| `logout [account]` | Remove an account |
| `switch [account]` | Switch to a different account |
| `status [account]` | Show all accounts or specific account details |
| `list` | List all saved accounts |

## 🎯 Options

| Option | Description | Default |
|--------|-------------|---------|
| `-f, --force` | Skip confirmation prompts | false |
| `--verbose` | Enable verbose output | false |

## 📋 Examples

### Add a new account
```bash
clicraft auth login
```

### Check all accounts
```bash
clicraft auth status
```
Output:
```
🎮 Account Status

2 account(s) saved:

▶ Player123 (4a903277...) (valid)
  AltAccount (8b374a68...) (expired)

Use "clicraft auth status <username>" for detailed info.
```

### View specific account details
```bash
clicraft auth status Player123
```
Output:
```
🎮 Account Status

Username: Player123 (active)
UUID: 4a903277a1014eaebc5a82f746e36682
Authenticated: 2026-01-19T16:13:46.840Z
Token valid for 45 minutes
```

### Switch between accounts
```bash
clicraft auth switch AltAccount
```
Or interactively:
```bash
clicraft auth switch
```

### Remove an account
```bash
clicraft auth logout Player123
```
Or remove current account:
```bash
clicraft auth logout
```

### List all accounts
```bash
clicraft auth list
```

## 🎮 Login Process

### Step-by-Step

```bash
$ clicraft auth login

🔐 Microsoft Login

You have 1 account(s) saved.
This will add a new account or update an existing one.

Please open this URL in your browser to login:

https://login.live.com/oauth20_authorize.srf\?...

(Browser opened automatically)

After logging in, you will be redirected to a blank page.
Copy the ENTIRE URL from your browser's address bar and paste it below:

Paste the redirect URL here: 
```

1. **Browser Opens**: Your default browser opens to Microsoft's login page
2. **Sign In**: Login with your Microsoft account (the one that owns Minecraft)
3. **Authorization**: Approve the authentication request
4. **Copy URL**: After approval, you'll be redirected - copy the entire URL
5. **Paste URL**: Paste it into the terminal
6. **Complete**: Account is saved and set as active

### Example Session

```bash
$ clicraft auth login

🔐 Microsoft Login

Please open this URL in your browser to login:

https://login.live.com/oauth20_authorize.srf\?...

Paste the redirect URL here: https://login.live.com/oauth20_desktop.srf\?code\=M.R3_BAY...

Getting Microsoft token...
Getting Xbox Live token...
Getting XSTS token...
Getting Minecraft token...
Getting Minecraft profile...

✅ Successfully added account: Player123
   UUID: 4a903277a1014eaebc5a82f746e36682
   Total accounts: 2
   This account is now active.
```

## 🔀 Switching Accounts

### Interactive Switch
```bash
$ clicraft auth switch

🔄 Switch Account

? Select an account to switch to:
❯ Player123 (current)
  AltAccount
  TestPlayer
```

### Direct Switch
```bash
$ clicraft auth switch AltAccount

🔄 Switch Account

✅ Switched to: AltAccount
```

### Switch by UUID
```bash
clicraft auth switch 8b374a68-9338-41b9-81a1-c65e5a02fedf
```

## 🚪 Logging Out

### Remove Specific Account
```bash
$ clicraft auth logout AltAccount

🔐 Logout

✔ Are you sure you want to logout AltAccount? Yes
✅ Logged out: AltAccount
   Remaining accounts: 1
   Active account: Player123
```

### Interactive Selection (Multiple Accounts)
```bash
$ clicraft auth logout

🔐 Logout

? Which account do you want to logout?
❯ Player123 (4a903277...)
  AltAccount (8b374a68...)
  Cancel
```

### Force Logout (Skip Confirmation)
```bash
clicraft auth logout AltAccount --force
```

## 📊 Status Display

### All Accounts
```bash
$ clicraft auth status

🎮 Account Status

2 account(s) saved:

▶ Player123 (4a903277...) (valid)
  AltAccount (8b374a68...) (expired)

Use "clicraft auth status <username>" for detailed info.
```

**Legend:**
- `▶` - Currently active account
- `(valid)` - Token is still valid
- `(expired)` - Token needs refresh (automatic on launch)

### Specific Account
```bash
$ clicraft auth status Player123

🎮 Account Status

Username: Player123 (active)
UUID: 4a903277a1014eaebc5a82f746e36682
Authenticated: 2026-01-19T16:13:46.840Z
Last Refreshed: 2026-01-22T14:30:00.000Z
Token valid for 45 minutes
```

## 🔒 Token Storage

### Storage Location
Authentication data is stored at:
```
~/.clicraft/auth/accounts.json
```

### Structure
```json
{
  "accounts": {
    "uuid1": { "username": "Player123", ... },
    "uuid2": { "username": "AltAccount", ... }
  },
  "currentAccount": "uuid1"
}
```

### Security
- **Keep this file secure/home/benjamin/GitHub/clicraft/docs/commands/login.md /home/benjamin/GitHub/clicraft/docs/commands/auth.md* It contains authentication tokens
- Tokens are automatically refreshed when they expire
- Old tokens are invalidated when you logout

## 🔄 Token Management

### Automatic Refresh
CLIcraft automatically refreshes tokens when:
- They're about to expire (within 5 minutes)
- You launch the game
- The token check during game launch

### Manual Refresh
Re-login to force a fresh token:
```bash
clicraft auth login
# Login with the same account to refresh
```

## 🎯 Use Cases

### Multiple Players on Same Computer
```bash
# Add first account
clicraft auth login
# Login as Player1

# Add second account  
clicraft auth login
# Login as Player2

# Switch between them
clicraft auth switch Player1
clicraft launch

clicraft auth switch Player2
clicraft launch
```

### Development/Testing
```bash
# Use test account for mod testing
clicraft auth switch TestAccount
clicraft launch

# Switch back to main account
clicraft auth switch MainAccount
```

### Shared Computer
```bash
# Each user logs in with their own account
clicraft auth login

# Before leaving, remove your account
clicraft auth logout YourUsername
```

## ⚠️ Common Issues

### "Token expired"
Tokens automatically refresh on launch. If issues persist:
```bash
clicraft auth login
# Re-login with the same account
```

### "Account not found"
Check available accounts:
```bash
clicraft auth list
```

### "No accounts logged in"
Add an account:
```bash
clicraft auth login
```

### "Browser didn't open"
Copy the URL manually:
```bash
clicraft auth login
# Copy the URL shown and paste in browser
```

## 🔗 Migration from Legacy Format

If you used an older version of CLIcraft, your existing auth is automatically migrated:
- Old file: `~/.clicraft/auth.json`
- New location: `~/.clicraft/auth/accounts.json`
- A backup is created at `~/.clicraft/auth.json.backup`

## 🔗 External Resources

- [Microsoft Account](https://account.microsoft.com/)
- [Minecraft Account](https://www.minecraft.net/profile)
- [Get Minecraft](https://www.minecraft.net/get-minecraft)

---

[← Back to Commands](../commands.md) | [Next: launch →](launch.md)
