#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { applyEdits, modify, parse, type ParseError } from "jsonc-parser";

const PLUGIN_NAME = "{{name}}";
const OPENCODE_CONFIG_DIR = join(homedir(), ".config", "opencode");
const OPENCODE_CONFIG_PATH = join(OPENCODE_CONFIG_DIR, "opencode.json");

const FORMAT = { insertSpaces: true, tabSize: 2, eol: "\n" };

function parseConfig(text: string): Record<string, unknown> {
  const errors: ParseError[] = [];
  const config = parse(text, errors, { allowTrailingComma: true }) as unknown;
  if (errors.length > 0) {
    throw new Error("Could not parse opencode.json");
  }
  if (typeof config !== "object" || config === null || Array.isArray(config)) {
    throw new Error("opencode.json must contain an object");
  }
  return config as Record<string, unknown>;
}

export function addPlugin(text: string): string {
  const config = parseConfig(text);
  const plugins = config.plugin;
  if (plugins === undefined) {
    return applyEdits(text, modify(text, ["plugin"], [PLUGIN_NAME], { formattingOptions: FORMAT }));
  }
  if (!Array.isArray(plugins)) throw new Error("opencode.json plugin field must be an array");
  if (plugins.some((entry) => entry === PLUGIN_NAME || (Array.isArray(entry) && entry[0] === PLUGIN_NAME))) return text;
  return applyEdits(text, modify(text, ["plugin", plugins.length], PLUGIN_NAME, { formattingOptions: FORMAT, isArrayInsertion: true }));
}

function main(): void {
  if (process.argv[2] !== undefined) throw new Error(`Unknown argument: ${process.argv[2]}`);

  mkdirSync(OPENCODE_CONFIG_DIR, { recursive: true });
  const text = existsSync(OPENCODE_CONFIG_PATH)
    ? readFileSync(OPENCODE_CONFIG_PATH, "utf-8")
    : '{\n  "$schema": "https://opencode.ai/config.json"\n}\n';
  writeFileSync(OPENCODE_CONFIG_PATH, addPlugin(text));
  process.stdout.write(`${PLUGIN_NAME} is configured in ${OPENCODE_CONFIG_PATH}\nRestart OpenCode to load it.\n`);
}

if (import.meta.main) {
  try {
    main();
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    process.exitCode = 1;
  }
}
