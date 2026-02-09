# Crash log analysis

## Description
Help users diagnose crashes by analyzing crash reports and logs.

## Features
- `clicraft logs` - Show recent log output
- `clicraft logs --crash` - Find and display latest crash report
- `clicraft diagnose` - Analyze crash for common issues
- Detect common problems:
  - Mod conflicts
  - Missing dependencies
  - Java version issues
  - Out of memory
  - Incompatible mod versions

## Implementation Notes
- Parse `crash-reports/` and `logs/latest.log`
- Build knowledge base of common crash patterns
- Could integrate with AI for more complex analysis
- Suggest fixes based on detected issues
