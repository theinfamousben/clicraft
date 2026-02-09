# import

Import a Modrinth modpack (.mrpack) into a new or existing instance.

## Usage

```bash
clicraft import <packfile> [options]
```

## Arguments

- `<packfile>` - Path to the .mrpack file

## Options

| Flag | Description |
|------|-------------|
| `-i, --instance <path>` | Install into existing instance |
| `-f, --force` | Overwrite existing files |
| `--verbose` | Show detailed output |

## Examples

```bash
# Import modpack as new instance
clicraft import ~/Downloads/Fabulously-Optimized-6.5.1.mrpack

# Import into existing instance
clicraft import pack.mrpack -i ~/minecraft/myinstance

# Overwrite existing files
clicraft import pack.mrpack -f
```

## Behavior

1. **New instance**: Creates directory based on pack name
2. **Existing instance**: Updates config to match pack requirements
3. **Downloads**: All mods from Modrinth CDN
4. **Overrides**: Extracts config files and other overrides
5. **Tracking**: Adds mods to mcconfig.json for future updates

## Supported Formats

- `.mrpack` - Modrinth modpack format

## Notes

- Pack name becomes instance folder name (lowercase, hyphenated)
- Minecraft version and loader are set from pack requirements
- Use `-f` if importing into an instance that already has files
