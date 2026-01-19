---
layout: default
title: Configuration
nav_order: 4
description: "Configure CLIcraft and customize your instances"
permalink: /configuration
---

# Configuration Guide

Learn how to configure CLIcraft and customize your Minecraft instances.

## 📋 Overview

CLIcraft uses configuration files to manage:
- CLI settings (`~/.clicraft/settings.json`)
- Default game settings (`~/.clicraft/default-game-settings.json`)
- Game settings ignore list (`~/.clicraft/game-settings-ignore.json`)
- Authentication data (`~/.clicraft/auth.json`)
- Instance settings (`mcconfig.json`)

## 🏠 Configuration Locations

### Global CLI Configuration
CLI-wide settings are stored in your home directory:
```
~/.clicraft/
├── settings.json              # CLI settings
├── default-game-settings.json # Default Minecraft settings for new instances
├── game-settings-ignore.json  # Game settings to exclude when capturing
└── auth.json                  # Authentication tokens
```

### Instance Configuration
Each instance has its own configuration file:
```
instance-directory/
└── mcconfig.json
```

## ⚙️ CLI Settings (~/.clicraft/settings.json)

Global settings for CLIcraft. Manage with `clicraft config`.

### Structure

```json
{
  "javaPath": null,
  "minMemory": "1G",
  "maxMemory": "2G",
  "modSource": "modrinth",
  "checkUpdates": true
}
```

### Settings Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `javaPath` | string/null | `null` | Path to Java executable (`null` = auto-detect) |
| `minMemory` | string | `"1G"` | Minimum JVM memory allocation |
| `maxMemory` | string | `"2G"` | Maximum JVM memory allocation |
| `modSource` | string | `"modrinth"` | Default mod source for searches |
| `checkUpdates` | boolean | `true` | Check for CLI updates on launch |

### Managing Settings

```bash
# View all settings
clicraft config show

# Change a setting
clicraft config set maxMemory 4G
clicraft config set javaPath /usr/lib/jvm/java-21/bin/java

# Reset to auto-detect
clicraft config set javaPath auto
```

## 🚫 Game Settings Ignore List

Controls which Minecraft settings are excluded when capturing game settings. Stored in `~/.clicraft/game-settings-ignore.json`.

### Default Ignore List

```json
[
  "fullscreen",
  "overrideWidth",
  "overrideHeight",
  "fullscreenResolution",
  "lastServer",
  "resourcePacks",
  "incompatibleResourcePacks",
  "key_*",
  "narrator",
  "highContrast",
  "telemetryOptInExtra",
  "onboardAccessibility"
]
```

### Wildcard Support

Use `*` as a wildcard suffix to match multiple settings:
- `key_*` - Matches all keybinds (`key_attack`, `key_use`, etc.)
- `soundCategory_*` - Matches all sound categories

### Managing Ignore List

```bash
# View current ignore list
clicraft config ignore

# Add a pattern
clicraft config ignore-add mouseSensitivity
clicraft config ignore-add soundCategory_*

# Remove a pattern
clicraft config ignore-remove key_*
```

## 🎮 Default Game Settings

Default Minecraft settings applied to all new instances. Stored in `~/.clicraft/default-game-settings.json`.

When you create a new instance with `clicraft create`, these settings are automatically written to the instance's `options.txt`.

### Example Configuration

```json
{
  "renderDistance": 16,
  "fov": 80,
  "guiScale": 2,
  "gamma": 0.5,
  "maxFps": 144,
  "lang": "en_us"
}
```

### Common Settings

| Setting | Type | Description | Example |
|---------|------|-------------|---------|
| `renderDistance` | number | View distance (2-32 chunks) | `16` |
| `fov` | number | Field of view (30-110) | `70` |
| `guiScale` | number | GUI scale (0=auto, 1-4) | `2` |
| `gamma` | number | Brightness (0.0-1.0) | `0.5` |
| `maxFps` | number | Frame rate limit | `144` |
| `lang` | string | Language code | `"en_us"` |
| `autoJump` | boolean | Auto-jump enabled | `false` |
| `soundCategory_master` | number | Master volume (0.0-1.0) | `1.0` |

### Managing Default Settings

```bash
# View current defaults
clicraft config defaults

# Set a default
clicraft config defaults-set renderDistance 16
clicraft config defaults-set fov 80
clicraft config defaults-set autoJump false

# Remove a default
clicraft config defaults-remove renderDistance

# Clear all defaults
clicraft config defaults-clear
```

## 🎮 Instance Configuration (mcconfig.json)

### Basic Structure

```json
{
  "configVersion": "0.3.0",
  "name": "my-instance",
  "type": "client",
  "modLoader": "fabric",
  "minecraftVersion": "1.21.11",
  "loaderVersion": "0.18.4",
  "versionId": "fabric-loader-0.18.4-1.21.11",
  "createdAt": "2026-01-19T15:51:05.322Z",
  "mods": [
    {
      "projectId": "AANobbMI",
      "slug": "sodium",
      "name": "Sodium",
      "versionId": "59wygFUQ",
      "versionNumber": "mc1.21.11-0.8.2-fabric",
      "fileName": "sodium-fabric-0.8.2+mc1.21.11.jar",
      "installedAt": "2026-01-19T15:51:06.110Z"
    }
  ],
  "gameSettings": {
    "renderDistance": 12,
    "fov": 70,
    "guiScale": 2,
    "gamma": 0.5
  }
}
```

### Configuration Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `configVersion` | string | CLIcraft version that created this config | `"0.3.0"` |
| `name` | string | Instance name | `"modded-survival"` |
| `type` | string | Instance type | `"client"` or `"server"` |
| `modLoader` | string | Mod loader type | `"fabric"` or `"forge"` |
| `minecraftVersion` | string | Minecraft version | `"1.21.11"` |
| `loaderVersion` | string | Loader version | `"0.18.4"` |
| `versionId` | string | Full version identifier | `"fabric-loader-0.18.4-1.21.11"` |
| `createdAt` | string | ISO timestamp of creation | `"2026-01-19T15:51:05.322Z"` |
| `mods` | array | List of installed mods | See below |
| `gameSettings` | object | Minecraft game settings | See below |

### Mods Array

Each mod entry contains:

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | string | Modrinth project ID |
| `slug` | string | Modrinth project slug |
| `name` | string | Display name |
| `versionId` | string | Modrinth version ID |
| `versionNumber` | string | Version string |
| `fileName` | string | JAR filename |
| `installedAt` | string | Installation timestamp |
| `updatedAt` | string | Last update timestamp (if updated) |

### Game Settings

The `gameSettings` object stores Minecraft options that will be applied when creating an instance from this config. These correspond to entries in Minecraft's `options.txt`.

```bash
# Capture current game settings to mcconfig.json
clicraft config capture

# View saved game settings
clicraft config game-settings

# Clear saved game settings
clicraft config clear-game-settings
```

Common settings you might want to share:
- `renderDistance` - View distance (2-32)
- `fov` - Field of view (30-110)
- `guiScale` - GUI scale (0=auto, 1-4)
- `gamma` - Brightness (0.0-1.0)
- `maxFps` - Frame rate limit
- `lang` - Language code (e.g., "en_us")

## 🔄 Creating from Config

When you run `clicraft create` in a directory containing `mcconfig.json`, CLIcraft will:

1. Detect the existing configuration
2. Show the config details for confirmation
3. Prompt for a new instance name
4. Create the instance with the same settings
5. Install all mods from the config
6. Apply game settings (if present)

This is perfect for:
- Sharing modpack configurations
- Replicating setups across machines
- Creating instance templates

```bash
# Share your instance config
cp my-instance/mcconfig.json ~/shared-configs/

# Create a new instance from it
cd ~/shared-configs/
clicraft create
```

## 🔐 Authentication Configuration

### Storage Location
```
~/.clicraft/auth.json
```

### Structure (DO NOT EDIT MANUALLY)

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "M.R3...",
  "expiresAt": 1705420800000,
  "profile": {
    "username": "Player123",
    "uuid": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### Security Notes

- **Never share this file** - it contains your account credentials
- **Keep it private** - set appropriate file permissions
- **Automatic management** - CLIcraft handles this file automatically
- **Token refresh** - CLIcraft refreshes tokens automatically

### File Permissions

On Linux/macOS, secure your auth file:
```bash
chmod 600 ~/.clicraft/auth.json
```

## 📁 Directory Structure

### Complete Instance Layout

```
my-instance/
├── mcconfig.json          # Instance configuration (THIS FILE)
├── launch.sh              # Generated launch script (reference)
├── assets/                # Game assets
│   ├── indexes/           # Asset indexes
│   ├── objects/           # Asset files
│   └── skins/             # Player skins cache
├── libraries/             # Java libraries
│   ├── com/               # Maven-style structure
│   ├── net/
│   └── ...
├── mods/                  # Installed mods
│   ├── sodium-*.jar
│   ├── lithium-*.jar
│   └── ...
├── natives/               # Platform-specific libraries
│   ├── liblwjgl.so        # Linux
│   ├── liblwjgl.dylib     # macOS
│   └── lwjgl.dll          # Windows
├── versions/              # Version JARs and metadata
│   ├── 1.21.1.jar
│   ├── 1.21.1.json
│   └── fabric-loader-*.jar
├── saves/                 # World saves
│   ├── New World/
│   └── Creative Testing/
├── resourcepacks/         # Resource packs
├── shaderpacks/           # Shader packs (if using shaders)
├── config/                # Mod configuration files
├── logs/                  # Game logs
│   ├── latest.log
│   └── 2024-01-15-1.log.gz
├── crash-reports/         # Crash reports (if crashes occur)
├── screenshots/           # In-game screenshots
└── options.txt            # Game settings
```


## 🔍 Troubleshooting

### Invalid JSON
If you get JSON errors:
```bash
# Validate JSON
cat mcconfig.json | python -m json.tool
```

### Wrong Java Version
Verify Java path:
```bash
java --version
which java
```

Update `javaPath` in config.

### Memory Errors
If game crashes with memory errors:
- Reduce `-Xmx` value
- Close other applications
- Check available system RAM

### Config Not Applied
If changes don't take effect:
- Verify JSON syntax is valid
- Restart the game completely
- Check for typos in field names

## 📚 Related Commands

- [`clicraft config`](commands/config.md) - Manage CLI and game settings
- [`clicraft create`](commands/create.md) - Creates initial config
- [`clicraft info`](commands/info.md) - Shows current config
- [`clicraft launch`](commands/launch.md) - Uses config to launch
- [`clicraft upgrade`](commands/upgrade.md) - Updates version fields

## 🔗 See Also

- [Commands Overview](commands.md)
- [Installation Guide](installation.md)
- [Launch Command](commands/launch.md)

---

[← Back to Home](index.md)
