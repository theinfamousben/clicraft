---
layout: default
title: Commands
nav_order: 3
has_children: true
description: "Complete command reference"
permalink: /commands
---

# Commands

## Instance Management

| Command | Description |
|---------|-------------|
| [`create`](commands/create.md) | Create a new instance |
| [`import`](commands/import.md) | Import a modpack (.mrpack) |
| [`info`](commands/info.md) | View instance details |
| [`launch`](commands/launch.md) | Start Minecraft |
| [`alias`](commands/alias.md) | Manage instance shortcuts |

## Mod Management

| Command | Description |
|---------|-------------|
| [`search`](commands/search.md) | Find mods, resource packs, shaders |
| [`install`](commands/install.md) | Install mods, resource packs, shaders |
| [`uninstall`](commands/uninstall.md) | Remove mods |
| [`upgrade`](commands/upgrade.md) | Update mods/loader/Minecraft |

## Account & Config

| Command | Description |
|---------|-------------|
| [`auth`](commands/auth.md) | Manage Microsoft accounts |
| [`config`](commands/config.md) | CLI and game settings |
| [`completions`](commands/completions.md) | Generate shell completions |

---

## Quick Reference

```bash
clicraft create                    # Interactive instance setup
clicraft import <file.mrpack>      # Import modpack
clicraft search <query>            # Find mods
clicraft search <query> -r         # Find resource packs
clicraft search <query> -s         # Find shaders
clicraft install <mod...>          # Install by slug
clicraft install <pack> -r         # Install resource pack
clicraft uninstall [mod]           # Remove (interactive if no mod specified)
clicraft upgrade [mod]             # Update mods/loader (interactive menu)
clicraft upgrade --check           # Check for updates without installing
clicraft launch [alias]            # Start game
clicraft info                      # Show instance info
clicraft auth login                # Add Microsoft account
clicraft config                    # View settings
clicraft completions bash          # Generate bash completions
```

### Common Options

Most commands support:
- `-i, --instance <path>` — Target a specific instance
- `-f, --force` — Skip confirmations or force action
- `--verbose` — Detailed output
