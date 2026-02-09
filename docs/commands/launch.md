---
layout: default
title: launch
parent: Commands
nav_order: 6
description: "Launch your Minecraft instance"
permalink: /commands/launch
---

# launch

Start Minecraft.

```bash
clicraft launch [alias] [options]
```

## Options

| Option | Description |
|--------|-------------|
| `-i, --instance <path>` | Instance path |
| `-l, --last` | Launch last-used instance |
| `--offline` | Skip authentication |
| `--verbose` | Show launch details |

## Examples

```bash
cd my-instance
clicraft launch                  # Launch current directory

clicraft launch myworld          # Launch by alias
clicraft launch -l               # Launch last instance
clicraft launch --offline        # Offline mode
```

## Authentication

Automatically refreshes expired tokens. Use `--offline` to skip authentication entirely (single-player only).

## Game Settings

If `autoLoadConfigOnLaunch` is enabled, saved game settings from `mcconfig.json` are applied to `options.txt` before launch.
