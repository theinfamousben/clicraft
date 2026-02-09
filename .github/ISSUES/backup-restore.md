# Backup and restore instances

## Description
Add the ability to backup and restore Minecraft instances.

## Features
- `clicraft backup [name]` - Create a backup of the current instance
- `clicraft restore <backup>` - Restore from a backup
- `clicraft backup list` - List available backups
- Configurable backup location (default: `~/.clicraft/backups/`)
- Option to include/exclude worlds, resource packs, etc.

## Implementation Notes
- Use zip/tar for compression
- Store metadata (date, instance name, MC version) in backup
- Consider incremental backups for large instances
