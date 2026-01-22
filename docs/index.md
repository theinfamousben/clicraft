---
layout: default
title: Home
nav_order: 1
description: "CLIcraft - A simple Minecraft Mod Package Manager"
permalink: /
---

# CLIcraft Documentation

Welcome to **CLIcraft** - A simple, powerful Minecraft Mod Package Manager written in Node.js.

## 🎮 What is CLIcraft?

CLIcraft is a command-line tool that simplifies managing Minecraft instances and mods. Create instances with Fabric or Forge, search and install mods from Modrinth, and launch the game directly from your terminal.

## ✨ Key Features

- **🎮 Create Instances** - Set up new Minecraft client or server instances with Fabric or Forge
- **🔍 Search Mods** - Find mods on Modrinth with filters for version, loader, and more
- **📦 Install Mods** - Download and install mods directly to your instance
- **🔄 Upgrade** - Update mods, mod loader, or Minecraft version
- **ℹ️ Instance Info** - View detailed information about your instances
- **🔐 Microsoft Login** - Authenticate with your Microsoft account to play online
- **🚀 Launch Game** - Start Minecraft directly from the terminal

## 🚀 Quick Start

```bash
# Create a new instance
clicraft create

# Search for mods
clicraft search sodium

# Install a mod
cd my-instance
clicraft install sodium

# Launch the game
clicraft launch
```

## 📖 Documentation

### Getting Started
- [Installation](installation.md) - Install CLIcraft on your system
- [Commands Overview](commands.md) - List of all available commands

### Commands
- [`create`](commands/create.md) - Create a new Minecraft instance
- [`search`](commands/search.md) - Search for mods on Modrinth
- [`install`](commands/install.md) - Install mods to your instance
- [`login`](commands/login.md) - Authenticate with Microsoft account
- [`launch`](commands/launch.md) - Launch your Minecraft instance
- [`info`](commands/info.md) - View instance information
- [`upgrade`](commands/upgrade.md) - Upgrade mods and loaders

### Configuration
- [Configuration Guide](configuration.md) - Instance and authentication configuration

### Contributing
- [Contributing Guide](contributing.md) - How to contribute to CLIcraft

## 🎯 Requirements

- **Node.js** 18 or higher
- **Java** 21 or higher (for running Minecraft)

## 🌐 Supported Platforms

- ✅ Linux
- ✅ macOS
- ✅ Windows

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/theinfamousben/clicraft/blob/main/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes. You can also visit our [GitHub repository](https://github.com/theinfamousben/clicraft) to open issues or submit pull requests.

## 📄 License

ISC - See the [LICENSE](https://github.com/theinfamousben/clicraft/blob/main/LICENSE) file for details.