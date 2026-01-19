# info Command

View detailed information about your Minecraft instance.

## 📝 Synopsis

```bash
mcpkg info [options]
```

## 📖 Description

The `info` command displays comprehensive information about your Minecraft instance, including:

- Instance configuration
- Installed mods and their versions
- Storage usage breakdown
- World saves
- Resource packs
- Minecraft and loader versions

This is useful for checking what's installed, troubleshooting issues, or getting an overview of your instance.

## 🎯 Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --instance <path>` | Path to instance directory | Current directory |
| `--verbose` | Show detailed information | false |

## 📋 Examples

### View basic info
```bash
cd my-instance
mcpkg info
```

### View detailed info
```bash
mcpkg info --verbose
```

### Check specific instance
```bash
mcpkg info --instance ./my-modded-world
```

### Quick instance check
```bash
mcpkg info --instance ~/minecraft/server
```

## 🎮 Example Output

### Basic Mode
```bash
$ cd my-instance
$ mcpkg info

Instance: my-modded-world
Type: Client
Minecraft: 1.21.1
Loader: Fabric 0.16.5

Installed Mods (5):
  - Sodium 0.6.0
  - Lithium 0.12.0
  - Iris Shaders 1.8.0
  - Fabric API 0.100.0
  - Mod Menu 9.0.0

Storage Usage:
  Total: 1.2 GB
  Mods: 45 MB
  Assets: 650 MB
  Libraries: 480 MB
  Saves: 25 MB

World Saves (2):
  - New World (15 MB)
  - Creative Testing (10 MB)
```

### Verbose Mode
```bash
$ mcpkg info --verbose

════════════════════════════════════════
         Instance Information
════════════════════════════════════════

Name:              my-modded-world
Type:              Client
Location:          /home/user/my-modded-world
Minecraft Version: 1.21.1
Mod Loader:        Fabric 0.16.5
Java Path:         /usr/bin/java
Java Version:      21.0.1

════════════════════════════════════════
              Mods (5)
════════════════════════════════════════

1. Sodium (sodium)
   Version: 0.6.0-beta.2+mc1.21.1
   File: sodium-fabric-0.6.0.jar
   Size: 1.2 MB

2. Lithium (lithium)
   Version: 0.12.0
   File: lithium-fabric-mc1.21.1-0.12.0.jar
   Size: 856 KB

3. Iris Shaders (iris)
   Version: 1.8.0
   File: iris-mc1.21.1-1.8.0.jar
   Size: 3.4 MB

4. Fabric API (fabric-api)
   Version: 0.100.0+1.21.1
   File: fabric-api-0.100.0+1.21.1.jar
   Size: 5.2 MB

5. Mod Menu (modmenu)
   Version: 9.0.0
   File: modmenu-9.0.0.jar
   Size: 680 KB

════════════════════════════════════════
           Storage Usage
════════════════════════════════════════

Total Size:        1.2 GB
├─ Assets:         650 MB (54%)
├─ Libraries:      480 MB (40%)
├─ Mods:           45 MB (4%)
├─ Saves:          25 MB (2%)
├─ Resource Packs: 0 MB (0%)
└─ Other:          10 MB (1%)

════════════════════════════════════════
           World Saves (2)
════════════════════════════════════════

1. New World
   Size: 15 MB
   Last Played: 2024-01-15 14:30:00
   Game Mode: Survival

2. Creative Testing
   Size: 10 MB
   Last Played: 2024-01-14 18:45:00
   Game Mode: Creative

════════════════════════════════════════
          Resource Packs (0)
════════════════════════════════════════

No resource packs installed.

════════════════════════════════════════
           Configuration
════════════════════════════════════════

JVM Arguments:
  -Xmx2G
  -Xms2G

Game Directory:
  /home/user/my-modded-world

════════════════════════════════════════
```

## 🔍 Information Breakdown

### Instance Details
- **Name**: Instance identifier
- **Type**: Client or Server
- **Location**: Full path to instance directory
- **Minecraft Version**: Version of Minecraft
- **Mod Loader**: Loader type and version
- **Java**: Java path and version

### Mod Information
For each installed mod:
- Mod name
- Version
- File name
- File size

### Storage Usage
Disk space used by:
- **Assets**: Game assets (textures, sounds)
- **Libraries**: Java dependencies
- **Mods**: Installed mod files
- **Saves**: World save files
- **Resource Packs**: Custom resource packs
- **Other**: Logs, configs, etc.

### World Saves
For each world:
- World name
- Size on disk
- Last played date/time
- Game mode (Survival/Creative/Adventure)

### Resource Packs
Lists installed resource packs with:
- Pack name
- Pack version
- File size

## 🎯 Use Cases

### Check Installed Mods
```bash
cd my-instance
mcpkg info | grep -A 20 "Installed Mods"
```

### Verify Instance Configuration
```bash
mcpkg info --verbose | grep -A 5 "Instance Information"
```

### Check Storage Usage
```bash
mcpkg info | grep -A 10 "Storage Usage"
```

### List All Worlds
```bash
mcpkg info | grep -A 20 "World Saves"
```

### Compare Multiple Instances
```bash
mcpkg info --instance ./instance1 > inst1.txt
mcpkg info --instance ./instance2 > inst2.txt
diff inst1.txt inst2.txt
```

### Pre-Launch Check
```bash
# Check everything is set up correctly
mcpkg info --verbose
mcpkg status
mcpkg launch
```

## 📊 Interpreting Output

### Mod Count
- **0-10 mods**: Light modpack
- **10-50 mods**: Medium modpack  
- **50-100 mods**: Heavy modpack
- **100+ mods**: Very heavy modpack

Consider allocating more RAM for larger modpacks.

### Storage Usage
- **Assets**: 400-800 MB is normal
- **Libraries**: 200-600 MB is normal
- **Mods**: Depends on mod count
- **Saves**: Grows with gameplay time

### Large Saves
If world saves are large (>1 GB):
- Consider backing up
- May slow down loading
- Can be archived if not actively used

## 💡 Troubleshooting with info

### Missing Mods
If expected mods don't appear:
```bash
mcpkg info
# Check mod list

# Reinstall if missing
mcpkg install missing-mod
```

### Wrong Version
Check versions match:
```bash
mcpkg info --verbose
# Verify Minecraft and loader versions

# Update if needed
mcpkg upgrade
```

### High Storage Usage
Identify large files:
```bash
mcpkg info --verbose
# Check storage breakdown

# Clean up old worlds or logs
cd my-instance
rm -rf saves/old-world
rm -rf logs/*.log.gz
```

### Before Reporting Issues
Always include output of:
```bash
mcpkg info --verbose > instance-info.txt
```

## 📁 Directory Inspection

The info command analyzes:
```
instance-directory/
├── mcconfig.json      # Configuration
├── mods/              # Scanned for mods
├── saves/             # Scanned for worlds
├── resourcepacks/     # Scanned for packs
├── assets/            # Measured for size
├── libraries/         # Measured for size
├── versions/          # Version info
└── logs/              # Included in "Other"
```

## ⚙️ Configuration Display

### JVM Arguments
Shows memory allocation and other Java settings:
```
JVM Arguments:
  -Xmx4G           # Max memory: 4GB
  -Xms4G           # Initial memory: 4GB
  -XX:+UseG1GC     # Garbage collector
```

### Java Detection
Shows which Java will be used:
```
Java Path:    /usr/bin/java
Java Version: 21.0.1
```

Verify this matches your requirements.

## 🔄 Real-Time Information

The info command shows current state:
- Installed mods **right now**
- Current storage usage
- Existing world saves
- Current configuration

Run `mcpkg info` after:
- Installing/removing mods
- Playing and creating worlds
- Changing configuration
- Updating versions

## ⚠️ Common Issues

### "Instance not found"
Ensure you're in an instance directory:
```bash
ls mcconfig.json

# Or specify path
mcpkg info --instance ./my-instance
```

### "Cannot read mods"
Check permissions:
```bash
ls -la mods/
chmod 644 mods/*.jar
```

### "Storage calculation failed"
May happen if directories are inaccessible:
```bash
ls -la
# Check directory permissions
```

### Mods Not Showing
If mods are installed but not listed:
- Check `mods/` directory exists
- Verify `.jar` files are present
- Check file permissions

```bash
ls -la mods/
```

## 💡 Pro Tips

1. **Regular Checks**: Run `mcpkg info` periodically to monitor your instance
2. **Before Updates**: Check current state before upgrading
3. **Disk Space**: Monitor storage usage to avoid filling up disk
4. **Verbose Mode**: Use `--verbose` for complete details
5. **Backup Reference**: Save `mcpkg info --verbose` output before major changes
6. **Mod Lists**: Use info to create mod lists for sharing
7. **Performance**: Large mod counts = more RAM needed

## 📋 Creating Mod Lists

Export your mod list:
```bash
mcpkg info > modlist.txt

# Or just the mods section
mcpkg info | grep -A 100 "Installed Mods" > mods.txt
```

Share with friends or for documentation.

## 🔍 Automation

Use in scripts:
```bash
#!/bin/bash
# Check if instance is ready
if mcpkg info --instance "$INSTANCE" | grep -q "Installed Mods"; then
    echo "Instance is valid"
    mcpkg launch --instance "$INSTANCE"
else
    echo "Instance has issues"
    exit 1
fi
```

## 📚 Related Commands

- [`mcpkg create`](create.md) - Create the instance to inspect
- [`mcpkg install`](install.md) - Install mods (shown in info)
- [`mcpkg upgrade`](upgrade.md) - Update versions (check with info)
- [`mcpkg launch`](launch.md) - Launch after verifying with info

## 🔗 See Also

- [Commands Overview](../commands.md)
- [Configuration Guide](../configuration.md)
- [Upgrade Command](upgrade.md)

---

[← Back to Commands](../commands.md) | [Next: upgrade →](upgrade.md)
