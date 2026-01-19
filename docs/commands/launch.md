# launch Command

Launch your Minecraft instance directly from the command line.

## 📝 Synopsis

```bash
mcpkg launch [options]
```

## 📖 Description

The `launch` command starts your Minecraft instance with all the correct Java arguments, libraries, and configurations. It handles:

- Java classpath setup
- Native library extraction
- JVM arguments configuration
- Game arguments setup
- Authentication (online mode)
- Offline mode support

## 🎯 Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --instance <path>` | Path to instance directory | Current directory |
| `--offline` | Launch in offline mode (no authentication) | false |
| `--verbose` | Show detailed launch information | false |

## 📋 Examples

### Launch from instance directory
```bash
cd my-instance
mcpkg launch
```

### Launch with instance path
```bash
mcpkg launch --instance ./my-instance
```

### Launch in offline mode
```bash
mcpkg launch --offline
```
No authentication required - useful for testing or single-player.

### Verbose launch
```bash
mcpkg launch --verbose
```
See detailed Java command and debugging information.

### Launch specific instance
```bash
mcpkg launch --instance ~/minecraft/modded-fabric
```

## 🎮 Example Session

### Online Mode (Default)
```bash
$ cd my-instance
$ mcpkg launch

Preparing to launch Minecraft...
✓ Instance detected: my-modded-world
✓ Minecraft version: 1.21.1
✓ Mod loader: Fabric 0.16.5
✓ Authentication: Player123
✓ Mods found: 5

Launching Minecraft...
[Minecraft window opens]
```

### Offline Mode
```bash
$ mcpkg launch --offline

Preparing to launch Minecraft...
✓ Instance detected: my-instance
✓ Minecraft version: 1.21.1
✓ Mod loader: Fabric 0.16.5
✓ Mode: Offline
✓ Username: Player

Launching Minecraft...
[Minecraft window opens]
```

## 🔍 Launch Process

### What Happens

1. **Instance Detection**: Finds and validates `mcconfig.json`
2. **Authentication Check**: Verifies login status (unless `--offline`)
3. **Library Preparation**: Prepares Java libraries and native files
4. **JVM Setup**: Configures Java Virtual Machine arguments
5. **Game Launch**: Executes Java with Minecraft
6. **Monitor**: Keeps running to show game output

### Verbose Output

With `--verbose`, you'll see:
```bash
$ mcpkg launch --verbose

Instance: ./my-instance
Minecraft Version: 1.21.1
Loader: fabric-loader-0.16.5-1.21.1
Authentication: Player123 (uuid: 123e...)

Java Command:
java -Xmx2G -Xms2G \
  -Djava.library.path=./natives \
  -cp ./libraries/*.jar:./versions/1.21.1.jar \
  net.fabricmc.loader.impl.launch.knot.KnotClient \
  --username Player123 \
  --uuid 123e4567... \
  --accessToken xxx \
  --version 1.21.1

[Game output follows]
```

## 🎯 Use Cases

### Regular Gameplay
```bash
# Login first (one-time)
mcpkg login

# Launch whenever you want to play
cd my-instance
mcpkg launch
```

### Testing Mods Offline
```bash
# Install mods
mcpkg install sodium
mcpkg install lithium

# Test in offline mode
mcpkg launch --offline
```

### Multiple Instances
```bash
# Launch different instances
mcpkg launch --instance ./vanilla
mcpkg launch --instance ./modded
mcpkg launch --instance ./testing
```

### Server Launch
```bash
cd my-server-instance
mcpkg launch

# Server starts and runs in the terminal
```

### Development Testing
```bash
# Quick offline testing
mcpkg install my-mod --force
mcpkg launch --offline --verbose
```

## 🖥️ System Requirements

### Java
- **Required**: Java 21 or higher
- **Recommended**: Latest Java version
- **Memory**: At least 4GB RAM available

Verify Java:
```bash
java --version
```

### Display (Client Only)
- Graphics drivers installed
- Display server running (X11/Wayland on Linux)
- Monitor connected

## ⚙️ Configuration

Launch behavior is configured in `mcconfig.json`:

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

### Customizing JVM Arguments

Edit `mcconfig.json` to customize Java settings:

```json
{
  "jvmArgs": [
    "-Xmx4G",           // Maximum memory (4GB)
    "-Xms4G",           // Initial memory (4GB)
    "-XX:+UseG1GC",     // Use G1 garbage collector
    "-XX:+UnlockExperimentalVMOptions",
    "-XX:G1NewSizePercent=20",
    "-XX:G1ReservePercent=20",
    "-XX:MaxGCPauseMillis=50",
    "-XX:G1HeapRegionSize=32M"
  ]
}
```

### Memory Recommendations

| Instance Type | Recommended Memory |
|---------------|-------------------|
| Vanilla | 2GB (`-Xmx2G`) |
| Light mods | 3GB (`-Xmx3G`) |
| Heavy mods | 4-6GB (`-Xmx4G`) |
| Modpacks | 6-8GB (`-Xmx6G`) |
| Servers | 4-8GB+ depending on players |

## 🌐 Online vs Offline

### Online Mode (Default)
Requires `mcpkg login`:
- ✅ Multiplayer servers
- ✅ Realms
- ✅ Custom skins
- ✅ Official servers
- ✅ Account verification

### Offline Mode (`--offline`)
No login required:
- ✅ Single-player
- ✅ LAN play
- ✅ Mod testing
- ❌ Online multiplayer
- ❌ Custom skins
- ❌ Realms

## 📊 Game Output

The command shows Minecraft's output:

```
[00:00:01] [main/INFO]: Loading Minecraft 1.21.1 with Fabric Loader 0.16.5
[00:00:02] [main/INFO]: Loading 5 mods
[00:00:02] [main/INFO]:   - sodium 0.6.0
[00:00:02] [main/INFO]:   - lithium 0.12.0
[00:00:03] [main/INFO]: Minecraft loaded successfully
```

Exit codes:
- `0` - Normal exit
- `1` - Crash or error
- `130` - Terminated by user (Ctrl+C)

## ⚠️ Common Issues

### "Instance not found"
Make sure you're in an instance directory or using `--instance`:
```bash
# Check for mcconfig.json
ls mcconfig.json

# Or specify instance
mcpkg launch --instance ./my-instance
```

### "Not logged in"
Login required for online mode:
```bash
mcpkg login
mcpkg launch
```

Or use offline mode:
```bash
mcpkg launch --offline
```

### "Java not found"
Install Java 21 or higher:
```bash
# Verify Java installation
java --version

# If not installed, download from:
# https://adoptium.net/
```

### "Out of memory"
Increase memory allocation in `mcconfig.json`:
```json
{
  "jvmArgs": ["-Xmx4G", "-Xms4G"]
}
```

### "Native library error"
On Linux, you may need:
```bash
sudo apt-get install libglfw3 libglfw3-dev
```

### Game Crashes
Check the logs:
```bash
cd my-instance
ls logs/
cat logs/latest.log
```

## 🎮 Server Hosting

### Starting a Server
```bash
cd my-server-instance
mcpkg launch

# Server starts and shows:
[Server] Starting Minecraft server on *:25565
[Server] Done! Server is running
```

### Server Commands
Type commands in the terminal:
```
> stop          # Stop the server
> list          # List players
> op username   # Make someone an operator
```

### Background Server
Run server in background:
```bash
nohup mcpkg launch > server.log 2>&1 &
```

View logs:
```bash
tail -f server.log
```

Stop server:
```bash
# Type 'stop' in server console or:
kill $(pgrep -f "minecraft.*server")
```

## 💡 Pro Tips

1. **Login Once**: Authentication persists, no need to login every launch
2. **Check Status**: Use `mcpkg status` before launching
3. **Test Offline**: Use `--offline` for quick mod testing
4. **Allocate Memory**: Give Minecraft enough RAM for smooth gameplay
5. **Close Other Apps**: Close memory-heavy apps before launching
6. **Use Verbose**: Use `--verbose` for troubleshooting launch issues
7. **Multiple Instances**: Launch different instances for different play styles

## 🔧 Performance Tips

### Optimize JVM Arguments
```json
{
  "jvmArgs": [
    "-Xmx4G",
    "-Xms4G",
    "-XX:+UseG1GC",
    "-XX:+UnlockExperimentalVMOptions",
    "-XX:G1NewSizePercent=20",
    "-XX:G1ReservePercent=20",
    "-XX:MaxGCPauseMillis=50"
  ]
}
```

### Install Performance Mods
```bash
mcpkg install sodium      # Rendering
mcpkg install lithium     # General
mcpkg install starlight   # Lighting
mcpkg install ferritecore # Memory
```

### Monitor Performance
Use `--verbose` to see Java command and diagnose issues.

## 📚 Related Commands

- [`mcpkg create`](create.md) - Create an instance to launch
- [`mcpkg login`](login.md) - Login for online play
- [`mcpkg install`](install.md) - Install mods before launching
- [`mcpkg info`](info.md) - View instance information

## 🔗 See Also

- [Commands Overview](../commands.md)
- [Configuration Guide](../configuration.md)
- [Login Command](login.md)
- [Info Command](info.md)

---

[← Back to Commands](../commands.md) | [Next: info →](info.md)
