# Server management utilities

## Description
Add utilities for managing Minecraft servers beyond just launching.

## Features
- `clicraft server whitelist <add|remove|list> [player]` - Manage whitelist
- `clicraft server ops <add|remove|list> [player]` - Manage operators
- `clicraft server ban <add|remove|list> [player]` - Manage bans
- `clicraft server properties [key] [value]` - View/edit server.properties
- `clicraft server status` - Check if server is running, player count

## Implementation Notes
- Parse and modify server.properties, whitelist.json, ops.json, banned-players.json
- For status, could check if port is in use or parse logs
- Consider RCON integration for live commands
