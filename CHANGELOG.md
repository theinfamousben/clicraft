# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2026-01-18

### Added

- **Version Command** (`clicraft -v, --version`)
  - Displays cool art and version!

## [0.2.0] - 2026-01-18

### Added

- **Instance Info** (`clicraft info`)
  - Display comprehensive instance information
  - Shows instance name, type, mod loader, and versions
  - Lists installed mods with version numbers
  - Storage breakdown by directory (libraries, assets, mods, etc.)
  - World saves count and details
  - Verbose mode for detailed output (`--verbose`)

- **Upgrade Command** (`clicraft upgrade`)
  - Interactive upgrade menu for mods, loader, or Minecraft version
  - Upgrade all mods at once to latest compatible versions
  - Upgrade individual mods by name (`clicraft upgrade sodium`)
  - Upgrade Fabric loader version with automatic library downloads
  - Config format migration for future compatibility
  - Force upgrade option (`--force`)

- **Config Versioning**
  - Added `configVersion` field to `mcconfig.json`
  - Enables future migrations and compatibility checks

### Changed

- Improved mod tracking with `updatedAt` timestamp on upgrades

## [0.1.0] - 2026-01-17

### Added

- **Instance Creation** (`clicraft create`)
  - Interactive prompts for instance configuration
  - Support for Fabric and Forge mod loaders
  - Client and server instance types
  - Automatic download of Minecraft client/server JAR
  - Automatic download of all required libraries
  - Automatic download of game assets
  - Paginated version selection (10 items per page)
  - Creates `mcconfig.json` with instance metadata

- **Mod Search** (`clicraft search`)
  - Search mods on Modrinth by name
  - Filter by Minecraft version (`--version`)
  - Filter by mod loader (`--loader`)
  - Limit results (`--limit`)
  - Displays download counts, supported loaders, and Modrinth links

- **Mod Installation** (`clicraft install`)
  - Install mods from Modrinth to instance
  - Automatic version matching for Minecraft version and loader
  - Dependency detection with warnings
  - Force reinstall option (`--force`)
  - Instance path option (`--instance`)

- **Microsoft Authentication** (`clicraft login`, `clicraft logout`, `clicraft status`)
  - Microsoft OAuth login via browser
  - Xbox Live and Minecraft Services authentication
  - Token refresh for persistent sessions
  - Secure token storage in `~/.mcpkg/auth.json`

- **Game Launching** (`clicraft launch`)
  - Launch Minecraft directly from terminal
  - Automatic classpath building for vanilla and Fabric libraries
  - Support for offline mode (`--offline`)
  - Verbose output option (`--verbose`)
  - Instance path option (`--instance`)

### Technical Details

- Built with Node.js ES modules
- Uses Commander.js for CLI interface
- Uses Inquirer.js for interactive prompts
- Chalk for colored terminal output
- Native fetch API (Node.js 18+)
- Supports Linux, macOS, and Windows
