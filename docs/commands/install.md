---
layout: default
title: install
parent: Commands
nav_order: 3
description: "Install mods, resource packs, or shaders to your instance"
permalink: /commands/install
---

# install

Install mods, resource packs, or shaders from Modrinth.

```bash
clicraft install <items...> [options]
```

## Options

| Option | Description |
|--------|-------------|
| `-i, --instance <path>` | Target instance (default: current directory) |
| `-f, --force` | Reinstall if already installed |
| `--no-deps` | Skip automatic dependency installation |
| `-r, --resourcepacks` | Install as resource packs |
| `-s, --shaders` | Install as shaders |
| `--verbose` | Detailed output |

## Examples

```bash
cd my-instance

# Mods
clicraft install sodium
clicraft install sodium lithium iris    # Multiple mods
clicraft install sodium -f              # Force reinstall
clicraft install sodium --no-deps       # Skip dependencies

# Resource packs
clicraft install faithful-32x --resourcepacks
clicraft install faithful-32x -r

# Shaders
clicraft install complementary-reimagined --shaders
clicraft install bsl-shaders -s
```

## How It Works

1. Finds the project on Modrinth by slug
2. Selects the latest version matching your Minecraft version (and loader for mods)
3. Downloads to appropriate folder:
   - Mods → `mods/`
   - Resource packs → `resourcepacks/`
   - Shaders → `shaderpacks/`
4. Tracks in `mcconfig.json`

## Dependencies

Required mod dependencies are installed automatically (configurable with `autoInstallDeps` setting).

Skip for a single install with `--no-deps`:

```bash
clicraft install sodium --no-deps
```
