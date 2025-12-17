# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Security

## [2.0.0] - 2025-12-17

### Changed
- **Breaking**: Renamed package from `skim-mcp-server` to `skim-mcp` for shorter, cleaner naming
- **Breaking**: Renamed GitHub repository from `luw2007/skim-mcp-server` to `luw2007/skim-mcp`
- **Breaking**: MCP server name changed from `io.github.luw2007/skim-mcp-server` to `io.github.luw2007/skim_mcp`
- **Breaking**: Binary command changed from `skim-mcp-server` to `skim-mcp`
- **Breaking**: Configuration server key should now use `skim_mcp` instead of `skim` in mcpServers

### Migration Guide
If you're upgrading from `skim-mcp-server`:
1. Update your `config.json`: change `"skim": {"command": "skim-mcp-server"}` to `"skim_mcp": {"command": "skim-mcp"}`
2. Uninstall the old package: `npm uninstall -g skim-mcp-server`
3. Install the new package: `npm install -g skim-mcp`

### Security

## [1.1.2] - 2025-12-11

### Fixed
- **Critical**: Fixed server startup detection using fileURLToPath and realpathSync
- Server now correctly starts when run directly (was broken due to path comparison bug)
- Handles symlink paths correctly (e.g., /tmp vs /private/tmp on macOS)
- Tests still pass and server behavior is preserved

## [1.1.1] - 2025-12-11

### Fixed
- Fixed install-skim.js import path to use dist/constants.js instead of src/constants.js
- This fixes the postinstall script failure when installing from npm

## [1.1.0] - 2025-12-11

### Changed
- **Major dependency upgrades:**
  - Upgraded @modelcontextprotocol/sdk from 0.5.0 to 1.24.3 (MCP spec 2025-11-25)
  - Upgraded winston from 3.18.3 to 3.19.0
  - Upgraded prettier from 3.6.2 to 3.7.4
  - Upgraded c8 from 9.1.0 to 10.1.3
  - Upgraded eslint-config-prettier from 9.1.2 to 10.1.8

### Fixed
- Fixed server hanging issue during module import (tests now exit properly)
- Server now only starts when run directly, not when imported as a module

## [1.0.4] - 2025-12-11

### Changed
- Upgraded skim CLI dependency from v0.7.0 to v0.8.0
- Updated peerDependencies to require rskim ^0.8.0

### Added
- YAML language support (yaml, yml file extensions)
- YAML structure extraction with 60-80% token reduction
- Documentation updates for YAML support

## [1.0.0] - 2024-11-17

### Added

- Initial release of Skim MCP Server by luw2007
- Based on the upstream Skim project by dean0x (https://github.com/dean0x/skim)
- Three core MCP tools: `skim_transform`, `skim_file`, `skim_analyze`
- Security features:
  - Path traversal prevention
  - Input size limiting (10MB default)
  - Rate limiting (10 requests/minute)
  - Shell injection protection via parameterized commands
- Input validation:
  - Absolute path requirement
  - Allowed base path configuration
  - Symlink resolution and validation
  - Null byte detection
- Production features:
  - Structured logging with Winston
  - Detailed error messages with context
  - Performance monitoring
  - Timeout handling (30 seconds)
  - Max output buffer size (50MB)
- Auto-installation of Skim CLI via `npm run install-skim`
- Comprehensive test suite covering:
  - Skim availability
  - Security validations
  - Error handling
- ESLint and Prettier configuration
- npm scripts for build, test, lint, and format
- Complete documentation with usage examples
- Docker support
- Multi-platform support (Linux, macOS, Windows)

### Changed

### Fixed

### Security

- All user inputs validated before processing
- Command arguments explicitly whitelisted
- Spawn used instead of exec to prevent shell injection
- Realpath used to resolve symlinks and prevent escapes
