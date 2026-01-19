# Documentation Sidebar Setup

The mcpkg documentation now includes a sidebar navigation system using GitHub Pages with the "Just the Docs" theme.

## How to Enable GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to "Pages" section
3. Under "Source", select the branch `copilot/create-stylized-docs-page`
4. Set the folder to `/docs`
5. Click "Save"

Your documentation will be published at: `https://theinfamousben.github.io/mcpkg/`

## Sidebar Structure

The sidebar will display:

```
📚 mcpkg Documentation
├── 🏠 Home
├── 📦 Installation
├── 💻 Commands
│   ├── create
│   ├── search
│   ├── install
│   ├── login
│   ├── launch
│   ├── info
│   └── upgrade
└── ⚙️ Configuration
```

## Features

- **Hierarchical Navigation**: Commands are grouped under a parent "Commands" section
- **Search Functionality**: Built-in search across all documentation
- **Dark Theme**: Easy on the eyes for reading documentation
- **Mobile Responsive**: Works on all devices
- **Back to Top**: Quick navigation to top of page
- **GitHub Link**: Direct link to repository in header

## Configuration

The sidebar is configured via:
- `docs/_config.yml` - Jekyll configuration with theme settings
- Front matter in each `.md` file - Defines navigation order and hierarchy

### Front Matter Example

```yaml
---
layout: default
title: create
parent: Commands
nav_order: 1
description: "Create a new Minecraft instance"
permalink: /commands/create
---
```

## Theme

We're using the [Just the Docs](https://just-the-docs.github.io/just-the-docs/) theme which provides:
- Clean, professional sidebar navigation
- Built-in search
- Responsive design
- Customizable color schemes
- Support for nested navigation

## Local Testing

To test the documentation locally with the sidebar:

```bash
# Install Jekyll
gem install bundler jekyll

# Create Gemfile in docs directory
cd docs
cat > Gemfile << 'EOF'
source "https://rubygems.org"
gem "jekyll"
gem "just-the-docs"
EOF

# Install dependencies
bundle install

# Run local server
bundle exec jekyll serve

# Visit http://localhost:4000 in your browser
```
