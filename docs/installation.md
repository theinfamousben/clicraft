---
layout: default
title: Installation
nav_order: 2
description: "Install CLIcraft on your system"
permalink: /installation
---

# Installation

## Requirements

- **Node.js** 18+ — [nodejs.org](https://nodejs.org/)
- **Java** 21+ — [adoptium.net](https://adoptium.net/)

## Install via npm (recommended)

```bash
npm install -g @bobschlowinskii/clicraft
```

## Install from source

```bash
git clone -b live https://github.com/theinfamousben/clicraft.git
cd clicraft
npm install
npm link
```

## Verify

```bash
clicraft --version
```

## Update

```bash
# npm
npm update -g @bobschlowinskii/clicraft

# source
cd clicraft && git pull && npm install
```

## Uninstall

```bash
# npm
npm uninstall -g @bobschlowinskii/clicraft

# source
npm unlink clicraft
```

Config files are stored in `~/.clicraft/` — delete manually if needed.
