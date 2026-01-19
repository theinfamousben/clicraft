---
layout: default
title: upgrade
parent: Commands
nav_order: 7
description: "Update mods and versions"
permalink: /commands/upgrade
---

# upgrade Command

Update your mods, Minecraft version, or mod loader to the latest versions.

## 📝 Synopsis

```bash
mcpkg upgrade [mod] [options]
```

## 📖 Description

The `upgrade` command helps you keep your Minecraft instance up-to-date by upgrading:

- **Individual mods** - Update a specific mod to its latest compatible version
- **All mods** - Update all installed mods at once
- **Minecraft version** - Upgrade to a newer Minecraft version
- **Mod loader** - Update Fabric or Forge to a newer version

The command shows an interactive menu where you can choose what to upgrade.

## 🎯 Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `[mod]` | Specific mod name to upgrade | No |

If no mod is specified, shows an interactive upgrade menu.

## 🎯 Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --instance <path>` | Path to instance directory | Current directory |
| `-f, --force` | Force upgrade even if already up-to-date | false |
| `--verbose` | Enable verbose output | false |

## 📋 Examples

### Interactive upgrade menu
```bash
cd my-instance
mcpkg upgrade
```

### Upgrade specific mod
```bash
mcpkg upgrade sodium
```

### Upgrade with instance path
```bash
mcpkg upgrade --instance ./my-instance
```

### Force upgrade
```bash
mcpkg upgrade sodium --force
```
Forces upgrade even if the mod is already at the latest version.

### Verbose upgrade
```bash
mcpkg upgrade --verbose
```
See detailed information about version checks and downloads.

## 🎮 Interactive Upgrade Menu

When you run `mcpkg upgrade` without arguments, you'll see:

```bash
$ mcpkg upgrade

What would you like to upgrade?

❯ All mods
  Specific mod
  Minecraft version
  Mod loader (Fabric)
  Cancel
```

### Options

#### 1. All Mods
Updates all installed mods to their latest compatible versions:
```bash
Checking for mod updates...

Updates available:
  - Sodium: 0.5.0 → 0.6.0
  - Lithium: 0.11.0 → 0.12.0
  - Iris: 1.7.0 → 1.8.0

Proceed with updates? (y/n)
```

#### 2. Specific Mod
Select a mod from your installed mods:
```bash
Select mod to upgrade:

❯ Sodium (0.5.0)
  Lithium (0.11.0)
  Iris (1.7.0)
  Fabric API (0.95.0)
  Mod Menu (8.0.0)
```

#### 3. Minecraft Version
Upgrade to a different Minecraft version:
```bash
Current version: 1.20.1
Available versions:

❯ 1.21.1 (Latest Release)
  1.21
  1.20.6
  1.20.4
  Keep current version
```

**Warning**: Upgrading Minecraft may break mod compatibility.

#### 4. Mod Loader
Update the mod loader version:
```bash
Current: Fabric 0.15.0
Available:

❯ 0.16.5 (Latest)
  0.16.0
  0.15.11
  Keep current version
```

## 🎮 Example Sessions

### Upgrade All Mods
```bash
$ cd my-instance
$ mcpkg upgrade

What would you like to upgrade? All mods

Checking for mod updates...

Updates available (3):
  - Sodium: 0.5.0 → 0.6.0
  - Lithium: 0.11.0 → 0.12.0
  - Iris: 1.7.0 → 1.8.0

No updates available (2):
  - Fabric API: 0.100.0 (latest)
  - Mod Menu: 9.0.0 (latest)

Proceed with updates? (y/n) y

✓ Downloading Sodium 0.6.0...
✓ Downloading Lithium 0.12.0...
✓ Downloading Iris 1.8.0...
✓ Removing old versions...
✓ Installing new versions...

Successfully upgraded 3 mods!
```

### Upgrade Specific Mod
```bash
$ mcpkg upgrade sodium

Checking for Sodium updates...

Current version: 0.5.0
Latest version:  0.6.0

Changelog:
  - Improved rendering performance
  - Fixed memory leak
  - Updated for Minecraft 1.21.1

Upgrade to 0.6.0? (y/n) y

✓ Downloading Sodium 0.6.0...
✓ Installing...
✓ Cleaning up...

Sodium upgraded successfully!
Old version removed: sodium-fabric-0.5.0.jar
New version installed: sodium-fabric-0.6.0.jar
```

### No Updates Available
```bash
$ mcpkg upgrade

Checking for mod updates...

All mods are up-to-date!
  - Sodium: 0.6.0 (latest)
  - Lithium: 0.12.0 (latest)
  - Iris: 1.8.0 (latest)

No updates available.
```

## 🔍 How It Works

### Version Detection
1. Reads your current Minecraft version and loader from `mcconfig.json`
2. Scans installed mods in `mods/` directory
3. Queries Modrinth API for latest compatible versions
4. Compares versions and shows available updates

### Compatibility Checking
Ensures updates are compatible with:
- Your Minecraft version
- Your mod loader (Fabric/Forge)
- Other installed mods (dependency checking)

### Safe Upgrade Process
1. Downloads new version first
2. Verifies download integrity
3. Backs up old version (temporarily)
4. Installs new version
5. Removes old version
6. Updates instance configuration

## 🎯 Use Cases

### Monthly Maintenance
```bash
# Check for updates regularly
cd my-instance
mcpkg upgrade
# Select "All mods"
```

### After Minecraft Update
```bash
# Upgrade Minecraft first
mcpkg upgrade
# Select "Minecraft version"

# Then update mods for new version
mcpkg upgrade
# Select "All mods"
```

### Fix Mod Issues
```bash
# Force reinstall problematic mod
mcpkg upgrade sodium --force
```

### Keep Loader Updated
```bash
# Update Fabric/Forge
mcpkg upgrade
# Select "Mod loader"
```

### Selective Updates
```bash
# Update only specific mods
mcpkg upgrade sodium
mcpkg upgrade lithium
# Leave other mods as-is
```

## ⚙️ Version Management

### Semantic Versioning
Mods typically use semantic versioning: `MAJOR.MINOR.PATCH`

- **Patch** (0.5.0 → 0.5.1): Bug fixes, safe to upgrade
- **Minor** (0.5.0 → 0.6.0): New features, usually safe
- **Major** (0.5.0 → 1.0.0): Breaking changes, test carefully

### Version Compatibility

```bash
# Check compatibility before upgrading
mcpkg info --verbose
# Note Minecraft and loader versions

mcpkg upgrade
# Upgrades respect compatibility
```

## 📋 Backup Recommendations

Before upgrading, backup your instance:

```bash
# Create backup
cd ..
tar -czf my-instance-backup.tar.gz my-instance/

# Then upgrade
cd my-instance
mcpkg upgrade
```

Or backup just your worlds:
```bash
cd my-instance
tar -czf saves-backup.tar.gz saves/
```

## ⚠️ Common Issues

### "No updates available"
All mods are already at latest versions:
- This is good! Nothing to do.
- Use `--force` to reinstall anyway

### "Incompatible version"
The latest mod version doesn't support your Minecraft version:
- Upgrade Minecraft first
- Or wait for mod to be updated
- Or use an older Minecraft version

### "Download failed"
Network or Modrinth issues:
- Check internet connection
- Try again later
- Check Modrinth status

### "Mod not found"
The mod isn't in your instance:
```bash
# Check installed mods
mcpkg info

# Install it first
mcpkg install sodium
```

### Broken After Upgrade
If the game doesn't work after upgrading:
```bash
# Restore from backup
cd ..
rm -rf my-instance
tar -xzf my-instance-backup.tar.gz

# Or reinstall problematic mod
cd my-instance
rm mods/problematic-mod*.jar
mcpkg install problematic-mod
```

## 💡 Best Practices

### 1. Check Before Upgrading
```bash
mcpkg info
mcpkg upgrade  # Just to see what's available
# Exit without upgrading to review
```

### 2. Read Changelogs
Review what changed before upgrading:
- Look at mod pages on Modrinth
- Check for breaking changes
- Read about new features

### 3. Upgrade Gradually
Don't upgrade everything at once:
```bash
# Upgrade one mod
mcpkg upgrade sodium

# Test the game
mcpkg launch

# If OK, upgrade another
mcpkg upgrade lithium
```

### 4. Test After Upgrades
```bash
# After upgrading
mcpkg upgrade

# Test launch
mcpkg launch --offline

# Check everything works
# Then play normally
```

### 5. Keep Loader Updated
Update your mod loader regularly:
```bash
# Every few weeks
mcpkg upgrade
# Select "Mod loader"
```

## 🔄 Downgrading

To downgrade a mod, manually remove and reinstall:

```bash
# Remove current version
rm mods/sodium-*.jar

# Install older version
# (manually download from Modrinth)
# or wait for mcpkg downgrade support
```

## 📊 Update Frequency

How often to run upgrades:

- **Performance mods**: Check weekly (often updated)
- **Stable mods**: Check monthly
- **Mod loader**: Check bi-weekly
- **Minecraft**: Upgrade when stable versions release

## 🎮 Minecraft Version Upgrades

### Careful Upgrading
Upgrading Minecraft version can break mods:

```bash
# Before upgrading Minecraft
mcpkg info --verbose > pre-upgrade-info.txt

# Upgrade Minecraft
mcpkg upgrade
# Select "Minecraft version"

# Test each mod
mcpkg launch --offline

# Some mods may not work - reinstall
mcpkg upgrade  # To get compatible versions
```

### Rolling Back
If Minecraft upgrade breaks things:
- Restore from backup
- Or manually edit `mcconfig.json`:

```json
{
  "minecraftVersion": "1.20.1"  // Change back
}
```

Then reinstall mods for old version.

## 📚 Related Commands

- [`mcpkg install`](install.md) - Install mods before upgrading
- [`mcpkg info`](info.md) - Check current versions
- [`mcpkg search`](search.md) - Find mods to upgrade to
- [`mcpkg create`](create.md) - Instance with specific versions

## 🔍 Version Checking

Check versions without upgrading:

```bash
# Current versions
mcpkg info

# Available versions (via search)
mcpkg search sodium --version 1.21.1
```

## 🆘 Troubleshooting

### Upgrade Stuck
If upgrade hangs:
- Press Ctrl+C to cancel
- Check network connection
- Try again with `--verbose`

### Partial Upgrade
If some mods upgrade but others fail:
- Check `mcpkg info` to see what upgraded
- Try upgrading failed mods individually
- Use `--verbose` to see errors

### Game Won't Launch After Upgrade
- Check logs: `cat logs/latest.log`
- Check mod compatibility
- Restore from backup
- Downgrade problematic mods

## 🔗 See Also

- [Commands Overview](../commands.md)
- [Configuration Guide](../configuration.md)
- [Install Command](install.md)
- [Info Command](info.md)

---

[← Back to Commands](../commands.md)
