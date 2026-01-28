# Changelog

All notable changes to this project will be documented in this file.

## [0.4.3] - 2026-01-28

### Added

- **Launch by Alias `clicraft alias`**
  - Add alias `clicraft alias add [name] [path]`
  - remove alias `clicraft alias remove [name]`
  - list aliases `clicraft alias`

## [0.4.2] - 2026-01-24

**Emergency Patch**

### Changed
- **Fixed `post-command.js`**

## [0.4.1] - 2026-01-24

### Added

- **Published to npm**
  - Package available as `@bobschlowinskii/clicraft`
  - Install globally with `npm install -g @bobschlowinskii/clicraft`
- **Added Auto-update checking**
  - *disable by setting `checkUpdates` to false in `~/.clicraft/settings/`*

## [0.4.0] - 2026-01-22

### Added

- **Multi-Account Authentication** (`clicraft auth`)
  - Support for multiple Microsoft/Minecraft accounts
  - New unified `clicraft auth` command with subcommands:
    - `auth login` - Add a new account or update existing
    - `auth logout [account]` - Remove an account (interactive selection if multiple)
    - `auth switch [account]` - Switch between saved accounts
    - `auth status [account]` - Show all accounts or specific account details
    - `auth list` - List all saved accounts
  - Accounts stored in `~/.clicraft/auth/accounts.json`
  - Active account highlighted with `▶` marker in status
  - Token status (valid/expired) shown for each account
  - Automatic migration from legacy `auth.json` format


### Changed

- **Auth Commands Restructured**
  - Replaced standalone `login`, `logout`, `status` commands with `auth` subcommand
  - Backward compatible `loadAuth()` and `refreshAuth()` exports maintained

### Deprecated

- Old `clicraft login`, `clicraft logout`, `clicraft status` commands are now under `clicraft auth`

## [0.3.2] - 2026-01-22

### Changed

- **Major Codebase Refactoring**
  - Created centralized helper modules for shared functionality
  - `helpers/constants.js` - Centralized API URLs, user agent, pagination settings
  - `helpers/utils.js` - Core utilities: fetchJson, downloadFile, loadConfig, saveConfig, paginatedSelect, mavenToPath
  - `helpers/modrinth.js` - Modrinth API functions: getProject, getProjectVersions, searchMods, downloadMod, findMod
  - `helpers/minecraft.js` - Minecraft/Fabric/Forge API: version fetching, library/asset downloads
  - Eliminated 7+ duplicate function patterns across command files
  - Reduced code duplication and improved maintainability
  - All commands now use shared imports instead of local implementations

## [0.3.1] - 2026-01-22

### Added

- **Uninstall Command** (`clicraft uninstall`)
  - Remove mods from your Minecraft instance
  - Interactive multi-select when no mod specified
  - Confirmation prompt before deletion (skip with `--force`)
  - Removes mod file and updates mcconfig.json

## [0.3.0] - 2026-01-19

### Added

- **Config Command** (`clicraft config`)
  - New command to manage CLI settings and game settings
  - `config show` - Display CLI settings (Java path, memory, mod source)
  - `config set <key> <value>` - Modify CLI settings
  - `config ignore` - Show game settings ignore list
  - `config ignore-add <pattern>` - Add pattern to ignore list (supports wildcards)
  - `config ignore-remove <pattern>` - Remove pattern from ignore list
  - `config defaults` - Show default game settings for new instances
  - `config defaults-set <key> <value>` - Set a default game setting
  - `config defaults-remove <key>` - Remove a default game setting
  - `config defaults-clear` - Clear all default game settings
  - `config capture` - Capture game settings from options.txt to mcconfig.json
  - `config game-settings` - Show saved game settings in mcconfig
  - `config clear-game-settings` - Remove game settings from mcconfig

- **Global Configuration Directory** (`~/.clicraft/`)
  - Centralized config directory for CLI-wide settings
  - `settings.json` - CLI settings (Java path, memory, mod source, etc.)
  - `game-settings-ignore.json` - Patterns for settings to exclude when capturing
  - `default-game-settings.json` - Default Minecraft settings applied to new instances
  - `auth.json` - Authentication tokens (migrated from ~/.mcpkg/)

- **Game Settings in mcconfig.json**
  - New `gameSettings` field to store Minecraft options
  - Capture settings from options.txt with customizable ignore list
  - Automatically apply game settings when creating from config

- **Create from Existing Config** (`clicraft create` with mcconfig.json)
  - Detects mcconfig.json in current directory
  - Creates new instance from existing configuration
  - Installs same Minecraft version, mod loader, and loader version
  - Automatically installs all mods from the config
  - Applies game settings if present

- **Added `--mods` option to `clicraft info`** 
  - Shows only installed mods instead of the entire instance info

### Changed

- Migrated auth storage from `~/.mcpkg/` to `~/.clicraft/`
- Improved mod installation with better error handling

## [0.2.2] - 2026-01-19

- **Fixed Bugs**
  - Fixed bug in `clicraft --version` where I forgot to put the exports
  - Fixed bug from package.json where importing made a default object

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
