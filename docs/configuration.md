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
- Instance settings (`mcconfig.json`)
- Authentication data (`~/.mcpkg/auth.json`)
- Future: Configuration templates (planned feature)

## 🏠 Configuration Locations

### Instance Configuration
Each instance has its own configuration file:
```
instance-directory/
└── mcconfig.json
```

### Global Authentication
Authentication tokens are stored globally:
```
~/.mcpkg/auth.json
```

This file is shared across all instances on your system.

## ⚙️ Instance Configuration (mcconfig.json)

### Basic Structure

```json
{
  "name": "my-instance",
  "type": "client",
  "minecraftVersion": "1.21.1",
  "loader": "fabric",
  "loaderVersion": "0.16.5",
  "javaPath": "java",
  "jvmArgs": ["-Xmx2G", "-Xms2G"]
}
```

### Configuration Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Instance name | `"modded-survival"` |
| `type` | string | Instance type | `"client"` or `"server"` |
| `minecraftVersion` | string | Minecraft version | `"1.21.1"` |
| `loader` | string | Mod loader type | `"fabric"` or `"forge"` |
| `loaderVersion` | string | Loader version | `"0.16.5"` |
| `javaPath` | string | Path to Java executable | `"java"` or `"/usr/bin/java"` |
| `jvmArgs` | array | JVM arguments | `["-Xmx4G", "-Xms4G"]` |


#### Recommended Memory by Usage

| Use Case | Recommended Memory |
|----------|-------------------|
| Vanilla Minecraft | 2-3GB |
| Light modpacks | 3-4GB |
| Medium modpacks | 4-6GB |
| Heavy modpacks | 6-8GB |
| Extreme modpacks | 8-12GB |
| Small servers (1-5 players) | 2-4GB |
| Medium servers (10-20 players) | 4-8GB |
| Large servers (50+ players) | 8-16GB+ |



## 🔐 Authentication Configuration

### Storage Location
```
~/.mcpkg/auth.json
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
chmod 600 ~/.mcpkg/auth.json
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
