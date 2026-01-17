# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-01-17

### Added

- **Instance Creation** (`mcpkg create`)
  - Interactive prompts for instance configuration
  - Support for Fabric and Forge mod loaders
  - Client and server instance types
  - Automatic download of Minecraft client/server JAR
  - Automatic download of all required libraries
  - Automatic download of game assets
  - Paginated version selection (10 items per page)
  - Creates `mcconfig.json` with instance metadata

- **Mod Search** (`mcpkg search`)
  - Search mods on Modrinth by name
  - Filter by Minecraft version (`--version`)
  - Filter by mod loader (`--loader`)
  - Limit results (`--limit`)
  - Displays download counts, supported loaders, and Modrinth links

- **Mod Installation** (`mcpkg install`)
  - Install mods from Modrinth to instance
  - Automatic version matching for Minecraft version and loader
  - Dependency detection with warnings
  - Force reinstall option (`--force`)
  - Instance path option (`--instance`)

- **Microsoft Authentication** (`mcpkg login`, `mcpkg logout`, `mcpkg status`)
  - Microsoft OAuth login via browser
  - Xbox Live and Minecraft Services authentication
  - Token refresh for persistent sessions
  - Secure token storage in `~/.mcpkg/auth.json`

- **Game Launching** (`mcpkg launch`)
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
