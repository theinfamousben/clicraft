# Installation

This guide will help you install mcpkg on your system.

## 📋 Prerequisites

Before installing mcpkg, ensure you have the following installed:

- **Node.js** 18 or higher - [Download Node.js](https://nodejs.org/)
- **Java** 21 or higher - Required for running Minecraft - [Download Java](https://adoptium.net/)

You can verify your installations by running:

```bash
node --version
java --version
```

## 📦 Installation Methods

### Method 1: NPM Package (Recommended)

**Coming Soon!** The npm package will be available soon. Once released, you'll be able to install globally with:

```bash
npm install -g mcpkg
```

### Method 2: Clone from Source

This is currently the recommended way to install mcpkg:

```bash
# Clone the repository
git clone https://github.com/theinfamousben/mcpkg.git
cd mcpkg

# Install dependencies
npm install

# Link globally (allows you to use 'mcpkg' command anywhere)
npm link
```

After linking, you can use the `mcpkg` command from any directory:

```bash
mcpkg --version
```

## 🔧 Verifying Installation

To verify that mcpkg is installed correctly, run:

```bash
mcpkg --version
```

This should display the current version of mcpkg.

## 📁 Configuration Files

mcpkg stores configuration files in the following locations:

- **Authentication tokens**: `~/.mcpkg/auth.json`
- **Instance configuration**: `mcconfig.json` (in each instance directory)

These files are created automatically when you use mcpkg for the first time.

## ⬆️ Updating mcpkg

### If installed from source:

```bash
cd mcpkg
git pull origin main
npm install
```

### If installed via npm (when available):

```bash
npm update -g mcpkg
```

## 🗑️ Uninstalling

### If installed from source:

```bash
npm unlink mcpkg
```

Then delete the cloned repository folder.

### If installed via npm (when available):

```bash
npm uninstall -g mcpkg
```

To also remove configuration files:

```bash
rm -rf ~/.mcpkg
```

## 🐛 Troubleshooting

### "command not found: mcpkg"

If you see this error after installation:

1. Make sure you ran `npm link` in the mcpkg directory
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

1. Check the [GitHub Issues](https://github.com/theinfamousben/mcpkg/issues) page
2. Open a new issue with details about your problem
3. Include your operating system, Node.js version, and any error messages

## ⏭️ Next Steps

Once mcpkg is installed, you're ready to:

1. [Create your first instance](commands/create.md)
2. [Search for mods](commands/search.md)
3. [Install mods](commands/install.md)
4. [Launch the game](commands/launch.md)

---

[← Back to Home](index.md) | [View All Commands →](commands.md)
