---
layout: default
title: alias
parent: Commands
nav_order: 10
description: "Manage instance aliases"
permalink: /commands/alias
---

# alias

Create shortcuts for instances.

```bash
clicraft alias [action] [args...]
```

## Actions

| Action | Description |
|--------|-------------|
| `list` / `ls` | List aliases (default) |
| `add <name> [path]` | Create alias (path defaults to cwd) |
| `remove <name\|path>` | Delete alias |

## Examples

```bash
clicraft alias                          # List all
clicraft alias add myworld              # Alias current directory
clicraft alias add server ~/mc/server   # Alias specific path
clicraft alias remove myworld           # Remove by name
```

## Using Aliases

```bash
clicraft launch myworld     # Launch by alias
clicraft info -i myworld    # Works with other commands too
```

Aliases are also suggested during `clicraft create`.
