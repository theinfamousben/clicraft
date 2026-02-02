---
layout: default
title: Installation
nav_order: 2
description: "Install CLIcraft on your system"
permalink: /installation
---

# Installation

This guide will help you install CLIcraft on your system.

## 📋 Prerequisites

Before installing CLIcraft, ensure you have the following installed:

- **Node.js** 18 or higher - [Download Node.js](https://nodejs.org/)
- **Java** 21 or higher - Required for running Minecraft - [Download Java](https://adoptium.net/)

You can verify your installations by running:

```bash
node --version
java --version
```

## 📦 Installation Methods

### Method 1: NPM Package (Recommended)

Install CLIcraft globally via npm:

```bash
npm install -g @bobschlowinskii/clicraft
```

This is the easiest and recommended way to install CLIcraft.

### Method 2: Clone from Source 

Alternatively, you can install from source:

```bash
# Clone the repository
git clone -b live https://github.com/theinfamousben/clicraft.git
cd clicraft

# Install dependencies
npm install

# Link globally (allows you to use 'clicraft' command anywhere)
npm link
```

After linking, you can use the `clicraft` command from any directory:

## 🔧 Verifying Installation

To verify that CLIcraft is installed correctly, run:

```bash
clicraft --version
```

This should display the current version of CLIcraft.

## ⬆️ Updating CLIcraft

### If installed from source:

```bash
cd clicraft
git pull origin main
npm install -g
```

### If installed via npm:

```bash
npm update -g @bobschlowinskii/clicraft
```

## 🗑️ Uninstalling

### If installed from source:

```bash
npm unlink clicraft
```

Then delete the cloned repository folder.

### If installed via npm:

```bash
npm uninstall -g @bobschlowinskii/clicraft
```

To also remove configuration files:

```bash
rm -rf ~/.clicraft
```

## 🐛 Troubleshooting

### "command not found: clicraft"

If you see this error after installation:

1. Make sure you ran `npm link` in the clicraft directory
2. Check that your npm global bin directory is in your PATH
3. Try running `npm config get prefix` to see where global packages are installed

### Permission errors on Linux/macOS

If you encounter permission errors during `npm link`, you may need to use:

```bash
sudo npm link
```

### Node.js version issues

Make sure you're using Node.js 18 or higher. You can use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node.js versions:

```bash
nvm install 18
nvm use 18
```

## 🆘 Getting Help

If you encounter any issues during installation:

1. Check the [GitHub Issues](https://github.com/theinfamousben/clicraft/issues) page
2. Open a new issue with details about your problem
3. Include your operating system, Node.js version, and any error messages

---

[← Back to Home](index.md) | [View All Commands →](commands.md)
