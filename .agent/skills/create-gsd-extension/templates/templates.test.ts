// GSD-2 — Extension template import path validation
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillRoot = join(__dirname, "..");

function walk(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			out.push(...walk(full));
		} else {
			out.push(full);
		}
	}
	return out;
}

describe("extension templates use @gsd/* imports", () => {
	const templates = ["extension-skeleton.ts", "stateful-tool-skeleton.ts"];

	for (const template of templates) {
		it(`${template} uses @gsd/pi-coding-agent (not @mariozechner)`, () => {
			const content = readFileSync(join(__dirname, template), "utf-8");
			assert.ok(content.includes("@gsd/pi-coding-agent"), `Expected @gsd/pi-coding-agent import in ${template}`);
			assert.ok(!content.includes("@mariozechner/"), `Found stale @mariozechner/ import in ${template}`);
		});
	}

	it("extension-skeleton.ts uses @gsd/pi-ai for StringEnum", () => {
		const content = readFileSync(join(__dirname, "extension-skeleton.ts"), "utf-8");
		assert.ok(content.includes("@gsd/pi-ai"), "Expected @gsd/pi-ai import");
	});

	it("stateful-tool-skeleton.ts uses @gsd/pi-tui", () => {
		const content = readFileSync(join(__dirname, "stateful-tool-skeleton.ts"), "utf-8");
		assert.ok(content.includes("@gsd/pi-tui"), "Expected @gsd/pi-tui import");
	});

	it("no @mariozechner/ references anywhere in create-gsd-extension/", () => {
		const offenders: string[] = [];
		for (const file of walk(skillRoot)) {
			if (file.endsWith("templates.test.ts")) continue;
			const content = readFileSync(file, "utf-8");
			if (content.includes("@mariozechner/")) {
				offenders.push(relative(skillRoot, file));
			}
		}
		assert.deepEqual(offenders, [], `Stale @mariozechner/ references found in: ${offenders.join(", ")}`);
	});
});
