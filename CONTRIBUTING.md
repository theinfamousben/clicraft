# Contributing to CLIcraft

Thank you for your interest in contributing to CLIcraft! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Reporting Issues](#reporting-issues)
- [Community](#community)

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions.

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone has different levels of experience
- **Be inclusive**: Welcome newcomers and help them get started

## 🚀 Getting Started

Before you begin contributing, please:

1. Read through the [documentation](https://benjamin.bsstudios.org/clicraft)
2. Check the [existing issues](https://github.com/theinfamousben/clicraft/issues) to see if your idea or bug has already been reported
3. Look at open [pull requests](https://github.com/theinfamousben/clicraft/pulls) to avoid duplicate work

## 💻 Development Setup

### Prerequisites

- **Node.js** 18 or higher
- **Java** 21 or higher (for testing Minecraft functionality)
- **Git** for version control

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/clicraft.git
   cd clicraft
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/theinfamousben/clicraft.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Link the package locally** (to test your changes):
   ```bash
   npm link
   ```

6. **Verify the installation**:
   ```bash
   clicraft --version
   ```

### Project Structure

```
clicraft/
├── commands/      # Command implementations
├── helpers/       # Utility functions
├── docs/          # Documentation
├── index.js       # Main entry point
└── package.json   # Project metadata
```

## 🛠️ How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix issues reported in the issue tracker
- **New features**: Add new functionality to CLIcraft
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Code improvements**: Refactor code for better performance or readability

### Making Changes

1. **Create a new branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   
   Use descriptive branch names:
   - `feature/add-mod-search-filter`
   - `bugfix/fix-launch-error`
   - `docs/update-installation-guide`

2. **Make your changes** following the [coding guidelines](#coding-guidelines)

3. **Test your changes**:
   ```bash
   # Test the CLI manually
   clicraft --help
   clicraft create
   # etc.
   ```

4. **Update documentation** if needed:
   - Update `README.md` for user-facing changes
   - Update docs in the `docs/` folder for detailed documentation
   - Add inline comments for complex code

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```
   
   Write clear, concise commit messages:
   - ✅ "Add filter option to search command"
   - ✅ "Fix authentication error on Windows"
   - ❌ "Update stuff"
   - ❌ "WIP"

## 🔄 Pull Request Process

1. **Update your fork** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Describe what changes you made and why
   - Reference any related issues (e.g., "Fixes #123")
   - Include screenshots or examples if applicable

4. **Wait for review**:
   - A maintainer will review your PR
   - Address any feedback or requested changes
   - Once approved, your PR will be merged

### Pull Request Guidelines

- **Keep PRs focused**: One feature or fix per PR
- **Write clear descriptions**: Explain what and why, not just how
- **Include examples**: Show how to use new features
- **Update CHANGELOG.md**: Add your changes under the "Unreleased" section
- **Be responsive**: Respond to review comments promptly

## 📝 Coding Guidelines

### JavaScript Style

- Use **ES6+ syntax** (arrow functions, const/let, template literals, etc.)
- Use **2 spaces** for indentation
- Use **descriptive variable names**
- Add **comments** for complex logic
- Follow existing code style in the project

### Best Practices

- **Error handling**: Always handle errors gracefully with helpful messages
- **User feedback**: Use chalk for colored console output
- **Async/await**: Prefer async/await over callbacks or raw promises
- **Modularity**: Keep functions small and focused on a single task
- **Validation**: Validate user input before processing

### Example Code Style

```javascript
import chalk from 'chalk';

async function searchMods(query, options = {}) {
  try {
    // Validate input
    if (!query || query.trim() === '') {
      console.error(chalk.red('Error: Search query cannot be empty'));
      return;
    }

    // Perform search
    const results = await fetchFromModrinth(query, options);
    
    // Display results
    if (results.length === 0) {
      console.log(chalk.yellow('No mods found matching your query'));
      return;
    }

    displayResults(results);
  } catch (error) {
    console.error(chalk.red(`Search failed: ${error.message}`));
  }
}
```

## 🐛 Reporting Issues

### Before Submitting an Issue

1. **Search existing issues** to avoid duplicates
2. **Update to the latest version** to see if the issue is already fixed
3. **Gather information**:
   - Your operating system and version
   - Node.js version (`node --version`)
   - CLIcraft version (`clicraft --version`)
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Error messages or logs

### Submitting an Issue

When creating an issue, please include:

- **Clear title**: Describe the issue in one line
- **Description**: Explain the issue in detail
- **Steps to reproduce**: List exact steps to trigger the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Node.js version, etc.
- **Screenshots**: If applicable

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `help wanted`: Extra attention needed
- `good first issue`: Good for newcomers

## 💬 Community

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions

## 📜 License

By contributing to CLIcraft, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing to CLIcraft! Your efforts help make this tool better for everyone. 🎮✨
