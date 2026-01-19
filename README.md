# mcpkg

A simple Minecraft Mod Package Manager written in Node.js. Create and manage Minecraft instances with Fabric or Forge mod loaders, search and install mods from Modrinth, and launch the game directly from the command line.

## Features

- 🎮 **Create Instances** - Set up new Minecraft client or server instances with Fabric or Forge
- 🔍 **Search Mods** - Find mods on Modrinth with filters for version, loader, and more
- 📦 **Install Mods** - Download and install mods directly to your instance
- � **Upgrade** - Update mods, mod loader, or Minecraft version
- ℹ️ **Instance Info** - View detailed information about your instances
- �🔐 **Microsoft Login** - Authenticate with your Microsoft account to play online
- 🚀 **Launch Game** - Start Minecraft directly from the terminal

## Installation

### Cloning from Source
```bash
# Clone the repository
git clone https://github.com/theinfamousben/mcpkg.git
cd mcpkg

# Install dependencies
npm install

# Link globally (optional, for using 'mcpkg' command anywhere)
npm link
```
### Install NPM Package
**npm package coming soon!**


## Requirements

- Node.js 18 or higher
- Java 21 or higher (for running Minecraft)

## Usage

### Create a new instance

```bash
mcpkg create
```

This will prompt you to configure:
- Instance name
- Client or Server
- Mod loader (Fabric or Forge)
- Minecraft version
- Loader version

The command downloads all necessary files including the Minecraft client/server, libraries, and assets.

### Search for mods

```bash
# Basic search
mcpkg search sodium

# With filters
mcpkg search "shader" --version 1.21.1 --loader fabric --limit 20
```

### Install a mod

Navigate to your instance directory, then:

```bash
cd my-instance
mcpkg install sodium
```

Or specify an instance path:

```bash
mcpkg install sodium --instance ./my-instance
```

Options:
- `-f, --force` - Force reinstall even if mod is already installed
- `-i, --instance <path>` - Path to the instance directory

### Login to Microsoft

```bash
mcpkg login
```

This opens a browser for Microsoft authentication. After logging in, paste the redirect URL back into the terminal.

### Check login status

```bash
mcpkg status
```

### Logout

```bash
mcpkg logout
```

### Launch the game

Navigate to your instance directory, then:

```bash
cd my-instance
mcpkg launch
```

Or specify an instance path:

```bash
mcpkg launch --instance ./my-instance
```

Options:
- `-i, --instance <path>` - Path to the instance directory
- `--offline` - Launch in offline mode (no authentication required)
- `--verbose` - Show detailed launch information

### View instance info

```bash
cd my-instance
mcpkg info
```

Shows detailed information about your instance including installed mods, storage usage, and world saves.

Options:
- `-i, --instance <path>` - Path to the instance directory
- `--verbose` - Show detailed information

### Upgrade mods or loader

```bash
# Interactive upgrade menu
mcpkg upgrade

# Upgrade a specific mod
mcpkg upgrade sodium

# Upgrade all mods
mcpkg upgrade  # then select "All mods"
```

Options:
- `-i, --instance <path>` - Path to the instance directory
- `-f, --force` - Force upgrade even if already up to date
- `--verbose` - Enable verbose output

## Instance Structure

Each instance is a self-contained folder with:

```
my-instance/
├── mcconfig.json      # Instance configuration
├── launch.sh          # Launch script (for reference)
├── assets/            # Game assets
├── libraries/         # Java libraries
├── mods/              # Installed mods
├── natives/           # Native libraries
├── versions/          # Version JARs and JSON
├── saves/             # World saves
├── resourcepacks/     # Resource packs
└── logs/              # Game logs
```

## Configuration

Authentication tokens are stored in `~/.mcpkg/auth.json` and persist between sessions.

Instance settings are stored in `mcconfig.json` within each instance folder.

## Supported Platforms

- ✅ Linux
- ✅ macOS
- ✅ Windows

## License

ISC

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/theinfamousben/mcpkg).
