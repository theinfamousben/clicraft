---
layout: default
title: create
parent: Commands
nav_order: 1
description: "Create a new Minecraft instance"
permalink: /commands/create
---

# create

Create a new Minecraft instance with Fabric or Forge.

```bash
clicraft create [options]
```

## Options

| Option | Description |
|--------|-------------|
| `-p, --path <path>` | Install location |
| `-f, --force` | Overwrite existing instance |
| `--verbose` | Detailed output |

## What It Does

Interactive prompts guide you through:
1. Instance name
2. Type (client/server)
3. Mod loader (Fabric/Forge)
4. Minecraft version
5. Loader version

Downloads all required files (client, libraries, assets) and sets up the directory structure.

## From Existing Config

Run `clicraft create` in a directory with an `mcconfig.json` to recreate that instance—useful for sharing modpack setups.

## Instance Structure

```
my-instance/
├── mcconfig.json    # Instance config
├── mods/            # Installed mods
├── versions/        # Game files
├── libraries/       # Dependencies
├── assets/          # Game assets (client only)
└── saves/           # World saves
```
