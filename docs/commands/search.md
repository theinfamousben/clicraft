---
layout: default
title: search
parent: Commands
nav_order: 2
description: "Search for mods on Modrinth"
permalink: /commands/search
---

# search Command

Search for Minecraft mods on Modrinth with powerful filtering options.

## 📝 Synopsis

```bash
clicraft search <query> [options]
```

## 📖 Description

The `search` command queries the Modrinth API to find mods matching your search criteria. You can filter results by Minecraft version, mod loader, and limit the number of results displayed.

Modrinth is a popular open-source mod hosting platform with a large collection of high-quality Minecraft mods.

## 🎯 Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `<query>` | Search query text | Yes |

## 🎯 Options

| Option | Description | Default |
|--------|-------------|---------|
| `-l, --limit <number>` | Number of results to show | 10 |
| `-v, --version <version>` | Filter by Minecraft version | None |
| `--loader <loader>` | Filter by mod loader | None |
| `--verbose` | Enable verbose output | false |

### Supported Loaders
- `fabric` - Fabric mods
- `forge` - Forge mods
- `quilt` - Quilt mods
- `neoforge` - NeoForge mods

## 📋 Examples

### Basic search
```bash
clicraft search sodium
```
Searches for mods matching "sodium" and displays up to 10 results.

### Search with version filter
```bash
clicraft search shader --version 1.21.1
```
Find shader mods compatible with Minecraft 1.21.1.

### Search with loader filter
```bash
clicraft search optimization --loader fabric
```
Find optimization mods for the Fabric mod loader.

### Combined filters
```bash
clicraft search "performance" --version 1.20.1 --loader fabric --limit 20
```
Find up to 20 performance mods for Fabric on Minecraft 1.20.1.

### Multi-word search
```bash
clicraft search "world generation"
```
Search for mods related to world generation (use quotes for multi-word queries).

### Limit results
```bash
clicraft search minimap --limit 5
```
Show only the top 5 results for minimap mods.

## 💡 Output Format

The search results display:

```
Found 50 mods matching "sodium"

1. Sodium
   A modern rendering engine for Minecraft which greatly improves performance
   Author: CaffeineMC
   Downloads: 50.2M
   Updated: 2024-01-15
   ID: AANobbMI

2. Sodium Extra
   Extra features for Sodium
   Author: FlashyReese
   Downloads: 5.1M
   Updated: 2024-01-12
   ID: PtjYWJkn

...
```

Each result shows:
- **Name** - The mod's display name
- **Description** - Short description of what the mod does
- **Author** - The mod creator
- **Downloads** - Total download count
- **Updated** - Last update date
- **ID** - Modrinth project ID (used for installation)

## 🎮 Example Session

```bash
$ clicraft search sodium --version 1.21.1 --loader fabric

Searching Modrinth for "sodium"...

Found 3 mods matching "sodium"

1. Sodium
   A modern rendering engine for Minecraft
   Author: CaffeineMC
   Downloads: 50.2M
   Updated: 2024-01-15
   ID: AANobbMI

2. Sodium Extra
   Adds additional options to Sodium
   Author: FlashyReese
   Downloads: 5.1M
   Updated: 2024-01-12
   ID: PtjYWJkn

3. Reese's Sodium Options
   Alternative options menu for Sodium
   Author: FlashyReese
   Downloads: 3.2M
   Updated: 2024-01-10
   ID: Bh37bMuy

To install a mod, use: clicraft install <mod-name-or-id>
```

## 🎯 Use Cases

### Finding Popular Optimization Mods
```bash
clicraft search optimization --limit 10 --loader fabric
```

### Searching for Specific Mod
```bash
clicraft search "just enough items"
```

### Discovering New Mods
```bash
clicraft search decoration --version 1.20.1 --limit 25
```

### Checking Mod Availability
```bash
clicraft search "iris shaders" --version 1.21.1 --loader fabric
```

## 🔍 Search Tips

### Use Specific Terms
Instead of searching "better", try:
- "performance"
- "optimization"
- "quality of life"
- "world generation"

### Filter by Version
Always include `--version` when searching for mods for a specific Minecraft version:
```bash
clicraft search minimap --version 1.20.1
```

### Filter by Loader
If you know your instance's mod loader, filter by it:
```bash
clicraft search sodium --loader fabric
```

### Adjust Result Limits
- Use `--limit 5` for quick searches
- Use `--limit 50` for comprehensive browsing

### Exact Mod Names
For well-known mods, use their exact name:
```bash
clicraft search "optifine"
clicraft search "sodium"
clicraft search "lithium"
```

## ⚠️ Common Issues

### No Results Found
If your search returns no results:
- Check your spelling
- Try broader search terms
- Remove version/loader filters
- Try searching on [Modrinth.com](https://modrinth.com) directly

### Network Errors
If you see "Failed to fetch from Modrinth":
- Check your internet connection
- Modrinth may be temporarily down
- Try again in a few moments

### Too Many Results
If you get too many results:
- Add more specific search terms
- Use `--version` and `--loader` filters
- Reduce `--limit` to see top results only

## 💡 Pro Tips

1. **Save Mod IDs**: Note down the mod ID from search results for easy installation
2. **Version Compatibility**: Always filter by your Minecraft version when building a mod pack
3. **Loader Consistency**: Stick to one mod loader (Fabric or Forge) for compatibility
4. **Popular Mods First**: Search results are sorted by relevance and popularity
5. **Dependencies**: Some mods require other mods - check descriptions carefully

## 📚 Related Commands

- [`clicraft install`](install.md) - Install a mod from search results
- [`clicraft info`](info.md) - View installed mods in your instance
- [`clicraft upgrade`](upgrade.md) - Update installed mods

## 🔗 Installing from Search Results

After finding a mod with `search`, install it using either:

```bash
# Using mod name
clicraft install sodium

# Using Modrinth ID
clicraft install AANobbMI
```

## 📖 API Information

The search command uses the [Modrinth API](https://docs.modrinth.com/api-spec) to fetch mod information. Results are fetched in real-time from Modrinth's servers.

## 🆘 Troubleshooting

### "API rate limit exceeded"
Modrinth has rate limits. Wait a few minutes before searching again.

### "Invalid loader specified"
Valid loaders are: `fabric`, `forge`, `quilt`, `neoforge`. Check your spelling.

### "Invalid version format"
Minecraft versions should be in format like: `1.21.1`, `1.20.1`, `1.19.2`

## 🔗 See Also

- [Commands Overview](../commands.md)
- [Install Command](install.md)
- [Upgrade Command](upgrade.md)
- [Modrinth Website](https://modrinth.com)

---

[← Back to Commands](../commands.md) | [Next: install →](install.md)
