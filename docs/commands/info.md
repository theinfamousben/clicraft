---
layout: default
title: info
parent: Commands
nav_order: 7
description: "View instance information"
permalink: /commands/info
---

# info

View instance details.

```bash
clicraft info [options]
```

## Options

| Option | Description |
|--------|-------------|
| `-i, --instance <path>` | Instance path |
| `--verbose` | Full details |
| `--mods` | List only mods |

## Examples

```bash
clicraft info
clicraft info --mods
clicraft info -i ~/minecraft/server
```

## Output

Shows:
- Instance name and type
- Minecraft version and mod loader
- Installed mods with versions
- Storage breakdown (mods, assets, libraries, etc.)
