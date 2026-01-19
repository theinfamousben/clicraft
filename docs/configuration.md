# Configuration Guide

Learn how to configure mcpkg and customize your Minecraft instances.

## 📋 Overview

mcpkg uses configuration files to manage:
- Instance settings (`mcconfig.json`)
- Authentication data (`~/.mcpkg/auth.json`)
- Future: Configuration templates (planned feature)

## 🏠 Configuration Locations

### Instance Configuration
Each instance has its own configuration file:
```
instance-directory/
└── mcconfig.json
```

### Global Authentication
Authentication tokens are stored globally:
```
~/.mcpkg/auth.json
```

This file is shared across all instances on your system.

## ⚙️ Instance Configuration (mcconfig.json)

### Basic Structure

```json
{
  "name": "my-instance",
  "type": "client",
  "minecraftVersion": "1.21.1",
  "loader": "fabric",
  "loaderVersion": "0.16.5",
  "javaPath": "java",
  "jvmArgs": ["-Xmx2G", "-Xms2G"]
}
```

### Configuration Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Instance name | `"modded-survival"` |
| `type` | string | Instance type | `"client"` or `"server"` |
| `minecraftVersion` | string | Minecraft version | `"1.21.1"` |
| `loader` | string | Mod loader type | `"fabric"` or `"forge"` |
| `loaderVersion` | string | Loader version | `"0.16.5"` |
| `javaPath` | string | Path to Java executable | `"java"` or `"/usr/bin/java"` |
| `jvmArgs` | array | JVM arguments | `["-Xmx4G", "-Xms4G"]` |

### Example Configurations

#### Vanilla Client
```json
{
  "name": "vanilla-client",
  "type": "client",
  "minecraftVersion": "1.21.1",
  "loader": "fabric",
  "loaderVersion": "0.16.5",
  "javaPath": "java",
  "jvmArgs": ["-Xmx2G", "-Xms2G"]
}
```

#### Performance-Optimized Client
```json
{
  "name": "performance-client",
  "type": "client",
  "minecraftVersion": "1.21.1",
  "loader": "fabric",
  "loaderVersion": "0.16.5",
  "javaPath": "java",
  "jvmArgs": [
    "-Xmx4G",
    "-Xms4G",
    "-XX:+UseG1GC",
    "-XX:+UnlockExperimentalVMOptions",
    "-XX:G1NewSizePercent=20",
    "-XX:G1ReservePercent=20",
    "-XX:MaxGCPauseMillis=50",
    "-XX:G1HeapRegionSize=32M"
  ]
}
```

#### Multiplayer Server
```json
{
  "name": "survival-server",
  "type": "server",
  "minecraftVersion": "1.20.1",
  "loader": "fabric",
  "loaderVersion": "0.15.11",
  "javaPath": "/usr/bin/java",
  "jvmArgs": [
    "-Xmx6G",
    "-Xms6G",
    "-XX:+UseG1GC",
    "-XX:+ParallelRefProcEnabled",
    "-XX:MaxGCPauseMillis=200",
    "-XX:+UnlockExperimentalVMOptions",
    "-XX:+DisableExplicitGC",
    "-XX:G1NewSizePercent=30",
    "-XX:G1MaxNewSizePercent=40",
    "-XX:G1HeapRegionSize=8M",
    "-XX:G1ReservePercent=20",
    "-XX:G1HeapWastePercent=5",
    "-XX:G1MixedGCCountTarget=4",
    "-XX:InitiatingHeapOccupancyPercent=15",
    "-XX:G1MixedGCLiveThresholdPercent=90",
    "-XX:G1RSetUpdatingPauseTimePercent=5",
    "-XX:SurvivorRatio=32",
    "-XX:+PerfDisableSharedMem",
    "-XX:MaxTenuringThreshold=1"
  ]
}
```

#### Forge Modpack
```json
{
  "name": "tech-modpack",
  "type": "client",
  "minecraftVersion": "1.20.1",
  "loader": "forge",
  "loaderVersion": "47.2.0",
  "javaPath": "java",
  "jvmArgs": [
    "-Xmx8G",
    "-Xms8G",
    "-XX:+UseG1GC",
    "-XX:+UnlockExperimentalVMOptions"
  ]
}
```

## 🔧 JVM Arguments

### Memory Allocation

Control how much RAM Minecraft uses:

```json
{
  "jvmArgs": [
    "-Xmx4G",   // Maximum memory: 4GB
    "-Xms4G"    // Initial memory: 4GB (same as max)
  ]
}
```

#### Recommended Memory by Usage

| Use Case | Recommended Memory |
|----------|-------------------|
| Vanilla Minecraft | 2-3GB |
| Light modpacks | 3-4GB |
| Medium modpacks | 4-6GB |
| Heavy modpacks | 6-8GB |
| Extreme modpacks | 8-12GB |
| Small servers (1-5 players) | 2-4GB |
| Medium servers (10-20 players) | 4-8GB |
| Large servers (50+ players) | 8-16GB+ |

### Garbage Collection

Optimize Java's garbage collector:

```json
{
  "jvmArgs": [
    "-Xmx4G",
    "-Xms4G",
    "-XX:+UseG1GC",                      // Use G1 garbage collector
    "-XX:+UnlockExperimentalVMOptions",  // Enable experimental options
    "-XX:G1NewSizePercent=20",           // Young generation size
    "-XX:G1ReservePercent=20",           // Reserve memory
    "-XX:MaxGCPauseMillis=50",           // Max pause time
    "-XX:G1HeapRegionSize=32M"           // Heap region size
  ]
}
```

### Performance Tuning

Additional performance arguments:

```json
{
  "jvmArgs": [
    "-Xmx4G",
    "-Xms4G",
    "-XX:+UseG1GC",
    "-XX:+ParallelRefProcEnabled",      // Parallel reference processing
    "-XX:MaxGCPauseMillis=200",         // GC pause time
    "-XX:+UnlockExperimentalVMOptions",
    "-XX:+DisableExplicitGC",           // Disable explicit GC calls
    "-XX:+AlwaysPreTouch",              // Pre-touch memory pages
    "-XX:G1NewSizePercent=30",
    "-XX:G1MaxNewSizePercent=40",
    "-XX:G1HeapRegionSize=8M",
    "-XX:G1ReservePercent=20",
    "-XX:G1HeapWastePercent=5",
    "-XX:G1MixedGCCountTarget=4",
    "-XX:InitiatingHeapOccupancyPercent=15",
    "-XX:G1MixedGCLiveThresholdPercent=90",
    "-XX:SurvivorRatio=32",
    "-XX:+PerfDisableSharedMem",
    "-XX:MaxTenuringThreshold=1"
  ]
}
```

## 🔐 Authentication Configuration

### Storage Location
```
~/.mcpkg/auth.json
```

### Structure (DO NOT EDIT MANUALLY)

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "M.R3...",
  "expiresAt": 1705420800000,
  "profile": {
    "username": "Player123",
    "uuid": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### Security Notes

- **Never share this file** - it contains your account credentials
- **Keep it private** - set appropriate file permissions
- **Automatic management** - mcpkg handles this file automatically
- **Token refresh** - mcpkg refreshes tokens automatically

### File Permissions

On Linux/macOS, secure your auth file:
```bash
chmod 600 ~/.mcpkg/auth.json
```

## 📁 Directory Structure

### Complete Instance Layout

```
my-instance/
├── mcconfig.json          # Instance configuration (THIS FILE)
├── launch.sh              # Generated launch script (reference)
├── assets/                # Game assets
│   ├── indexes/           # Asset indexes
│   ├── objects/           # Asset files
│   └── skins/             # Player skins cache
├── libraries/             # Java libraries
│   ├── com/               # Maven-style structure
│   ├── net/
│   └── ...
├── mods/                  # Installed mods
│   ├── sodium-*.jar
│   ├── lithium-*.jar
│   └── ...
├── natives/               # Platform-specific libraries
│   ├── liblwjgl.so        # Linux
│   ├── liblwjgl.dylib     # macOS
│   └── lwjgl.dll          # Windows
├── versions/              # Version JARs and metadata
│   ├── 1.21.1.jar
│   ├── 1.21.1.json
│   └── fabric-loader-*.jar
├── saves/                 # World saves
│   ├── New World/
│   └── Creative Testing/
├── resourcepacks/         # Resource packs
├── shaderpacks/           # Shader packs (if using shaders)
├── config/                # Mod configuration files
├── logs/                  # Game logs
│   ├── latest.log
│   └── 2024-01-15-1.log.gz
├── crash-reports/         # Crash reports (if crashes occur)
├── screenshots/           # In-game screenshots
└── options.txt            # Game settings
```

## 🎨 Configuration Templates (Planned Feature)

> **Note**: Configuration templates are a planned feature for future versions of mcpkg.

### What Are Templates?

Templates will allow you to:
- Save instance configurations as reusable templates
- Share instance setups with others
- Quickly create instances with predefined settings
- Include mod lists in templates

### Planned Usage (Future)

```bash
# Save current instance as template
mcpkg template save my-performance-setup

# Create instance from template
mcpkg create --template my-performance-setup

# List available templates
mcpkg template list

# Share template (export to file)
mcpkg template export my-performance-setup

# Import shared template
mcpkg template import performance-template.json
```

### Template Structure (Planned)

```json
{
  "name": "Performance Setup",
  "description": "Optimized for maximum FPS",
  "author": "YourName",
  "minecraftVersion": "1.21.1",
  "loader": "fabric",
  "loaderVersion": "0.16.5",
  "jvmArgs": ["-Xmx4G", "-Xms4G"],
  "mods": [
    "sodium",
    "lithium",
    "starlight",
    "ferritecore"
  ],
  "settings": {
    "renderDistance": 12,
    "simulationDistance": 8
  }
}
```

Stay tuned for this feature in future releases!

## 🔄 Modifying Configuration

### Safe Editing

Always edit `mcconfig.json` when the game is **not running**:

```bash
# Stop the game first
# Then edit
nano mcconfig.json

# Verify JSON is valid
cat mcconfig.json | python -m json.tool

# Launch with new settings
mcpkg launch
```

### Validation

After editing, verify the configuration:
```bash
mcpkg info --verbose
```

This will show if the configuration is valid.

## ⚙️ Advanced Configuration

### Custom Java Path

If you have multiple Java installations:

```json
{
  "javaPath": "/usr/lib/jvm/java-21-openjdk/bin/java"
}
```

Find Java installations:
```bash
# Linux
update-alternatives --list java

# macOS
/usr/libexec/java_home -V

# Any system
which java
```

### Environment-Specific Settings

Create different configs for different environments:

```bash
# Development
cp mcconfig.json mcconfig.dev.json
# Edit for development

# Production
cp mcconfig.json mcconfig.prod.json
# Edit for production

# Swap as needed
cp mcconfig.dev.json mcconfig.json
```

## 💡 Tips and Best Practices

### 1. Version Control
Track your configuration:
```bash
git init
git add mcconfig.json
git commit -m "Initial instance configuration"
```

### 2. Document Changes
Add comments in a README:
```bash
echo "# Instance: Modded Survival" > README.md
echo "Memory: 4GB" >> README.md
echo "Mods: See mods/ directory" >> README.md
```

### 3. Backup Configs
```bash
cp mcconfig.json mcconfig.backup.json
```

### 4. Test Changes
After modifying config:
```bash
mcpkg info --verbose  # Verify
mcpkg launch --offline  # Test
```

### 5. Memory Guidelines
- Set `-Xms` equal to `-Xmx` for consistent performance
- Leave 2GB for OS and other applications
- If 8GB system RAM, use max 6GB for Minecraft

## 🔍 Troubleshooting

### Invalid JSON
If you get JSON errors:
```bash
# Validate JSON
cat mcconfig.json | python -m json.tool
```

### Wrong Java Version
Verify Java path:
```bash
java --version
which java
```

Update `javaPath` in config.

### Memory Errors
If game crashes with memory errors:
- Reduce `-Xmx` value
- Close other applications
- Check available system RAM

### Config Not Applied
If changes don't take effect:
- Verify JSON syntax is valid
- Restart the game completely
- Check for typos in field names

## 📚 Related Commands

- [`mcpkg create`](commands/create.md) - Creates initial config
- [`mcpkg info`](commands/info.md) - Shows current config
- [`mcpkg launch`](commands/launch.md) - Uses config to launch
- [`mcpkg upgrade`](commands/upgrade.md) - Updates version fields

## 🔗 See Also

- [Commands Overview](commands.md)
- [Installation Guide](installation.md)
- [Launch Command](commands/launch.md)

---

[← Back to Home](index.md)
