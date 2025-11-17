/**
 * Shared constants for Skim MCP Server
 */

/**
 * Common installation paths for the Skim CLI executable
 * Used by both the server and the installation script
 */
export const SKIM_COMMON_PATHS = [
	"/usr/local/bin/skim",
	"/usr/bin/skim",
	"/bin/skim",
	`${process.env.HOME}/.cargo/bin/skim`,
	`${process.env.HOME}/.npm/bin/skim`,
	`${process.env.HOME}/.npm-global/bin/skim`,
	`${process.env.HOME}/.local/bin/skim`,
	`/opt/homebrew/bin/skim`, // Homebrew on macOS ARM
];
