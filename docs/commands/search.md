---
layout: default
title: search
parent: Commands
nav_order: 2
description: "Search for mods, resource packs, or shaders on Modrinth"
permalink: /commands/search
---

# search

Find mods, resource packs, or shaders on Modrinth.

```bash
clicraft search <query> [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-l, --limit <n>` | Number of results | 10 |
| `-m, --mc-version <ver>` | Filter by Minecraft version | — |
| `--loader <loader>` | Filter by loader (fabric/forge/quilt/neoforge) | — |
| `-i, --instance <path>` | Use version/loader from instance | — |
| `--any` | Ignore instance filtering | — |
| `-r, --resourcepacks` | Search resource packs | — |
| `-s, --shaders` | Search shaders | — |

## Instance-Aware Search

When run from an instance directory (or with `-i`), search automatically filters by that instance's Minecraft version and mod loader.

```bash
cd my-fabric-instance
clicraft search sodium        # Filters for fabric + MC version

clicraft search sodium --any  # Search all versions
```

## Examples

```bash
# Search mods
clicraft search sodium
clicraft search "world gen" --loader fabric --limit 5

# Search resource packs
clicraft search faithful --resourcepacks
clicraft search faithful -r

# Search shaders
clicraft search complementary --shaders
clicraft search bsl -s -m 1.20.1
```

## Output

Results show: name, slug (for install), description, and download count. Mods also show supported loaders.
