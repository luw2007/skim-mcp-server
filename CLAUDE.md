# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Skim MCP Server** - a production-ready Model Context Protocol (MCP) server that exposes the Skim code transformation CLI to AI agents. It intelligently compresses code (60-95% token reduction) while preserving structure for LLM context optimization.

**Note**: This project (luw2007/skim-mcp) wraps the upstream [Skim](https://github.com/dean0x/skim) project by dean0x.

### Key Dependencies
- **External CLI**: Requires the `skim` Rust binary (`rskim` package) - originally by dean0x, automatically installed via `scripts/install-skim.js`
- **MCP SDK**: `@modelcontextprotocol/sdk` for MCP server implementation
- **Logging**: Winston for structured logging
- **Testing**: Node.js built-in test runner with c8 for coverage

## Development Commands

### Build and Run
```bash
npm run build          # Copy src/index.js to dist/ and make executable
npm run dev            # No hot-reload - must rebuild manually
npm run install-skim   # Manual installation of skim CLI
```

### Testing
```bash
npm test               # Run all tests
npm run test:coverage  # Run tests with c8 coverage report
npm run test:watch     # Watch mode for development
```

### Code Quality
```bash
npm run lint           # Check ESLint issues
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Check Prettier formatting
npm run format:fix     # Auto-fix formatting
```

All tests must pass before committing. The project uses ESLint with Prettier integration.

## Architecture

### Single-Server Design
The entire MCP server is implemented in `src/index.js` (697 lines) with a monolithic architecture:

1. **Configuration & Constants** (lines 28-39)
   - Hardcoded limits: 10MB input, 50MB buffer, 10 requests/minute rate limit
   - Default allowed base path: `process.cwd()`

2. **Security Layer** (lines 67-220)
   - `RateLimiter` class: Per-tool rate limiting to prevent DoS
   - `validatePath()`: Absolute path requirement, anti-traversal, symlink resolution
   - `validateSource()`: Size limits, null byte detection
   - `validateLanguage()` / `validateMode()`: Whitelist validation

3. **Skim Command Executor** (lines 226-330)
   - `executeSkim()`: Uses `spawn()` with `shell: false` (no shell injection)
   - `runSkim()`: Whitelisted argument validation
   - `findSkim()`: Searches common installation paths

4. **MCP Server Setup** (lines 336-508)
   - Three exposed tools: `skim_transform`, `skim_file`, `skim_analyze`
   - Rate limiting applied per tool call
   - Comprehensive error handling with structured logging

5. **Tool Handlers** (lines 514-652)
   - `handleSkimTransform`: Transform source code string
   - `handleSkimFile`: Transform file/directory
   - `handleSkimAnalyze`: Transform + analysis framework prompt

### Security-First Design
- **Path security**: Only absolute paths, no traversal, explicit allowlist
- **Input validation**: All parameters validated, size limits enforced
- **Command safety**: Parameterized commands only, argument whitelist
- **Rate limiting**: Prevents DoS attacks, per-tool limits
- **Production logging**: Winston with JSON format for structured logging

### External Dependency: Skim CLI
The server is a wrapper around the `skim` Rust binary originally created by dean0x. Key considerations:
- Automatically installed via `scripts/install-skim.js` (npm postinstall hook)
- Installation priority: npm global (rskim) → Cargo (rskim)
- Binary located via `findSkim()` searching common paths
- If skim is missing, server fails to start
- Upstream project: https://github.com/dean0x/skim

## Testing Strategy

Test suite in `test/index.test.js` uses Node.js built-in test runner (no external framework):

1. **Skim availability test**: Verifies CLI is installed and working
2. **Security tests**: Path traversal, oversized input, invalid language detection
3. **Path validation tests**: Valid paths, relative path rejection, non-existent paths
4. **Source validation tests**: Valid source, null byte rejection, empty string handling

Key pattern: Tests import validation functions directly from `src/index.js` using dynamic imports.

## Code Style and Conventions

### ESLint Configuration (.eslintrc.json)
- ES2022, Node.js environment
- Extends: eslint:recommended + prettier
- Rules: No console (warn), no unused vars, no eval, security-focused
- Tab indentation (2 spaces), enforced by Prettier

### Prettier Configuration (.prettierrc)
- Semicolons: always
- Tabs: true (width: 2)
- Single quotes: false (double quotes)
- Trailing commas: es5
- Print width: 100
- End of line: lf

### File Structure
```
src/
  index.js          # Single monolithic server file (697 lines)
scripts/
  install-skim.js   # Auto-installer for Skim CLI (112 lines)
  build.js          # Simple build script (46 lines)
test/
  index.test.js     # Test suite using Node.js test runner (190 lines)
docs/              # Empty (see README.md for examples)
dist/              # Built files (created by build script)
```

## Transform Modes and Token Reduction

The Skim CLI supports four modes affecting token reduction:

| Mode | Reduction | Use Case | Preserved |
|------|-----------|----------|-----------|
| **structure** | 60-80% | Architecture analysis | Function names, structure, comments |
| **signatures** | 85-92% | API documentation | Function signatures only |
| **types** | 90-95% | Type system analysis | Type definitions only |
| **full** | 0% | Debug/validation | Original code (no transformation) |

Supported languages: TypeScript, JavaScript, Python, Rust, Go, Java, JSON, Markdown, YAML

## Deployment and Environment

### Production Configuration
```bash
# Essential environment variables
export LOG_LEVEL=info                    # or: debug, warn, error
export SKIM_ALLOWED_PATHS=/workspace,/other/path  # Comma-separated
export SKIM_MAX_REQUESTS_PER_MINUTE=10   # Rate limit
export SKIM_MAX_INPUT_SIZE=10485760      # 10MB in bytes
```

### Prepublish Hook
The `prepublishOnly` script ensures quality:
1. Lint check passes
2. All tests pass
3. Build succeeds

### Docker Support
- Dockerfile included for containerized deployment
- Health check: Server logs