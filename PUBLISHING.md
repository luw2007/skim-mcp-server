# Publishing Guide for Skim MCP Server

This guide covers how to publish the Skim MCP Server to the official MCP Registry and Smithery platform.

## Prerequisites

✅ **Already Completed:**
- `server.json` file created with MCP Registry metadata
- `package.json` updated with `mcpName` field
- Package published to npm: https://www.npmjs.com/package/skim-mcp

## 🚀 Publishing to MCP Registry (Official)

The MCP Registry is the official catalog for Model Context Protocol servers, maintained by Anthropic.

### Benefits
- Official discoverability for all MCP clients
- Trusted by Claude Code and other MCP platforms
- Centralized metadata repository

### Publishing Steps

#### 1. Install MCP Publisher CLI

```bash
# Clone the MCP Registry repository
git clone https://github.com/modelcontextprotocol/registry.git
cd registry

# Build the publisher tool
make publisher
```

#### 2. Authenticate with GitHub

The easiest method is GitHub OAuth authentication:

```bash
./bin/mcp-publisher login
```

This will authenticate using your GitHub account and authorize publishing under the `io.github.luw2007/*` namespace.

#### 3. Publish Your Server

```bash
# Navigate back to your project directory
cd /path/to/skim-mcp

# Publish using the MCP publisher CLI
/path/to/registry/bin/mcp-publisher publish server.json
```

#### 4. Verify Publication

After successful publication:
- Check the MCP Registry: https://registry.modelcontextprotocol.io/
- Search for "skim-mcp" or "io.github.luw2007/skim-mcp"
- Verify metadata is correct

### Alternative: Manual PR Submission

If you prefer manual submission:

1. Fork https://github.com/modelcontextprotocol/registry
2. Add your `server.json` to the appropriate directory
3. Submit a Pull Request
4. Wait for review and approval

### Updating Your Server

To publish updates:
1. Update the `version` field in `server.json` and `package.json`
2. Publish the new version to npm
3. Run `mcp-publisher publish server.json` again with the new version

---

## 🏗️ Publishing to Smithery

Smithery provides distribution, hosting, and monitoring for MCP servers with over 10,000 users.

### Benefits
- Remote hosting on Smithery infrastructure
- One-click installation for users
- Usage analytics and monitoring
- Interactive testing playground

### Publishing Steps

#### Method 1: GitHub Integration (Recommended)

1. **Visit Smithery Publish Page**
   ```
   https://smithery.ai/new
   ```

2. **Click "Continue with GitHub"**
   - Authorize Smithery to access your repository
   - Select the `luw2007/skim-mcp` repository

3. **Configure Deployment**
   - Choose deployment type:
     - **Remote Hosting** (recommended): Smithery hosts the server
     - **Local Distribution**: Users run it locally
     - **Self-Hosted**: You host, Smithery lists it

4. **Review and Publish**
   - Smithery will detect your package.json and server.json
   - Review the configuration
   - Click "Publish"

5. **Verify Deployment**
   - Your server will appear at: `https://smithery.ai/server/io.github.luw2007/skim-mcp`
   - Test using the built-in playground

#### Method 2: Smithery CLI

```bash
# Install Smithery CLI globally
npm install -g @smithery/cli

# Authenticate
smithery login

# Deploy your server
cd /path/to/skim-mcp
smithery deploy .
```

### Testing Locally with Smithery

```bash
# Run development server with hot-reload
smithery dev dist/index.js --port 3000

# Open interactive playground
smithery playground
```

### Monitoring and Updates

After publishing:
- Monitor usage at: https://smithery.ai/dashboard
- Updates are automatic when you push to GitHub (if using GitHub integration)
- Manual updates: `smithery deploy .` after changes

---

## 📊 Distribution Channels Summary

| Platform | Status | URL | Users |
|----------|--------|-----|-------|
| **npm** | ✅ Published | https://www.npmjs.com/package/skim-mcp | Direct installs |
| **MCP Registry** | ⏳ Pending | https://registry.modelcontextprotocol.io/ | All MCP clients |
| **Smithery** | ⏳ Pending | https://smithery.ai/new | 10,000+ users |

---

## 🔄 Update Workflow

When releasing a new version:

1. **Update version numbers**
   ```bash
   # Update package.json version
   npm version patch  # or minor, major

   # Update server.json version to match
   # Edit server.json manually
   ```

2. **Publish to npm**
   ```bash
   npm publish
   ```

3. **Publish to MCP Registry**
   ```bash
   /path/to/registry/bin/mcp-publisher publish server.json
   ```

4. **Update Smithery**
   - If using GitHub integration: automatic
   - If using CLI: `smithery deploy .`

---

## 🆘 Troubleshooting

### MCP Registry Issues

**Authentication Failed**
```bash
# Re-authenticate
./bin/mcp-publisher login
```

**Namespace Verification Error**
- Ensure you're authenticated with the GitHub account that owns the repository
- Namespace must be `io.github.luw2007/*` to match your GitHub username

**Version Already Exists**
- Each publication must have a unique version number
- Increment version in both `package.json` and `server.json`

### Smithery Issues

**Build Failed**
```bash
# Test build locally
smithery build dist/index.js

# Check logs
smithery logs
```

**Server Not Running**
- Verify `dist/index.js` is the correct entry point
- Ensure all dependencies are in package.json
- Check Node.js version requirement (>=18.0.0)

---

## 📞 Support

- **MCP Registry**: https://github.com/modelcontextprotocol/registry/issues
- **Smithery**: https://smithery.ai/docs or support@smithery.ai
- **This Project**: https://github.com/luw2007/skim-mcp/issues

---

**Last Updated**: 2025-01-17
