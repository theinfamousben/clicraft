---
layout: default
title: auth
parent: Commands
nav_order: 5
description: "Manage Minecraft accounts"
permalink: /commands/auth
---

# auth

Manage Microsoft/Minecraft accounts. Supports multiple accounts.

```bash
clicraft auth [action] [args...]
```

## Actions

| Action | Description |
|--------|-------------|
| `login` | Add or update an account |
| `logout [account]` | Remove an account |
| `switch [account]` | Change active account |
| `status [account]` | Show account info |
| `list` | List all accounts |

## Options

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmations |
| `--verbose` | Detailed output |

## Examples

```bash
clicraft auth login              # Add account (opens browser)
clicraft auth status             # Show all accounts
clicraft auth switch Player2     # Switch active account
clicraft auth logout             # Remove (interactive if multiple)
```

## Login Flow

1. Opens Microsoft login URL
2. After login, you're redirected to a blank page
3. Copy the full URL from the address bar
4. Paste it back into the terminal

Tokens refresh automatically on launch.
