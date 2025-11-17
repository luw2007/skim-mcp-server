# Skim MCP Server

> 🚀 Production-ready Model Context Protocol server for Skim code transformation
>
> Built on top of [@dean0x](https://github.com/dean0x)'s [Skim](https://github.com/dean0x/skim) project

[![Version](https://img.shields.io/npm/v/skim-mcp-server?style=flat-square)](https://www.npmjs.com/package/skim-mcp-server)
[![Downloads](https://img.shields.io/npm/dm/skim-mcp-server?style=flat-square)](https://www.npmjs.com/package/skim-mcp-server)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org/)

[![GitHub Stars](https://img.shields.io/github/stars/luw2007/skim-mcp-server?style=flat-square)](https://github.com/luw2007/skim-mcp-server/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/luw2007/skim-mcp-server?style=flat-square)](https://github.com/luw2007/skim-mcp-server/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/luw2007/skim-mcp-server/pulls)
[![Last Commit](https://img.shields.io/github/last-commit/luw2007/skim-mcp-server?style=flat-square)](https://github.com/luw2007/skim-mcp-server/commits)

Intelligently compress code for LLM context windows with built-in security, monitoring, and production features.

---

## 📑 Table of Contents

- [🤔 What is This?](#-what-is-this-how-can-it-help-me)
- [🌟 Features](#-features)
- [📦 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [🚀 Usage](#-usage)
- [🔒 Security Features](#-security-features)
- [🧪 Testing](#-testing)
- [📊 Performance](#-performance)
- [📖 Documentation](#-documentation)
- [🛠️ Development](#️-development)
- [🐳 Docker](#-docker)
- [❓ FAQ](#-frequently-asked-questions-beginners-must-read)
- [🆘 Support](#-support)
- [🔄 Changelog](#-changelog)
- [🔮 Roadmap](#-roadmap)
- [🙏 Acknowledgments](#-acknowledgments)

---

## 🤔 What is This? How Can It Help Me?

**In Simple Terms:**

If you're using **Claude Code** (an AI coding assistant), you may encounter "context too long" limitations when analyzing large code projects.

**What Skim MCP Server Does:**
- 📦 Automatically compresses code, preserving structure while reducing 60-95% of content
- 🧠 Enables Claude Code to analyze larger projects
- ⚡ Provides more accurate code suggestions and analysis

**Prerequisites:**
- ✅ You have [Claude Code](https://claude.ai/code) installed
- ✅ Your computer has Node.js 18.0.0 or higher installed

**Not sure if you need this?** If you frequently use Claude Code to analyze large codebases, this tool will be very helpful!

## 🌟 Features

- 🔒 **Secure by Default** - Path validation, input sanitization, rate limiting
- 📊 **Production Monitoring** - Structured logging, health checks, metrics
- 🚀 **High Performance** - Fast execution with spawn, optimized buffering
- 🛡️ **DoS Protection** - Request limits, size limits, timeout handling
- 📝 **Comprehensive Logging** - Winston integration with configurable levels
- 🧪 **Full Test Coverage** - Unit and integration tests included
- 📦 **Zero Dependencies** - Only MCP SDK and Winston (production dependencies)

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- npm, pnpm, or yarn

### Option 1: Global Install (Recommended)

```bash
# Install both MCP server and Skim CLI
npm install -g skim-mcp-server

# Or install skim CLI separately
npm install -g rskim
```

### Option 2: Project Install

```bash
# In your project directory
npm install skim-mcp-server
```

### Option 3: From Source

```bash
git clone https://github.com/luw2007/skim-mcp-server.git
cd skim-mcp-server
npm install
npm run build
```

### Automatic Skim Installation

The server automatically installs Skim CLI if not found:

```bash
# During npm install (postinstall hook)
npm install skim-mcp-server

# Or manually
npm run install-skim
```

### Verify Installation

After installation, verify it was successful:

```bash
# Check if skim-mcp-server is available
skim-mcp-server --version

# Check Node.js version
node --version  # Should be >= 18.0.0
```

If `skim-mcp-server` shows "command not found":

```bash
# Check globally installed packages
npm list -g skim-mcp-server

# Check npm global path
npm config get prefix
```

You may need to add the npm global path to your system PATH.

## 🔧 Configuration

### Claude Code Settings

Locate and edit your Claude Code configuration file (depending on your operating system):

**macOS / Linux:**
- `~/.claude/config.json` (recommended, try this first)
- or `~/.config/claude-code/config.json`

**Windows:**
- `C:\Users\YourUsername\.claude\config.json`
- or `C:\Users\YourUsername\AppData\Roaming\claude-code\config.json`

**If the file doesn't exist, create it.**

Add the following configuration:

```json
{
  "mcpServers": {
    "skim": {
      "command": "skim-mcp-server"
    }
  }
}
```

⚠️ **Important**: You must completely quit and restart Claude Code for the changes to take effect.

### Environment Variables

```bash
# Logging level
export LOG_LEVEL=info  # debug, info, warn, error

# Allowed base paths (comma-separated)
export SKIM_ALLOWED_PATHS=/workspace,/home/user/projects

# Rate limiting
export SKIM_MAX_REQUESTS_PER_MINUTE=10

# Input size limit
export SKIM_MAX_INPUT_SIZE=10485760  # 10MB in bytes
```

### Verify Configuration Success

After configuring and restarting Claude Code, test it:

1. Open Claude Code
2. Type in the conversation:
   ```
   Help me analyze this project's code structure
   ```
3. Watch if Claude Code automatically uses the `mcp__skim__skim_analyze` tool

**Success indicators:**
- You'll see messages like "Using skim tool to analyze code..." in the conversation
- Or see `skim_file` / `skim_analyze` calls in the tool invocation logs

**If it doesn't work:**
- Check if config file JSON format is valid (use [jsonlint.com](https://jsonlint.com/) to validate)
- Confirm you completely quit and restarted Claude Code
- Check Claude Code's log files for error messages

## 🚀 Usage

Once configured, the tools are automatically available in Claude Code:

### Tool 1: `skim_transform` - Transform Source Code

Transform code from a string:

```javascript
// Claude Code automatically uses this when analyzing code
mcp__skim__skim_transform({
  source: 'function add(a, b) { return a + b; }',
  language: 'javascript',
  mode: 'structure',
  show_stats: true
})

// Returns:
// function add(a, b)  { /* ... */ }
//
// 📊 Token Reduction Statistics:
// [skim] 24 tokens → 9 tokens (62.5% reduction)
```

### Tool 2: `skim_file` - Transform Files

Transform file or directory:

```javascript
mcp__skim__skim_file({
  path: '/workspace/src',
  mode: 'structure',
  show_stats: true
})

// Returns compressed code with statistics
```

### Tool 3: `skim_analyze` - Architecture Analysis

Analyze code architecture:

```javascript
mcp__skim__skim_analyze({
  path: '/workspace/src',
  mode: 'structure'
})

// Returns:
// 1. Compressed code
// 2. Token statistics
// 3. Analysis framework to guide Claude
```

### Real-World Usage Examples

**Scenario 1: Analyzing Project Architecture**
```
You: "Help me analyze the code architecture in src/ directory"

Claude Code:
→ Automatically calls mcp__skim__skim_analyze
→ Compresses code (65% token reduction)
→ Quickly analyzes architecture and provides suggestions

Result: Complete architecture analysis report
```

**Scenario 2: Code Review**
```
You: "Review the code quality of src/auth.ts"

Claude Code:
→ Automatically calls mcp__skim__skim_file
→ Extracts function signatures and key logic
→ Provides detailed code review suggestions

Result: Identifies potential issues and improvement suggestions
```

**Scenario 3: Understanding Large Files**
```
You: "What does this 3000-line file do?"

Claude Code:
→ Automatically calls mcp__skim__skim_transform
→ Compresses to core structure (80% content reduction)
→ Quickly understands main logic

Result: Clear functional overview and workflow explanation
```

**Key Point: You don't need to manually invoke these tools - Claude Code will automatically decide when to use them!**

## 🔒 Security Features

### Path Validation

✅ Only absolute paths allowed
✅ Path traversal attacks blocked (`../../../etc/passwd`)
✅ Symlink resolution with validation
✅ Configurable allowed base paths

### Input Sanitization

✅ Maximum input size (10MB default)
✅ Null byte detection
✅ Command injection prevention
✅ Shell injection mitigation (parameterized commands)

### Rate Limiting

✅ Requests per minute limits
✅ Prevents DoS attacks
✅ Retry-after headers

## 🧪 Testing

### Run Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Test with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Coverage

- ✅ Skim CLI availability
- ✅ Path traversal prevention
- ✅ Input validation
- ✅ Oversized input detection
- ✅ Invalid language detection
- ✅ Null byte rejection
- ✅ Malformed path handling

## 📊 Performance

### Benchmarks

```bash
# Single file (300 lines)
skim transform - 1.3ms

# Large file (3000 lines)
skim transform - 14.6ms

# Cached (second run)
skim transform - 5ms (48x faster)

# MCP overhead < 2ms
```

### Resource Limits

- Max input: 10MB per request
- Max output: 50MB buffer
- Timeout: 30 seconds per request
- Rate limit: 10 requests/minute

## 📖 Documentation

### Transformation Modes

| Mode | Reduction | Use Case | Example Output |
|------|-----------|----------|----------------|
| **structure** | 60-80% | Architecture analysis | `function foo() { /* ... */ }` |
| **signatures** | 85-92% | API documentation | `function foo(): void` |
| **types** | 90-95% | Type system analysis | `interface User { name: string }` |
| **full** | 0% | Debug/validation | Original code |

### Supported Languages

- TypeScript / JavaScript
- Python
- Rust
- Go
- Java
- JSON (special structure mode)
- Markdown (header extraction)

### CLI Reference

```bash
# Transform file
skim file.ts --mode=structure --show-stats

# Transform directory
skim src/ --mode=signatures

# Transform with glob
skim 'src/**/*.ts' --jobs 4

# Clear cache
skim --clear-cache
```

## 🛠️ Development

### Setup

```bash
git clone https://github.com/luw2007/skim-mcp-server.git
cd skim-mcp-server
npm install
```

### Development Workflow

```bash
# Start development
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format:fix

# Build for production
npm run build
```

### Project Structure

```
skim-mcp-server/
├── src/
│   └── index.js          # Main server
├── test/
│   └── index.test.js     # Test suite
├── scripts/
│   ├── install-skim.js   # Auto-install script
│   └── build.js          # Build script
├── docs/
│   └── examples.md       # Usage examples
├── dist/                 # Built files
└── README.md
```

## 🐳 Docker

### Build Image

```bash
docker build -t skim-mcp-server .
```

### Run Container

```bash
docker run -i --rm \
  -e LOG_LEVEL=info \
  -v /workspace:/workspace \
  skim-mcp-server
```

### Docker Compose

```yaml
version: '3.8'
services:
  skim-mcp:
    image: skim-mcp-server
    environment:
      - LOG_LEVEL=info
      - SKIM_ALLOWED_PATHS=/workspace
    volumes:
      - ./workspace:/workspace
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure linting passes
6. Submit a pull request

## ❓ Frequently Asked Questions (Beginners Must Read)

### Installation

**Q1: Getting "skim-mcp-server: command not found"**

Reason: npm global install path is not in your system PATH.

Solution:
```bash
# Method 1: Find the installation path
npm config get prefix

# Assuming it returns /usr/local, the full path would be:
# /usr/local/bin/skim-mcp-server

# Method 2: Use the full path in your config file
{
  "mcpServers": {
    "skim": {
      "command": "/usr/local/bin/skim-mcp-server"  # Replace with actual path
    }
  }
}
```

**Q2: Node.js version incompatibility error**

Check your version:
```bash
node --version
```

Must be >= 18.0.0. If your version is too old, visit [nodejs.org](https://nodejs.org/) to download the latest LTS version.

---

### Configuration

**Q3: Can't find where the config file is**

Try these locations in order:

**macOS / Linux:**
```bash
# 1. Check this path first
ls -la ~/.claude/config.json

# 2. If it doesn't exist, check this
ls -la ~/.config/claude-code/config.json

# 3. If neither exists, create the first one
mkdir -p ~/.claude
echo '{"mcpServers":{}}' > ~/.claude/config.json
```

**Windows:**
Search for `config.json` in File Explorer, or create it directly at:
```
C:\Users\YourUsername\.claude\config.json
```

**Q4: Configuration has no effect**

Checklist:
- [ ] Config file is valid JSON format (use [jsonlint.com](https://jsonlint.com/) to validate)
- [ ] Completely quit Claude Code (not minimized, fully quit)
- [ ] Restart Claude Code
- [ ] `skim-mcp-server` command works in terminal
- [ ] Check Claude Code logs for error messages

---

### Usage

**Q5: When will the tool be automatically used?**

Claude Code automatically uses Skim when:
- Analyzing large code files or directories
- Code review tasks
- Architecture analysis requests
- Understanding code structure

You **don't need to manually invoke it** - Claude Code will automatically decide when to use it.

**Q6: How do I know Skim is working?**

Watch Claude Code's conversation window for:
- Tool invocation messages: `mcp__skim__skim_file` or `mcp__skim__skim_analyze`
- Token statistics
- Messages like "Compressing code..." or similar

This indicates Skim is working.

**Q7: Will Skim modify my code?**

**No!** Skim only reads and compresses code for analysis - **it will not modify any source files**.

## 🆘 Support

### Reporting Issues

Please report issues on [GitHub Issues](https://github.com/luw2007/skim-mcp-server/issues).

Include:
- Node.js version (`node --version`)
- OS and architecture
- Steps to reproduce
- Error logs

### Getting Help

- 📖 Documentation: [docs/](docs/)
- 💡 Examples: [docs/examples.md](docs/examples.md)
- 💬 Discussions: [GitHub Discussions](https://github.com/dean0x/skim-mcp-server/discussions)

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 🔮 Roadmap

### v1.1.0 (Next)

- [ ] HTTP transport support
- [ ] WebSocket transport
- [ ] Plugin system
- [ ] Custom transformation rules
- [ ] Integration with more LLM platforms

### v1.2.0 (Future)

- [ ] Parallel processing optimization
- [ ] Memory-efficient streaming
- [ ] Advanced caching strategies
- [ ] Metrics dashboard

## 🙏 Acknowledgments

### Special Thanks

**[Skim](https://github.com/dean0x/skim) Project and its Author [@dean0x](https://github.com/dean0x)**

This project is an MCP server wrapper built on top of the excellent Skim project created by dean0x. Skim is a powerful code transformation tool written in Rust that provides intelligent code compression capabilities for LLMs.

- **Original Project**: https://github.com/dean0x/skim
- **Core Technology**: Rust + tree-sitter
- **Contribution**: Provides 60-95% code compression capability

Without dean0x's outstanding work, this MCP server wouldn't exist. We highly recommend visiting the original project to learn more about the technical details!

### Other Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP protocol specification
- [tree-sitter](https://tree-sitter.github.io/) - Code parsing engine
- [Claude Code](https://claude.ai/code) team - For providing an excellent AI coding assistant platform
- All developers who have contributed to this project

---

**Made with ❤️ for the LLM community**
