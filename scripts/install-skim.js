#!/usr/bin/env node

/**
 * Skim Installer
 *
 * Automatically installs Skim CLI if not found
 */

import { exec } from "child_process";
import { promisify } from "util";
import { access } from "fs/promises";
import { constants } from "fs";
import { SKIM_COMMON_PATHS } from "../src/constants.js";

const execAsync = promisify(exec);

async function findSkim() {
    for (const path of SKIM_COMMON_PATHS) {
        try {
            await access(path, constants.X_OK);
            return path;
        } catch {
            // Continue searching
        }
    }
    return null;
}

async function isCommandAvailable(command) {
    try {
        await execAsync(`which ${command}`);
        return true;
    } catch {
        return false;
    }
}

async function installViaNpm() {
    console.log("📦 Installing skim via npm...");
    try {
        await execAsync("npm install -g rskim");
        console.log("✅ Skim installed successfully via npm");
        return true;
    } catch (error) {
        console.error("❌ Failed to install via npm:", error.message);
        return false;
    }
}

async function installViaCargo() {
    console.log("📦 Installing skim via Cargo...");
    try {
        await execAsync("cargo install rskim");
        console.log("✅ Skim installed successfully via Cargo");
        return true;
    } catch (error) {
        console.error("❌ Failed to install via Cargo:", error.message);
        return false;
    }
}

async function main() {
    console.log("🔍 Checking for Skim CLI...");

    const existingSkim = await findSkim();
    if (existingSkim) {
        console.log(`✅ Skim found at: ${existingSkim}`);
        return;
    }

    console.log("⚠️  Skim not found. Attempting automatic installation...");

    // Try npm first
    const npmAvailable = await isCommandAvailable("npm");
    if (npmAvailable) {
        const success = await installViaNpm();
        if (success) return;
    }

    // Try cargo if npm failed
    const cargoAvailable = await isCommandAvailable("cargo");
    if (cargoAvailable) {
        const success = await installViaCargo();
        if (success) return;
    }

    // If both failed
    console.error("\n❌ Could not install Skim automatically.");
    console.error("\nPlease install Skim manually:");
    console.error("");
    console.error("Option 1 - via npm:");
    console.error("  npm install -g rskim");
    console.error("");
    console.error("Option 2 - via Cargo:");
    console.error("  cargo install rskim");
    console.error("");
    console.error("Option 3 - from source:");
    console.error("  Visit https://github.com/dean0x/skim for build instructions");
    process.exit(1);
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
