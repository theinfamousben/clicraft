---
layout: default
title: config
parent: Commands
nav_order: 8
description: "Manage CLI settings and game settings"
permalink: /commands/config
---

# config Command

Manage CLIcraft settings and Minecraft game settings.

## 📝 Synopsis

```bash
clicraft config [action] [args...] [options]
```

## 📖 Description

The `config` command provides access to:
- **CLI Settings** - Global CLIcraft configuration (Java path, memory, etc.)
- **Game Settings Ignore List** - Control which Minecraft settings are captured
- **Game Settings** - Capture and manage Minecraft options in mcconfig.json

## 🎯 Options

| Option | Description |
|--------|-------------|
| `-i, --instance <path>` | Path to instance directory (for game settings actions) |
| `--verbose` | Show detailed output |

## 📋 Actions

### `show` (default)

Display current CLI settings.

```bash
clicraft config
clicraft config show
```

**Output:**
```
⚙️  CLI Settings

   Config directory: /home/user/.clicraft

   checkUpdates: true
   autoSaveToConfig: true
   *...other config options*
```

### `set <key> <value>`

Modify a CLI setting.

```bash
# Set maximum memory
clicraft config set checkUpdates false

# Reset to auto-detect
clicraft config set checkUpdates auto #sets to true
```

**Available Settings:**

| Key | Description | Example Values | Default|
|-----|-------------|----------------|--------|
| `checkUpdates` | whether to check for updates | `true, false` | `true` |
| `autoSaveToConfig` | whether to automatically save minecraft settings to mcconfig.json | `true, false` | `true` |

*Do NOT change settingsVersion, unless you want to mess around and fix my bugs ;)*

### `ignore`

Show the game settings ignore list. These patterns determine which Minecraft settings are excluded when capturing.

```bash
clicraft config ignore
```

**Output:**
```
🚫 Game Settings Ignore List

   File: /home/user/.clicraft/game-settings-ignore.json
   These settings are excluded when saving game settings to mcconfig.json

   - fullscreen
   - overrideWidth
   - overrideHeight
   - key_*
   - narrator
   ...

   Tip: Use * as wildcard (e.g., key_* ignores all keybinds)
```

### `ignore-add <pattern>`

Add a pattern to the ignore list.

```bash
# Ignore mouse sensitivity
clicraft config ignore-add mouseSensitivity

# Ignore all sound categories (wildcard)
clicraft config ignore-add soundCategory_*
```

### `ignore-remove <pattern>`

Remove a pattern from the ignore list.

```bash
# Stop ignoring keybinds (include them when capturing)
clicraft config ignore-remove key_*
```

### `defaults`

Show default game settings that are applied to all new instances.

```bash
clicraft config defaults
```

**Output:**
```
🎮 Default Game Settings

   File: /home/user/.clicraft/default-game-settings.json
   These settings are applied to all new instances

   renderDistance: 16
   fov: 80
```

### `defaults-set <key> <value>`

Set a default game setting. This will be applied to all new instances.

```bash
# Set render distance
clicraft config defaults-set renderDistance 16

# Set field of view
clicraft config defaults-set fov 80

# Disable auto-jump
clicraft config defaults-set autoJump false
```

### `defaults-remove <key>`

Remove a default game setting.

```bash
clicraft config defaults-remove renderDistance
```

### `defaults-clear`

Clear all default game settings.

```bash
clicraft config defaults-clear
```

### `capture`

Capture game settings from an instance's `options.txt` and save them to `mcconfig.json`.

```bash
# In an instance directory
clicraft config capture

# Or specify instance
clicraft config capture --instance ~/my-instance

# With verbose output to see all captured settings
clicraft config capture --verbose
```

**Requirements:**
- Must have an `mcconfig.json` in the instance
- Must have an `options.txt` (run Minecraft at least once)

**What it does:**
1. Reads `options.txt` from the instance
2. Filters out settings in the ignore list
3. Saves remaining settings to `mcconfig.json` as `gameSettings`

### `game-settings`

Show game settings saved in an instance's `mcconfig.json`.

```bash
clicraft config game-settings
clicraft config game-settings --instance ~/my-instance
```

**Output:**
```
⚙️  Game Settings (15 saved)

   renderDistance: 12
   fov: 70
   guiScale: 2
   gamma: 0.5
   ...
```

### `clear-game-settings`

Remove all game settings from an instance's `mcconfig.json`.

```bash
clicraft config clear-game-settings
```

## 💡 Examples

### Set up for a powerful machine
```bash
clicraft config set maxMemory 8G
clicraft config set minMemory 4G
```

### Configure default game settings for new instances
```bash
# Set your preferred defaults
clicraft config defaults-set renderDistance 16
clicraft config defaults-set fov 80
clicraft config defaults-set guiScale 2
clicraft config defaults-set autoJump false

# Now all new instances will have these settings
clicraft create
```

### Capture and share settings
```bash
# Play Minecraft and configure your preferred settings
# Then capture them
cd my-instance
clicraft config capture --verbose

# Your mcconfig.json now includes gameSettings
# Share it with others
```

### Include keybinds in shared config
```bash
# By default, keybinds are ignored
# Remove them from ignore list to include
clicraft config ignore-remove key_*

# Now capture will include keybinds
clicraft config capture
```

### Check what will be captured
```bash
# First, see what's ignored
clicraft config ignore

# Then capture with verbose to see what's included
clicraft config capture --verbose
```

## 📁 Config Files

All global config files are stored in `~/.clicraft/`:

| File | Description |
|------|-------------|
| `settings.json` | CLI settings (memory, Java path, etc.) |
| `default-game-settings.json` | Default Minecraft settings for new instances |
| `game-settings-ignore.json` | Patterns to exclude when capturing |
| `auth.json` | Authentication tokens |

## 🔗 See Also

- [Configuration Guide](../configuration.md) - Full configuration documentation
- [create Command](create.md) - Uses game settings when creating from config
- [info Command](info.md) - Shows instance information

---

[← Back to Commands](../commands.md)
