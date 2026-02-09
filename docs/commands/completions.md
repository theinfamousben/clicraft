# completions

Generate shell completion scripts for bash, zsh, or fish.

## Usage

```bash
clicraft completions <shell>
```

## Arguments

- `<shell>` - Shell type: `bash`, `zsh`, or `fish`

## Installation

### Bash

```bash
# Add to ~/.bashrc
clicraft completions bash >> ~/.bashrc

# Or create separate file
clicraft completions bash > /etc/bash_completion.d/clicraft
```

### Zsh

```bash
# Add to ~/.zshrc
clicraft completions zsh >> ~/.zshrc

# Or add to fpath
clicraft completions zsh > ~/.zfunc/_clicraft
# Add to ~/.zshrc: fpath=(~/.zfunc $fpath)
```

### Fish

```bash
clicraft completions fish > ~/.config/fish/completions/clicraft.fish
```

## Features

Completions include:
- All commands and subcommands
- Command-specific flags and options
- Mod loader names (fabric, forge, quilt, neoforge)
- Upgrade keywords (mods, loader, minecraft, config)
- Auth actions (login, logout, switch, status)
- Config actions (get, set, list, reset)
- Directory completion for `-i`/`--instance`
- Installed mod slugs for uninstall (bash)

## Reload

After installation, reload your shell:

```bash
source ~/.bashrc   # bash
source ~/.zshrc    # zsh
exec fish          # fish
```
