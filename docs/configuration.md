---
layout: default
title: Configuration
nav_order: 4
description: "Configure CLIcraft and customize your instances"
permalink: /configuration
---

# Configuration

## File Locations

**Global** (`~/.clicraft/`):
- `settings.json` — CLI settings
- `aliases.json` — Instance shortcuts
- `default-game-settings.json` — Defaults for new instances
- `game-settings-ignore.json` — Settings to exclude when capturing
- `auth/accounts.json` — Microsoft accounts

**Per-instance**:
- `mcconfig.json` — Instance config (version, loader, mods, etc.)

---

## CLI Settings

Manage with `clicraft config`.

| Setting | Default | Description |
|---------|---------|-------------|
| `jvmArgs` | `-Xmx2G,-Xms512M` | JVM arguments |
| `checkUpdates` | `true` | Check for CLI updates |
| `autoSaveToConfig` | `true` | Save game settings to mcconfig.json on exit |
| `autoLoadConfigOnLaunch` | `true` | Apply saved game settings on launch |

```bash
clicraft config                     # View settings
clicraft config set <key> <value>   # Change setting
```

---

## Game Settings Ignore List

Controls which Minecraft options are excluded when capturing settings.

Default ignores: `fullscreen`, `key_*`, `resourcePacks`, `lastServer`, etc.

```bash
clicraft config ignore                  # View list
clicraft config ignore-add <pattern>    # Add pattern (supports * wildcard)
clicraft config ignore-remove <pattern> # Remove pattern
```

---

## Default Game Settings

Applied to all new instances.

```bash
clicraft config defaults                        # View
clicraft config defaults-set <key> <value>      # Set
clicraft config defaults-remove <key>           # Remove
clicraft config defaults-clear                  # Clear all
```

Example: `clicraft config defaults-set renderDistance 16`

---

## Instance Config (mcconfig.json)

Each instance stores its configuration:

```json
{
  "name": "my-instance",
  "type": "client",
  "modLoader": "fabric",
  "loaderVersion": "0.16.5",
  "minecraftVersion": "1.21.1",
  "mods": [...],
  "gameSettings": {...}
}
```

Share this file to replicate setups—run `clicraft create` in a directory with an existing `mcconfig.json` to recreate the instance.
