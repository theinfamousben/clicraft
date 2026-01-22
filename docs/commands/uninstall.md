---
layout: default
title: uninstall
parent: Commands
nav_order: 4
description: "Uninstall mods from your Minecraft instance"
permalink: /commands/uninstall
---

# uninstall Command

Remove mods from your Minecraft instance.

## 📝 Synopsis

```bash
clicraft uninstall [mod] [options]
```

## 📖 Description

The `uninstall` command removes mods from your Minecraft instance. It:

1. Deletes the mod JAR file from the `mods/` folder
2. Removes the mod entry from `mcconfig.json`

If no mod is specified, an interactive multi-select prompt appears allowing you to choose multiple mods to uninstall.

## 🎯 Options

| Option | Description |
|--------|-------------|
| `-i, --instance <path>` | Path to the instance directory |
| `-f, --force` | Skip confirmation prompt |
| `--verbose` | Enable verbose output |

## 📋 Examples

### Uninstall a specific mod
```bash
clicraft uninstall sodium
```

### Uninstall with force (no confirmation)
```bash
clicraft uninstall sodium --force
```

### Interactive selection
```bash
clicraft uninstall
```

This opens a checkbox prompt to select multiple mods:
```
? Select mods to uninstall:
 ◯ Sodium (mc1.21.11-0.8.2-fabric)
 ◯ Lithium (mc1.21.11-0.12.1-fabric)
 ◯ Iris Shaders (1.8.0+1.21.1)
 ◯ Fabric API (0.100.0+1.21.1)
```

### Uninstall from specific instance
```bash
clicraft uninstall sodium --instance ~/my-instance
```

## 🎮 Example Session

```bash
$ clicraft uninstall sodium

🗑️  Uninstalling "Sodium"...

? Are you sure you want to uninstall Sodium? Yes
Deleted: mods/sodium-fabric-0.8.2+mc1.21.11.jar

✅ Successfully uninstalled Sodium
```

### Force uninstall (no prompt)
```bash
$ clicraft uninstall sodium --force

🗑️  Uninstalling "Sodium"...

Deleted: mods/sodium-fabric-0.8.2+mc1.21.11.jar

✅ Successfully uninstalled Sodium
```

## 🔍 Finding Mod Names

You can use the mod's slug, name, or project ID:

```bash
# All of these work
clicraft uninstall sodium
clicraft uninstall Sodium
clicraft uninstall AANobbMI
```

To see installed mods:
```bash
clicraft info --mods
```

## ⚠️ Notes

- Uninstalling a mod does not automatically uninstall its dependencies
- If a mod file was manually deleted, the command will still remove the config entry
- Use `--force` in scripts to skip the confirmation prompt

## 📚 Related Commands

- [`clicraft install`](install.md) - Install mods
- [`clicraft info --mods`](info.md) - List installed mods
- [`clicraft upgrade`](upgrade.md) - Upgrade mods to newer versions
- [`clicraft search`](search.md) - Find mods on Modrinth

## 🔗 See Also

- [Commands Overview](../commands.md)
- [Installation Guide](../installation.md)

---

[← Back to Commands](../commands.md)
