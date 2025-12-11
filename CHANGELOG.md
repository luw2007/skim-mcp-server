# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support for nested directory transformation
- Custom transformation rule plugins
- Performance metrics collection

### Changed

### Fixed

### Security

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
