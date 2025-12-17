#!/usr/bin/env node

/**
 * Build script
 * Bundles the MCP server for distribution
 */

import { copyFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");
const srcDir = join(projectRoot, "src");
const distDir = join(projectRoot, "dist");

async function main() {
    console.log("🔨 Building skim-mcp...");

    try {
        // Create dist directory
        await mkdir(distDir, { recursive: true });
        console.log("✅ Created dist directory");

        // Copy source files to dist
        await copyFile(join(srcDir, "index.js"), join(distDir, "index.js"));
        console.log("✅ Copied index.js to dist");

        await copyFile(join(srcDir, "constants.js"), join(distDir, "constants.js"));
        console.log("✅ Copied constants.js to dist");

        // Make executable (on Unix-like systems)
        if (process.platform !== "win32") {
            const { exec } = await import("child_process");
            const { promisify } = await import("util");
            const execAsync = promisify(exec);
            await execAsync(`chmod +x ${join(distDir, "index.js")}`);
            console.log("✅ Made executable");
        }

        console.log("\n✅ Build completed successfully!");
    } catch (error) {
        console.error("❌ Build failed:", error.message);
        process.exit(1);
    }
}

main();
