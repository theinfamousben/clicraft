---
layout: default
title: create
parent: Commands
nav_order: 1
description: "Create a new Minecraft instance"
permalink: /commands/create
---

# create Command

Create a new Minecraft instance with your choice of mod loader (Fabric or Forge).

## 📝 Synopsis

```bash
clicraft create [options]
```

## 📖 Description

The `create` command guides you through an interactive process to set up a new Minecraft instance. It will:

1. Prompt you for instance configuration (name, type, loader, versions)
2. Download the Minecraft client or server files
3. Download the selected mod loader (Fabric or Forge)
4. Download all required libraries and dependencies
5. Download game assets (for client instances)
6. Set up the directory structure
7. Generate configuration files

## 🎯 Options

| Option | Description |
|--------|-------------|
| `--verbose` | Enable verbose output to see detailed progress |

## 💡 Interactive Prompts

When you run `clicraft create`, you'll be prompted for:

### 1. Instance Name
The name for your instance directory. This will be used as the folder name.
- Must be a valid directory name
- Should be descriptive (e.g., "vanilla-1.21", "modded-fabric-latest")

### 2. Instance Type
Choose between:
- **Client** - For playing Minecraft yourself
- **Server** - For hosting a multiplayer server

### 3. Mod Loader
Choose your mod loader:
- **Fabric** - Lightweight, fast, modern mod loader
- **Forge** - Traditional, widely-supported mod loader

### 4. Minecraft Version
Select the Minecraft version you want to use. Common choices:
- Latest release (e.g., 1.21.1)
- Stable versions with good mod support (e.g., 1.20.1, 1.19.2)
- Specific version for mod compatibility

### 5. Loader Version
Choose the version of your selected mod loader:
- Latest version (recommended for most users)
- Specific version for compatibility

## 📂 Instance Structure

After creation, your instance will have this structure:

```
my-instance/
├── mcconfig.json      # Instance configuration
├── launch.sh          # Generated launch script (reference)
├── assets/            # Game assets (sounds, textures, etc.)
├── libraries/         # Java libraries and dependencies
├── mods/              # Installed mods (empty initially)
├── natives/           # Native libraries (platform-specific)
├── versions/          # Version JARs and JSON metadata
├── saves/             # World saves (created when you play)
├── resourcepacks/     # Resource packs
└── logs/              # Game logs
```

## 📋 Examples

### Basic usage
```bash
clicraft create
```

Then follow the interactive prompts.

### Verbose output
```bash
clicraft create --verbose
```

See detailed progress as files are downloaded and configured.

## 🎮 Example Session

```bash
$ clicraft create

? Enter instance name: my-modded-world
? Select instance type: Client
? Select mod loader: Fabric
? Select Minecraft version: 1.21.1
? Select Fabric version: 0.16.5

Creating instance my-modded-world...
✓ Downloading Minecraft 1.21.1...
✓ Downloading Fabric loader 0.16.5...
✓ Downloading libraries...
✓ Downloading assets...
✓ Creating directory structure...
✓ Writing configuration...

Instance created successfully at: ./my-modded-world

Next steps:
  cd my-modded-world
  clicraft login              # Login to Microsoft account
  clicraft install <mod>      # Install mods
  clicraft launch             # Launch the game
```

## 🔍 What Happens Behind the Scenes

1. **Manifest Download**: Fetches the Minecraft version manifest from Mojang
2. **Version Selection**: Downloads specific version metadata
3. **Loader Setup**: Downloads and configures Fabric or Forge
4. **Library Resolution**: Downloads all required Java libraries
5. **Asset Download**: Fetches game assets (textures, sounds, language files)
6. **Native Libraries**: Downloads platform-specific native libraries
7. **Configuration**: Creates `mcconfig.json` with all instance settings

## ⚙️ Configuration File

The created `mcconfig.json` contains:

```json
{
  "name": "my-instance",
  "type": "client",
  "loader": "fabric",
  "minecraftVersion": "1.21.1",
  "loaderVersion": "0.16.5",
  "javaPath": "java",
  "jvmArgs": ["-Xmx2G", "-Xms2G"]
}
```

You can manually edit this file to customize Java settings and other configurations.

## 🎯 Use Cases

### Development Environment
```bash
# Create a clean testing environment
clicraft create
# Name: mod-testing
# Type: Client
# Loader: Fabric
# Version: Latest
```

### Server Setup
```bash
# Create a multiplayer server
clicraft create
# Name: survival-server
# Type: Server
# Loader: Forge
# Version: 1.20.1
```

### Multiple Instances
```bash
# Create separate instances for different mod packs
clicraft create  # vanilla-survival
clicraft create  # tech-mods
clicraft create  # creative-building
```

## ⚠️ Common Issues

### Download Failures
If downloads fail:
- Check your internet connection
- Try again - downloads will resume from where they left off
- Use `--verbose` to see detailed error messages

### Disk Space
Creating an instance requires:
- **Client**: ~500MB - 2GB depending on version
- **Server**: ~50MB - 500MB depending on version

Make sure you have sufficient disk space available.

### Java Version
Ensure you have Java 21 or higher installed:
```bash
java --version
```

## 🆘 Troubleshooting

### "Failed to download Minecraft version manifest"
This usually indicates a network issue. Check your internet connection and try again.

### "Unsupported Minecraft version"
The version you selected may not be supported by the chosen mod loader. Try:
- A more recent version
- Checking the mod loader's supported versions

### Permission Errors
On Linux/macOS, ensure you have write permissions in the current directory:
```bash
ls -la
```

## 📚 Related Commands

After creating an instance:
- [`clicraft install`](install.md) - Install mods to your new instance
- [`clicraft login`](login.md) - Login for online play
- [`clicraft launch`](launch.md) - Start your instance
- [`clicraft info`](info.md) - View instance details

## 🔗 See Also

- [Installation Guide](../installation.md)
- [Commands Overview](../commands.md)
- [Configuration Guide](../configuration.md)

---

[← Back to Commands](../commands.md) | [Next: search →](search.md)
