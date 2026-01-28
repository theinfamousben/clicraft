# Alias Command

The `alias` command allows you to create shortcuts for your Minecraft instances, making it easy to launch them without needing to remember or type full paths.

## Usage

```bash
clicraft alias [action] [args...]
```

## Actions

### List Aliases

List all configured aliases:

```bash
clicraft alias list
clicraft alias ls
clicraft alias          # default action
```

This shows all aliases with their paths and instance information (mod loader, Minecraft version, type).

### Add Alias

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

### Remove Alias

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

## Using Aliases with Launch

Once you've created an alias, you can use it with the `launch` command:

```bash
clicraft launch myworld
clicraft launch my-modded-world --offline
clicraft launch survival --verbose
```

This is equivalent to using the `--instance` flag:

```bash
clicraft launch --instance /path/to/instance
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
  "myworld": "/Users/username/minecraft/my-world",
  "survival": "/Users/username/Games/survival-server"
}
```

## Tips

- Use short, memorable names for frequently-used instances
- Alias names cannot contain spaces
- If an alias already exists, adding it again will update the path
- The `alias list` command shows warnings for missing paths or invalid instances
