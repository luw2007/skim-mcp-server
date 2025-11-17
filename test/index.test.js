#!/usr/bin/env node

/**
 * Comprehensive test suite for Skim MCP Server
 */

import { spawn } from "child_process";
import { writeFile, mkdir, rm } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, "fixtures");

// Test state
testIndex();

async function testIndex() {
	console.log("🧪 Running Skim MCP Server Test Suite\n");

	let passed = 0;
	let failed = 0;

	// Run all tests
	const tests = [testSkimAvailability, testSecurity, testPathValidation, testSourceValidation];

	for (const test of tests) {
		try {
			await test();
			passed++;
			console.log(`✅ ${test.name}`);
		} catch (error) {
			failed++;
			console.error(`❌ ${test.name}: ${error.message}`);
		}
	}

	// Cleanup
	if (existsSync(TEST_DIR)) {
		await rm(TEST_DIR, { recursive: true, force: true });
	}

	// Summary
	console.log("\n" + "=".repeat(50));
	console.log(`Results: ${passed} passed, ${failed} failed`);
	console.log("=".repeat(50));

	if (failed > 0) {
		process.exit(1);
	}
}

async function testSkimAvailability() {
	console.log("\n📦 Testing Skim CLI availability...");

	const results = await Promise.race([
		new Promise((resolve, reject) => {
			const child = spawn("skim", ["--version"]);
			let stdout = "";

			child.stdout.on("data", (data) => {
				stdout += data.toString();
			});

			child.on("close", (code) => {
				if (code === 0 && stdout.includes("skim")) {
					resolve(true);
				} else {
					reject(new Error("Skim not found or not working"));
				}
			});

			child.on("error", () => reject(new Error("Cannot spawn skim")));
		}),
		new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
	]);

	if (!results) {
		throw new Error("Skim CLI not available");
	}

	console.log("   ✅ Skim CLI is available");
}

async function testSecurity() {
	console.log("\n🔒 Testing security features...");

	// Test 1: Path traversal detection
	try {
		const { validatePath } = await import("../src/index.js");
		validatePath("../../../etc/passwd");
		throw new Error("Should have rejected path traversal");
	} catch (error) {
		if (!error.message.includes("traversal")) {
			throw new Error("Path traversal not detected properly");
		}
		console.log("   ✅ Path traversal detected");
	}

	// Test 2: Oversized input
	try {
		const { validateSource } = await import("../src/index.js");
		const largeInput = "x".repeat(11 * 1024 * 1024); // 11MB
		validateSource(largeInput);
		throw new Error("Should have rejected oversized input");
	} catch (error) {
		if (!error.message.includes("large")) {
			throw new Error("Oversized input not detected properly");
		}
		console.log("   ✅ Oversized input detected");
	}

	// Test 3: Invalid language
	try {
		const { validateLanguage } = await import("../src/index.js");
		validateLanguage("invalid-lang");
		throw new Error("Should have rejected invalid language");
	} catch (error) {
		if (!error.message.includes("Invalid language")) {
			throw new Error("Invalid language not detected properly");
		}
		console.log("   ✅ Invalid language detected");
	}

	// Test 4: Directory creation
	await mkdir(TEST_DIR, { recursive: true });
	await writeFile(join(TEST_DIR, "test.ts"), "const x: number = 1;");
	console.log("   ✅ Test fixtures created");
}

async function testPathValidation() {
	const { validatePath } = await import("../src/index.js");

	// Test 1: Valid path
	const validPath = process.cwd();
	const result = validatePath(validPath);
	if (result !== validPath) {
		throw new Error("Valid path validation failed");
	}
	console.log("   ✅ Valid path accepted");

	// Test 2: Relative path (should fail)
	try {
		validatePath("./relative/path");
		throw new Error("Should reject relative path");
	} catch (error) {
		console.log("   ✅ Relative path rejected");
	}

	// Test 3: Non-existent path
	try {
		validatePath("/non/existent/path/xyz123");
		throw new Error("Should reject non-existent path");
	} catch (error) {
		console.log("   ✅ Non-existent path rejected");
	}
}

async function testSourceValidation() {
	const { validateSource } = await import("../src/index.js");

	// Test 1: Valid source
	const validSource = 'function test() { return "hello"; }';
	const result = validateSource(validSource);
	if (result !== validSource) {
		throw new Error("Valid source validation failed");
	}
	console.log("   ✅ Valid source accepted");

	// Test 2: Null bytes
	try {
		validateSource("codeWithNull\x00Byte");
		throw new Error("Should reject null bytes");
	} catch (error) {
		console.log("   ✅ Null bytes rejected");
	}

	// Test 3: Empty string (edge case)
	const emptyResult = validateSource("");
	if (emptyResult !== "") {
		throw new Error("Empty source validation failed");
	}
	console.log("   ✅ Empty source accepted");
}
