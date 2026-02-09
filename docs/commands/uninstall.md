---
layout: default
title: uninstall
parent: Commands
nav_order: 4
description: "Remove mods from your instance"
permalink: /commands/uninstall
---

# uninstall

Remove mods from your instance.

```bash
clicraft uninstall [mod] [options]
```

## Options

| Option | Description |
|--------|-------------|
| `-i, --instance <path>` | Target instance |
| `-f, --force` | Skip confirmation |
| `--verbose` | Detailed output |

## Examples

```bash
clicraft uninstall sodium           # Remove specific mod
clicraft uninstall sodium -f        # Skip confirmation
clicraft uninstall                  # Interactive multi-select
```

## Interactive Mode

Run without arguments to select multiple mods from a checkbox list.
