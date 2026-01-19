---
layout: default
title: Commands
nav_order: 3
has_children: true
description: "Complete command reference"
permalink: /commands
---

# Commands Overview

mcpkg provides a comprehensive set of commands to manage your Minecraft instances and mods. This page provides a quick reference to all available commands.

## 📚 Command Categories

### Instance Management
Commands for creating and managing Minecraft instances.

| Command | Description |
|---------|-------------|
| [`create`](commands/create.md) | Create a new Minecraft instance with Fabric or Forge |
| [`info`](commands/info.md) | View detailed information about an instance |
| [`launch`](commands/launch.md) | Launch a Minecraft instance |

### Mod Management
Commands for finding, installing, and managing mods.

| Command | Description |
|---------|-------------|
| [`search`](commands/search.md) | Search for mods on Modrinth |
| [`install`](commands/install.md) | Install a mod to your instance |
| [`upgrade`](commands/upgrade.md) | Upgrade mods, Minecraft version, or mod loader |

### Authentication
Commands for managing your Microsoft account authentication.

| Command | Description |
|---------|-------------|
| [`login`](commands/login.md) | Login to your Microsoft account |
| `logout` | Logout from your Microsoft account |
| `status` | Check your current login status |

## 🔍 Quick Command Reference

### Create a new instance
```bash
mcpkg create
```
Interactive prompts will guide you through instance configuration.

### Search for mods
```bash
mcpkg search <query> [options]
```
**Options:**
- `-l, --limit <number>` - Number of results (default: 10)
- `-v, --version <version>` - Filter by Minecraft version
- `--loader <loader>` - Filter by mod loader (fabric, forge, quilt, neoforge)
- `--verbose` - Enable verbose output

### Install a mod
```bash
mcpkg install <mod> [options]
```
**Options:**
- `-i, --instance <path>` - Path to instance directory
- `-f, --force` - Force reinstall if already installed
- `--verbose` - Enable verbose output

### Login to Microsoft
```bash
mcpkg login [options]
```
**Options:**
- `-f, --force` - Force re-login
- `--verbose` - Enable verbose output

### Check login status
```bash
mcpkg status
```

### Logout
```bash
mcpkg logout
```

### Launch the game
```bash
mcpkg launch [options]
```
**Options:**
- `-i, --instance <path>` - Path to instance directory
- `--offline` - Launch in offline mode
- `--verbose` - Enable verbose output

### View instance info
```bash
mcpkg info [options]
```
**Options:**
- `-i, --instance <path>` - Path to instance directory
- `--verbose` - Show detailed information

### Upgrade mods or loader
```bash
mcpkg upgrade [mod] [options]
```
**Options:**
- `-i, --instance <path>` - Path to instance directory
- `-f, --force` - Force upgrade
- `--verbose` - Enable verbose output

## 💡 Common Workflows

### Setting up a new modded Minecraft instance

```bash
# 1. Create a new instance
mcpkg create

# 2. Navigate to instance directory
cd my-instance

# 3. Login to Microsoft (for online play)
mcpkg login

# 4. Search for mods
mcpkg search sodium

# 5. Install mods
mcpkg install sodium
mcpkg install lithium
mcpkg install iris

# 6. Launch the game
mcpkg launch
```

### Managing an existing instance

```bash
# Check instance information
cd my-instance
mcpkg info --verbose

# Update mods
mcpkg upgrade

# Launch the game
mcpkg launch
```

### Working with multiple instances

```bash
# Install mod to specific instance
mcpkg install sodium --instance ./instance1

# Launch specific instance
mcpkg launch --instance ./instance2

# View info for specific instance
mcpkg info --instance ./instance3
```

## 🎓 Learning More

Each command has detailed documentation with examples and options:

- [**create**](commands/create.md) - Create instances
- [**search**](commands/search.md) - Find mods
- [**install**](commands/install.md) - Add mods to instances
- [**login**](commands/login.md) - Authentication
- [**launch**](commands/launch.md) - Start the game
- [**info**](commands/info.md) - Instance details
- [**upgrade**](commands/upgrade.md) - Update mods and loaders

## 🔧 Global Options

Most commands support these common options:

- `--verbose` - Enable detailed output for debugging
- `--help` - Show help for a specific command

Example:
```bash
mcpkg install --help
```

## 🆘 Getting Help

For additional help:

- Use `mcpkg <command> --help` for command-specific help
- Visit the [GitHub repository](https://github.com/theinfamousben/mcpkg) for issues and discussions
- Check the [configuration guide](configuration.md) for advanced settings

---

[← Back to Home](index.md) | [Installation →](installation.md)
