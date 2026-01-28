---
layout: default
title: alias
parent: Commands
nav_order: 10
description: "Manage Instance Aliases"
permalink: /commands/alias
---

# Alias Command

The `alias` command allows you to create shortcuts for your Minecraft instances, making it easy to launch them without needing to remember or type full paths.

## Usage

```bash
# Declaring an alias
clicraft alias [action] [args...]

# Launching from an alias
clicraft launch [alias]
```

## Arguments

| Argument | Action |
| -------- | ------ |
| `add <name> [path]` | Add an alias |
| `list, ls` | List aliases and their corresponding paths |
| `remove, rm, delete` | Remove an alias |


## Actions

## `alias list`

List all configured aliases:

```bash
clicraft alias list
clicraft alias ls
clicraft alias          # default action
```

This shows all aliases with their paths and instance information (mod loader, Minecraft version, type).

### `alias add`

Create a new alias for an instance:

```bash
clicraft alias add <name> [path]
```

- `<name>`: The alias name (no spaces allowed)
- `[path]`: Path to the instance directory (defaults to current directory)

**Examples:**

```bash
# Add alias for instance in current directory
clicraft alias add myworld

# Add alias for instance at specific path
clicraft alias add survival ~/minecraft/survival-world

# Add alias with hyphenated name
clicraft alias add my-modded-world /path/to/instance
```

### `alias remove`

Remove an existing alias:

```bash
clicraft alias remove <name|path>
clicraft alias rm <name|path>
clicraft alias delete <name|path>
```

You can remove by alias name or by path:

```bash
# Remove by name
clicraft alias remove myworld

# Remove by path
clicraft alias remove ~/minecraft/survival-world
```

## Alias Creation During Instance Creation

When you create a new instance with `clicraft create`, you'll be prompted to create an alias:

```
? Would you like to create an alias for this instance? (Y/n) 
? Alias name: my-new-instance
```

The default alias name is based on your instance name, converted to lowercase with spaces replaced by hyphens.

## Storage

Aliases are stored in `~/.clicraft/aliases.json`. This file maps alias names to their instance paths:

```json
{
  "myworld": "~/minecraft/my-world",
  "survival": "~/Games/survival-server"
}
```
