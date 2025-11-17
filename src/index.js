#!/usr/bin/env node

/**
 * Skim MCP Server
 *
 * Model Context Protocol server that exposes Skim code transformation
 * capabilities to AI agents with security, monitoring, and production features.
 *
 * Built on the Skim CLI by dean0x (https://github.com/dean0x/skim)
 *
 * @version 1.0.1
 * @license MIT
 * @author luw2007
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import { existsSync, realpathSync } from "fs";
import { resolve, normalize, sep } from "path";
import winston from "winston";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
	VERSION: "1.0.1",
	MAX_INPUT_SIZE: 10 * 1024 * 1024, // 10MB
	MAX_BUFFER: 50 * 1024 * 1024, // 50MB
	MAX_REQUESTS_PER_MINUTE: 10,
	TIMEOUT: 30000, // 30 seconds
	ALLOWED_BASE_PATHS: [process.cwd()],
	SKIM_COMMANDS: {
		transform: ["-", "--language", "--mode"],
		file: ["--mode", "--show-stats", "--no-header"],
	},
};

// ============================================================================
// LOGGER
// ============================================================================

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.json()
	),
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
		}),
	],
	exitOnError: false,
});

// ============================================================================
// SECURITY & VALIDATION
// ============================================================================

/**
 * Rate limiter to prevent DoS attacks
 */
class RateLimiter {
	constructor(maxRequests = 10, windowMs = 60000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
		this.requests = new Map();
	}

	check(identifier = "default") {
		const now = Date.now();
		const windowStart = now - this.windowMs;

		// Clean old requests
		const userRequests = this.requests.get(identifier) || [];
		const recentRequests = userRequests.filter((t) => t > windowStart);

		if (recentRequests.length >= this.maxRequests) {
			return {
				allowed: false,
				retryAfter: Math.ceil((recentRequests[0] + this.windowMs - now) / 1000),
			};
		}

		recentRequests.push(now);
		this.requests.set(identifier, recentRequests);

		return { allowed: true };
	}
}

const rateLimiter = new RateLimiter(
	CONFIG.MAX_REQUESTS_PER_MINUTE,
	CONFIG.MAX_REQUESTS_PER_MINUTE * 60000
);

/**
 * Validate and sanitize file path
 */
function validatePath(inputPath) {
	if (!inputPath || typeof inputPath !== "string") {
		throw new Error("Invalid path: must be a non-empty string");
	}

	// Resolve and normalize
	const resolved = resolve(normalize(inputPath));

	// Check for path traversal attempts
	if (inputPath.includes("..") || resolved.includes("..")) {
		throw new Error("Path traversal detected: invalid path");
	}

	// Must be absolute path
	if (!resolved.startsWith(sep)) {
		throw new Error("Path must be absolute");
	}

	// Check against allowed base paths
	const isAllowed = CONFIG.ALLOWED_BASE_PATHS.some((base) => resolved.startsWith(base));

	if (!isAllowed) {
		throw new Error(`Path outside allowed directories: ${CONFIG.ALLOWED_BASE_PATHS.join(", ")}`);
	}

	// Verify path exists and is not a symlink (or resolves to allowed location)
	if (!existsSync(resolved)) {
		throw new Error(`Path does not exist: ${resolved}`);
	}

	try {
		const realPath = realpathSync(resolved);
		const isRealPathAllowed = CONFIG.ALLOWED_BASE_PATHS.some((base) => realPath.startsWith(base));

		if (!isRealPathAllowed) {
			throw new Error("Resolved path outside allowed directories");
		}

		return realPath;
	} catch (err) {
		throw new Error(`Failed to resolve path: ${err.message}`);
	}
}

/**
 * Validate source code input
 */
function validateSource(source) {
	if (typeof source !== "string") {
		throw new Error("Source must be a string");
	}

	if (source.length > CONFIG.MAX_INPUT_SIZE) {
		throw new Error(
			`Source code too large: ${source.length} bytes (max: ${CONFIG.MAX_INPUT_SIZE})`
		);
	}

	// Basic sanitization for pipe safety
	// We use spawn with args, so this is mostly for defense in depth
	if (source.includes("\x00")) {
		throw new Error("Source code contains null bytes");
	}

	return source;
}

/**
 * Validate language parameter
 */
function validateLanguage(language) {
	const allowed = ["typescript", "javascript", "python", "rust", "go", "java", "json", "markdown"];

	if (!allowed.includes(language)) {
		throw new Error(`Invalid language: ${language}. Must be one of: ${allowed.join(", ")}`);
	}

	return language;
}

/**
 * Validate mode parameter
 */
function validateMode(mode) {
	const allowed = ["structure", "signatures", "types", "full"];

	if (!allowed.includes(mode)) {
		throw new Error(`Invalid mode: ${mode}. Must be one of: ${allowed.join(", ")}`);
	}

	return mode;
}

// ============================================================================
// SKIM COMMAND EXECUTOR (FIXED SECURITY)
// ============================================================================

/**
 * Execute skim command using spawn (parameterized, no shell injection)
 */
function executeSkim(command, args = [], input = null, timeout = CONFIG.TIMEOUT) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, { shell: false });

		let stdout = "";
		let stderr = "";
		let outputSize = 0;

		// Write input to stdin if provided
		if (input !== null) {
			child.stdin.write(input);
			child.stdin.end();
		}

		child.stdout.on("data", (data) => {
			const chunk = data.toString();
			outputSize += chunk.length;

			if (outputSize > CONFIG.MAX_BUFFER) {
				child.kill();
				reject(new Error("Output exceeded maximum buffer size"));
				return;
			}

			stdout += chunk;
		});

		child.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		const timeoutId = setTimeout(() => {
			child.kill();
			reject(new Error(`Command timed out after ${timeout}ms`));
		}, timeout);

		child.on("error", (err) => {
			clearTimeout(timeoutId);
			reject(new Error(`Failed to spawn process: ${err.message}`));
		});

		child.on("close", (code) => {
			clearTimeout(timeoutId);

			if (code !== 0) {
				reject(new Error(`Command failed with code ${code}: ${stderr || "Unknown error"}`));
			} else {
				resolve({ stdout, stderr });
			}
		});
	});
}

/**
 * Execute skim with parameters using spawn
 */
async function runSkim(args, input = null) {
	const skimPath = await findSkim();

	// Validate args are in whitelist
	const allowedArgs = Object.values(CONFIG.SKIM_COMMANDS).flat();
	for (const arg of args) {
		if (arg.startsWith("-") && !allowedArgs.some((allowed) => arg.startsWith(allowed))) {
			throw new Error(`Argument not allowed: ${arg}`);
		}
	}

	logger.debug("Executing skim", { path: skimPath, args: args.join(" ") });

	return executeSkim(skimPath, args, input);
}

/**
/**
 * Find skim executable in PATH
 * Enhanced to properly search system PATH and common installation locations
 */
async function findSkim() {
	const { access } = await import("fs/promises");
	const { constants } = await import("fs");

	// Method 1: Use 'which' or 'where' command to find skim in PATH
	try {
		const command = process.platform === "win32" ? "where" : "which";
		logger.debug(`Trying ${command} command`);
		const { stdout } = await executeSkim(command, ["skim"]);
		const foundPath = stdout.trim().split("\n")[0]; // Take first match
		logger.info("Found skim via which/where", { path: foundPath });
		return foundPath;
	} catch (err) {
		// which/where failed, continue searching
		logger.debug("which/where command failed", { error: err.message });
	}

	// Method 2: Check common installation paths using fs.access
	logger.debug("Checking common installation paths directly");
	const commonPaths = [
		"/usr/local/bin/skim",
		"/usr/bin/skim",
		"/bin/skim",
		`${process.env.HOME}/.cargo/bin/skim`,
		`${process.env.HOME}/.npm/bin/skim`,
		`${process.env.HOME}/.npm-global/bin/skim`,
		`${process.env.HOME}/.local/bin/skim`,
		`/opt/homebrew/bin/skim`, // Homebrew on macOS ARM
	];

	for (const path of commonPaths) {
		try {
			await access(path, constants.X_OK);
			logger.info("Found skim at common path", { path });
			return path;
		} catch {
			// Not found, continue
			continue;
		}
	}

	// Method 3: Try executing "skim" directly
	try {
		logger.debug("Trying to execute skim directly");
		await executeSkim("skim", ["--version"]);
		logger.info("Found skim via direct execution");
		return "skim";
	} catch {
		// Fall through to error
	}

	throw new Error(
		"skim not found. Install with: npm install -g rskim OR cargo install rskim\n" +
			"Checked: ~/.cargo/bin/skim, ~/.npm/bin/skim, /usr/local/bin/skim, and PATH"
	);
}

// ============================================================================
// MCP SERVER SETUP
// ============================================================================

const server = new Server(
	{
		name: "skim-mcp-server",
		version: CONFIG.VERSION,
	},
	{
		capabilities: {
			tools: {},
		},
	}
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
	logger.debug("ListTools request received");

	return {
		tools: [
			{
				name: "skim_transform",
				description:
					"Transform source code to reduce tokens while preserving structure. Safely compresses 60-95% of tokens depending on mode.",
				inputSchema: {
					type: "object",
					properties: {
						source: {
							type: "string",
							description:
								"Source code to transform (max 10MB). Invalid/Malicious content will be rejected.",
						},
						language: {
							type: "string",
							description: "Programming language",
							enum: [
								"typescript",
								"javascript",
								"python",
								"rust",
								"go",
								"java",
								"json",
								"markdown",
							],
						},
						mode: {
							type: "string",
							description:
								"Transformation mode: structure (60-80%), signatures (85-92%), types (90-95%)",
							enum: ["structure", "signatures", "types", "full"],
							default: "structure",
						},
						show_stats: {
							type: "boolean",
							description: "Include token reduction statistics in output",
							default: false,
						},
					},
					required: ["source", "language"],
				},
			},
			{
				name: "skim_file",
				description:
					"Transform file/directory using Skim. Automatically detects language from file extensions. Path validation enforced - only allowed directories accessible.",
				inputSchema: {
					type: "object",
					properties: {
						path: {
							type: "string",
							description: "File or directory path (absolute). Must be within workspace directory.",
						},
						mode: {
							type: "string",
							description: "Transformation mode",
							enum: ["structure", "signatures", "types", "full"],
							default: "structure",
						},
						show_stats: {
							type: "boolean",
							description: "Include token reduction statistics",
							default: true,
						},
						no_header: {
							type: "boolean",
							description: "Omit file path headers for single files",
							default: false,
						},
					},
					required: ["path"],
				},
			},
			{
				name: "skim_analyze",
				description:
					"Analyze codebase architecture by first compressing with Skim, then providing structural insights. Includes analysis framework in response.",
				inputSchema: {
					type: "object",
					properties: {
						path: {
							type: "string",
							description: "Directory or file path to analyze",
						},
						mode: {
							type: "string",
							description: "Analysis depth mode",
							enum: ["structure", "signatures", "types"],
							default: "structure",
						},
					},
					required: ["path"],
				},
			},
		],
	};
});

/**
 * Handle tool execution with security checks
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	// Rate limiting
	const rateLimit = rateLimiter.check(name);
	if (!rateLimit.allowed) {
		return {
			content: [
				{
					type: "text",
					text: `Rate limit exceeded. Retry after ${rateLimit.retryAfter}s`,
				},
			],
			isError: true,
		};
	}

	logger.info("Tool call received", { tool: name, args: Object.keys(args) });

	try {
		switch (name) {
			case "skim_transform":
				return await handleSkimTransform(args);

			case "skim_file":
				return await handleSkimFile(args);

			case "skim_analyze":
				return await handleSkimAnalyze(args);

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	} catch (error) {
		logger.error("Tool execution failed", {
			tool: name,
			error: error.message,
			stack: error.stack,
		});

		return {
			content: [
				{
					type: "text",
					text: `Error: ${error.message}`,
				},
			],
			isError: true,
		};
	}
});

// ============================================================================
// TOOL HANDLERS
// ============================================================================

/**
 * Transform source code from string
 */
async function handleSkimTransform(args) {
	const { source, language, mode = "structure", show_stats = false } = args;

	const validatedSource = validateSource(source);
	const validatedLanguage = validateLanguage(language);
	const validatedMode = validateMode(mode);

	const skimArgs = ["-", "--language", validatedLanguage, "--mode", validatedMode];

	if (show_stats) {
		skimArgs.push("--show-stats");
	}

	const { stdout, stderr } = await runSkim(skimArgs, validatedSource);

	let output = stdout;

	if (show_stats && stderr) {
		output += `\n\n📊 Token Reduction Statistics:\n${stderr}`;
	}

	logger.info("Transform completed", {
		language: validatedLanguage,
		mode: validatedMode,
		outputLength: stdout.length,
	});

	return {
		content: [
			{
				type: "text",
				text: output,
			},
		],
	};
}

/**
 * Transform file or directory
 */
async function handleSkimFile(args) {
	const { path: filePath, mode = "structure", show_stats = true, no_header = false } = args;

	const validatedPath = validatePath(filePath);
	const validatedMode = validateMode(mode);

	const skimArgs = [validatedPath, "--mode", validatedMode];

	if (show_stats) {
		skimArgs.push("--show-stats");
	}

	if (no_header) {
		skimArgs.push("--no-header");
	}

	const { stdout, stderr } = await runSkim(skimArgs, null);

	let output = stdout;

	if (show_stats && stderr) {
		output += `\n\n📊 Token Reduction Statistics:\n${stderr}`;
	}

	logger.info("File transformation completed", {
		path: validatedPath,
		mode: validatedMode,
		outputLength: stdout.length,
	});

	return {
		content: [
			{
				type: "text",
				text: output,
			},
		],
	};
}

/**
 * Analyze codebase with compression and insights
 */
async function handleSkimAnalyze(args) {
	const { path: filePath, mode = "structure" } = args;

	const validatedPath = validatePath(filePath);
	const validatedMode = validateMode(mode);

	const skimArgs = [validatedPath, "--mode", validatedMode, "--show-stats"];

	const { stdout, stderr } = await runSkim(skimArgs, null);

	const analysis = `
# Code Analysis: ${validatedPath}

## Compressed Code (Mode: ${validatedMode})

${stdout}

${stderr ? `\n📊 Token Reduction: ${stderr}\n` : ""}

## Analysis Instructions

Based on the compressed code above, provide:

1. **Architecture Overview**: High-level structure and organization
2. **Module Dependencies**: How components interact
3. **Public API Surface**: Key interfaces and exports
4. **Design Patterns**: Observable architectural patterns
5. **Recommendations**: Potential improvements or concerns

Focus on STRUCTURE and DESIGN, not implementation details.
`;

	logger.info("Analysis completed", {
		path: validatedPath,
		mode: validatedMode,
	});

	return {
		content: [
			{
				type: "text",
				text: analysis.trim(),
			},
		],
	};
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start the MCP server
 */
async function main() {
	try {
		// Verify skim is available
		await findSkim();
		logger.info("Skim executable found");

		const transport = new StdioServerTransport();
		await server.connect(transport);

		logger.info("Skim MCP Server started", {
			version: CONFIG.VERSION,
			pid: process.pid,
			node: process.version,
			platform: process.platform,
			arch: process.arch,
		});

		logger.info("Ready to accept connections");
	} catch (error) {
		logger.error("Failed to start server", {
			error: error.message,
			stack: error.stack,
		});
		process.exit(1);
	}
}

main().catch((error) => {
	logger.error("Fatal error", {
		error: error.message,
		stack: error.stack,
	});
	process.exit(1);
});

// Export for testing
export { main, validatePath, validateSource, validateLanguage, validateMode };
