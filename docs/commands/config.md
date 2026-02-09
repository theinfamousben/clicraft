---
layout: default
title: config
parent: Commands
nav_order: 9
description: "Manage CLI and game settings"
permalink: /commands/config
---

# config

Manage CLI settings and game settings.

```bash
clicraft config [action] [args...]
```

## CLI Settings

```bash
clicraft config                     # View settings (default)
clicraft config show                # Same as above
clicraft config set <key> <value>   # Change setting
```

Available keys: `jvmArgs`, `checkUpdates`, `autoSaveToConfig`, `autoLoadConfigOnLaunch`

## Game Settings Ignore List

Controls which Minecraft options are excluded when capturing.

```bash
clicraft config ignore                  # View list
clicraft config ignore-add <pattern>    # Add (supports * wildcard)
clicraft config ignore-remove <pattern> # Remove
```

## Default Game Settings

Applied to new instances.

```bash
clicraft config defaults                    # View
clicraft config defaults-set <key> <value>  # Set
clicraft config defaults-remove <key>       # Remove
clicraft config defaults-clear              # Clear all
```

## Instance Game Settings

```bash
clicraft config capture                # Save current options.txt to mcconfig
clicraft config game-settings          # View saved settings
clicraft config clear-game-settings    # Remove saved settings
```

Use `-i, --instance <path>` to target a specific instance.
