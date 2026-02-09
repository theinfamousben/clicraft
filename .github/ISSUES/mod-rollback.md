# Rollback to previous mod version

## Description
Allow users to rollback mods to a previous version if an update causes issues.

## Features
- `clicraft rollback <mod>` - Rollback to previous version
- `clicraft rollback <mod> <version>` - Rollback to specific version
- Keep version history in mcconfig.json
- Option to list available versions before rollback

## Implementation Notes
- Store previous version info when upgrading
- May need to keep old .jar files or re-download
- Consider how many versions to track (configurable?)
