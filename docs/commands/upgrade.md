---
layout: default
title: upgrade
parent: Commands
nav_order: 8
description: "Update mods and versions"
permalink: /commands/upgrade
---

# upgrade

Update mods, mod loader, or Minecraft version.

```bash
clicraft upgrade [target] [options]
```

## Targets

| Target | Description |
|--------|-------------|
| (none) | Interactive menu |
| `mods` / `all` | Update all mods |
| `loader` | Update mod loader |
| `minecraft` / `mc` | Update Minecraft version |
| `config` | Update config format |
| `<mod-slug>` | Update specific mod |

## Options

| Option | Description |
|--------|-------------|
| `-i, --instance <path>` | Instance path |
| `-f, --force` | Force even if up-to-date |
| `-c, --check` | Check for updates without installing |
| `--verbose` | Detailed output |

## Examples

```bash
clicraft upgrade                 # Interactive menu
clicraft upgrade mods            # Update all mods
clicraft upgrade loader          # Update Fabric/Forge
clicraft upgrade sodium          # Update specific mod
clicraft upgrade sodium -f       # Force update
clicraft upgrade --check         # Check for updates only
clicraft upgrade mods --check    # Check mods for updates
```

## Check Mode

Use `--check` to see available updates without downloading:

```bash
$ clicraft upgrade --check
🔍 Checking 7 mods for updates...

📦 2 update(s) available:

  sodium
    0.5.3 → 0.5.4
  lithium
    0.11.2 → 0.12.0

Run clicraft upgrade mods to install updates.
```
