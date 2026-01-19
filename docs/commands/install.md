# install Command

Install mods from Modrinth directly to your Minecraft instance.

## 📝 Synopsis

```bash
mcpkg install <mod> [options]
```

## 📖 Description

The `install` command downloads and installs mods from Modrinth to your Minecraft instance. It automatically:

1. Searches for the mod on Modrinth
2. Finds the correct version for your Minecraft version and loader
3. Downloads the mod file
4. Places it in your instance's `mods/` directory
5. Tracks the installation in your instance configuration

## 🎯 Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `<mod>` | Mod name or Modrinth project ID | Yes |

## 🎯 Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --instance <path>` | Path to instance directory | Current directory |
| `-f, --force` | Force reinstall if already installed | false |
| `--verbose` | Enable verbose output | false |

## 📋 Examples

### Install from instance directory
```bash
cd my-instance
mcpkg install sodium
```

### Install with instance path
```bash
mcpkg install sodium --instance ./my-instance
```

### Force reinstall
```bash
mcpkg install sodium --force
```
Useful for reinstalling a mod or downgrading to a different version.

### Install using Modrinth ID
```bash
mcpkg install AANobbMI
```
Use the project ID from `mcpkg search` results.

### Install multiple mods
```bash
cd my-instance
mcpkg install sodium
mcpkg install lithium
mcpkg install iris
```

### Verbose installation
```bash
mcpkg install sodium --verbose
```
See detailed information about the download and installation process.

## 🎮 Example Session

```bash
$ cd my-fabric-instance
$ mcpkg install sodium

Installing sodium...
✓ Found mod: Sodium
✓ Compatible version: sodium-fabric-mc1.21.1-0.6.0.jar
✓ Downloading...
✓ Installed successfully to ./mods/

Sodium has been installed!

Remember to restart Minecraft if it's currently running.
```

## 🔍 How It Works

### 1. Mod Search
The command searches Modrinth for the specified mod name or ID.

### 2. Version Selection
Automatically selects the best version based on:
- Your instance's Minecraft version
- Your instance's mod loader (Fabric/Forge)
- Latest stable release for that configuration

### 3. Download
Downloads the `.jar` file from Modrinth's CDN.

### 4. Installation
Places the mod in your `mods/` directory and updates instance tracking.

## 📂 Installation Location

Mods are installed to:
```
instance-directory/
└── mods/
    ├── sodium-fabric-mc1.21.1-0.6.0.jar
    ├── lithium-fabric-mc1.21.1-0.6.0.jar
    └── iris-mc1.21.1-1.8.0.jar
```

## 🎯 Use Cases

### Building a Performance Pack
```bash
cd my-instance
mcpkg install sodium      # Better FPS
mcpkg install lithium     # Server optimization
mcpkg install starlight   # Lighting engine
mcpkg install ferritecore # Memory optimization
```

### Adding Quality of Life Mods
```bash
cd my-instance
mcpkg install "just enough items"  # Recipe viewer
mcpkg install "journeymap"         # Minimap
mcpkg install "appleskin"          # Food info
```

### Installing Shader Support
```bash
cd my-instance
mcpkg install sodium  # Required for Iris
mcpkg install iris    # Shader loader
```

### Server Mods
```bash
cd my-server
mcpkg install lithium
mcpkg install starlight
mcpkg install "fabric api"
```

## ⚠️ Important Notes

### Instance Detection
mcpkg automatically detects your instance by looking for `mcconfig.json`:
- If in instance directory, uses current directory
- If using `--instance`, uses specified path
- Must have a valid `mcconfig.json` file

### Version Compatibility
The mod version is automatically matched to:
- Your Minecraft version (from `mcconfig.json`)
- Your mod loader (Fabric/Forge)
- Latest compatible release

### Dependencies
Some mods require other mods to work:
- **Sodium Extra** requires **Sodium**
- **Iris** requires **Sodium**
- Many Fabric mods require **Fabric API**

Install dependencies separately:
```bash
mcpkg install sodium
mcpkg install "sodium extra"  # Now it will work
```

### Mod Conflicts
Some mods conflict with each other:
- **Sodium** conflicts with **Optifine**
- **Phosphor** conflicts with **Starlight**

Research mod compatibility before installing.

## 🔍 Finding the Right Mod

Use `mcpkg search` to find mods before installing:

```bash
# Search first
mcpkg search optimization --version 1.21.1 --loader fabric

# Then install by name or ID
mcpkg install sodium
```

## ⚠️ Common Issues

### "Instance not found"
Make sure you're either:
- In an instance directory (contains `mcconfig.json`)
- Using `--instance` to specify the path

```bash
# Check for mcconfig.json
ls mcconfig.json

# Or specify instance
mcpkg install sodium --instance ./my-instance
```

### "Mod not found"
The mod name might be incorrect:
- Use `mcpkg search <term>` to find the exact name
- Try using the Modrinth project ID instead
- Check spelling and capitalization

### "No compatible version found"
The mod may not support your Minecraft version or loader:
- Check mod compatibility on Modrinth
- Try a different Minecraft version
- Look for alternative mods

### "Already installed"
The mod is already in your instance:
- Use `--force` to reinstall
- Use `mcpkg upgrade` to update it
- Check `mods/` directory

### Download Failures
If downloads fail:
- Check your internet connection
- Try again (downloads resume automatically)
- Use `--verbose` for detailed error info

## 💡 Pro Tips

1. **Install Fabric API First**: Many Fabric mods require it
   ```bash
   mcpkg install "fabric api"
   ```

2. **Check Dependencies**: Read mod descriptions for required mods

3. **Use Search First**: Find the exact mod name before installing
   ```bash
   mcpkg search "just enough"
   mcpkg install "just enough items"
   ```

4. **Backup First**: Before installing many mods, backup your instance

5. **Test Individually**: Install and test mods one at a time to catch issues

## 📊 Verifying Installation

After installing, verify with:

```bash
# List installed mods
ls mods/

# View instance info
mcpkg info

# Check in-game
mcpkg launch
# Then check Mods menu in Minecraft
```

## 🔄 Updating Installed Mods

To update mods, use the `upgrade` command:

```bash
# Update a specific mod
mcpkg upgrade sodium

# Update all mods
mcpkg upgrade
```

## 🗑️ Removing Mods

To remove a mod, simply delete it from the `mods/` directory:

```bash
cd my-instance
rm mods/sodium-*.jar
```

Or use a file manager to delete the mod file.

## 📚 Related Commands

- [`mcpkg search`](search.md) - Find mods to install
- [`mcpkg info`](info.md) - View installed mods
- [`mcpkg upgrade`](upgrade.md) - Update installed mods
- [`mcpkg create`](create.md) - Create an instance first

## 🔗 See Also

- [Commands Overview](../commands.md)
- [Configuration Guide](../configuration.md)
- [Search Command](search.md)
- [Modrinth Website](https://modrinth.com)

---

[← Back to Commands](../commands.md) | [Next: login →](login.md)
