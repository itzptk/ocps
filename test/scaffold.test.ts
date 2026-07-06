/// <reference types="bun-types" />

import { expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { scaffold, ScaffoldError } from "../src/scaffold";

const ROOT = join(import.meta.dir, "..");

let tmpRoot: string;
let tmp: string;

beforeEach(() => {
  tmpRoot = mkdtempSync(join(tmpdir(), "scaffold-"));
  tmp = join(tmpRoot, "out");
});

afterEach(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

test("scaffold creates expected files with rendered names", () => {
  const result = scaffold(
    { name: "opencode-greeter", directory: tmp, description: "A greeter" },
    ROOT,
  );
  expect(result.name).toBe("opencode-greeter");
  expect(result.exportName).toBe("OpencodeGreeterPlugin");

  expect(existsSync(join(tmp, "package.json"))).toBe(true);
  expect(existsSync(join(tmp, "src/index.ts"))).toBe(true);
  expect(existsSync(join(tmp, "src/cli.ts"))).toBe(true);
  expect(existsSync(join(tmp, "src/cli.test.ts"))).toBe(true);
  expect(existsSync(join(tmp, "src/index.test.ts"))).toBe(true);
  expect(existsSync(join(tmp, "config.json"))).toBe(true);
  expect(existsSync(join(tmp, "schema.json"))).toBe(true);
  expect(existsSync(join(tmp, "README.md"))).toBe(true);
  expect(existsSync(join(tmp, "tsconfig.json"))).toBe(true);
  expect(existsSync(join(tmp, ".gitignore"))).toBe(true);
  expect(existsSync(join(tmp, "LICENSE"))).toBe(true);
  expect(existsSync(join(tmp, ".github/workflows/ci.yml"))).toBe(true);
  expect(existsSync(join(tmp, ".github/workflows/release-please.yml"))).toBe(true);

  const pkg = JSON.parse(readFileSync(join(tmp, "package.json"), "utf-8"));
  expect(pkg.name).toBe("opencode-greeter");
  expect(pkg.description).toBe("A greeter");
  expect(pkg.bin).toEqual({ "opencode-greeter": "src/cli.ts" });
  expect(pkg.files).toContain("config.json");
  expect(pkg.files).toContain("schema.json");
  expect(pkg.dependencies["jsonc-parser"]).toBeDefined();

  const config = JSON.parse(readFileSync(join(tmp, "config.json"), "utf-8"));
  expect(config.$schema).toBe("https://raw.githubusercontent.com/opencode-greeter/opencode-greeter/main/schema.json");
  const schema = JSON.parse(readFileSync(join(tmp, "schema.json"), "utf-8"));
  expect(schema.title).toBe("opencode-greeter config");
  expect(schema.properties.enabled.type).toBe("boolean");

  const idx = readFileSync(join(tmp, "src/index.ts"), "utf-8");
  expect(idx).toContain("OpencodeGreeterPlugin");
  expect(idx).not.toContain("{{");

  const cli = readFileSync(join(tmp, "src/cli.ts"), "utf-8");
  expect(cli).toContain("#!/usr/bin/env bun");
  expect(cli).toContain('const PLUGIN_NAME = "opencode-greeter"');
  expect(cli).toContain('const PLUGIN_CONFIG_PATH = join(OPENCODE_CONFIG_DIR, "opencode-greeter.json")');
  expect(cli).not.toContain("{{");
});

test("scaffold strips scope in export name", () => {
  const result = scaffold(
    { name: "@acme/opencode-greeter", directory: tmp },
    ROOT,
  );
  expect(result.exportName).toBe("OpencodeGreeterPlugin");
  const idx = readFileSync(join(tmp, "src/index.ts"), "utf-8");
  expect(idx).toContain("OpencodeGreeterPlugin");
  const pkg = JSON.parse(readFileSync(join(tmp, "package.json"), "utf-8"));
  expect(pkg.name).toBe("@acme/opencode-greeter");
  expect(pkg.bin).toEqual({ "opencode-greeter": "src/cli.ts" });
  const config = JSON.parse(readFileSync(join(tmp, "config.json"), "utf-8"));
  expect(config.$schema).toBe("https://raw.githubusercontent.com/acme/opencode-greeter/main/schema.json");
});

test("scaffold rejects invalid names", () => {
  expect(() => scaffold({ name: "UPPER BAD", directory: tmp }, ROOT)).toThrow(ScaffoldError);
});

test("scaffold rejects non-empty directory without --force", () => {
  mkdirSync(tmp, { recursive: true });
  writeFileSync(join(tmp, "existing.txt"), "x");
  expect(() => scaffold({ name: "opencode-foo", directory: tmp }, ROOT)).toThrow(ScaffoldError);
});

test("scaffold overwrites non-empty directory with --force", () => {
  mkdirSync(tmp, { recursive: true });
  writeFileSync(join(tmp, "existing.txt"), "x");
  scaffold({ name: "opencode-foo", directory: tmp, force: true }, ROOT);
  expect(existsSync(join(tmp, "src/index.ts"))).toBe(true);
});

test("scaffold writes year placeholder", () => {
  const fixed = new Date("2030-01-01T00:00:00Z");
  scaffold({ name: "opencode-foo", directory: tmp }, ROOT, fixed);
  const readme = readFileSync(join(tmp, "README.md"), "utf-8");
  expect(readme).toContain("2030");
});

test("scaffold writes author name into LICENSE", () => {
  const fixed = new Date("2030-01-01T00:00:00Z");
  scaffold({ name: "opencode-foo", directory: tmp, authorName: "Jane Doe" }, ROOT, fixed);
  const license = readFileSync(join(tmp, "LICENSE"), "utf-8");
  expect(license).toContain("Jane Doe");
  expect(license).toContain("2030");
});
