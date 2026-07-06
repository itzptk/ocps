#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { scaffold, ScaffoldError, type ScaffoldOptions } from "./scaffold";

const SCRIPT_DIR = typeof __dirname !== "undefined"
  ? __dirname
  : dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(SCRIPT_DIR, "..");

type ParsedArgs = {
  command: string | null;
  directory?: string;
  name?: string;
  description?: string;
  author?: string;
  force: boolean;
  noInstall: boolean;
  help: boolean;
};

function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = {
    command: null,
    force: false,
    noInstall: false,
    help: false,
  };
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "-h" || arg === "--help") {
      out.help = true;
    } else if (arg === "--force") {
      out.force = true;
    } else if (arg === "--no-install") {
      out.noInstall = true;
    } else if (arg === "--name") {
      out.name = argv[++i];
    } else if (arg.startsWith("--name=")) {
      out.name = arg.slice("--name=".length);
    } else if (arg === "--description") {
      out.description = argv[++i];
    } else if (arg.startsWith("--description=")) {
      out.description = arg.slice("--description=".length);
    } else if (arg === "--author") {
      out.author = argv[++i];
    } else if (arg.startsWith("--author=")) {
      out.author = arg.slice("--author=".length);
    } else if (arg.startsWith("--")) {
      throw new CliError(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }
  if (positional.length > 0) out.command = positional[0]!;
  if (positional.length > 1) out.directory = positional[1];
  return out;
}

class CliError extends Error {}

function printHelp(): void {
  const lines = [
    "octp - scaffold a new opencode plugin",
    "",
    "Usage:",
    "  octp init [directory] --name <package-name> [options]",
    "",
    "Options:",
    "  --name <name>           npm package name for the plugin (required)",
    "  --description <text>    Short description for package.json and README",
    "  --author <name>          Copyright author name for LICENSE",
    "  --force                 Write into a non-empty directory (does not delete existing files)",
    "  --no-install            Skip running bun install after scaffolding",
    "  -h, --help              Show this help",
    "",
    "Examples:",
    "  octp init my-plugin --name opencode-greeter",
    "  octp init --name @scope/opencode-greeter",
  ];
  process.stdout.write(lines.join("\n") + "\n");
}

function detectBun(): string | null {
  const r = spawnSync("bun", ["--version"], { stdio: "ignore" });
  return r.status === 0 ? "bun" : null;
}

function runInstall(directory: string, noInstall: boolean): void {
  if (noInstall) {
    printNext(directory, false);
    return;
  }
  const bun = detectBun();
  if (!bun) {
    process.stdout.write("\nBun was not detected. Next step:\n  cd " + directory + " && bun install\n");
    return;
  }
  process.stdout.write("\nRunning bun install...\n");
  const r = spawnSync(bun, ["install"], { cwd: directory, stdio: "inherit" });
  if (r.status !== 0) {
    process.stdout.write("\nbun install exited with code " + String(r.status) + ". You can retry manually.\n");
    return;
  }
  printNext(directory, true);
}

function printNext(directory: string, installed: boolean): void {
  const cd = directory === process.cwd() ? "" : `cd ${directory}\n`;
  const installLine = installed ? "" : "bun install\n";
  process.stdout.write(
    [
      "",
      "Done. Next steps:",
      cd ? "  " + cd.replace(/\n$/, "") : null,
      "  " + installLine.replace(/\n$/, ""),
      "  bun test",
      "  bun run typecheck",
      "",
      "Then register the plugin in your opencode.json:",
      '  { "$schema": "https://opencode.ai/config.json", "plugin": ["<name>"] }',
      "",
    ]
      .filter((l) => l !== null && l !== "" || l === "")
      .join("\n") + "\n",
  );
}

function runInit(args: ParsedArgs): void {
  if (!args.name) {
    throw new CliError("Missing required option: --name <package-name>");
  }
  const opts: ScaffoldOptions = {
    name: args.name,
    directory: args.directory,
    description: args.description,
    authorName: args.author,
    force: args.force,
  };
  const result = scaffold(opts, PACKAGE_ROOT);
  process.stdout.write(
    `Created ${result.written.length} files in ${result.directory}\n` +
    `  package:  ${result.name}\n` +
    `  export:   ${result.exportName}\n`,
  );
  runInstall(result.directory, args.noInstall);
}

function main(): void {
  let args: ParsedArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    if (err instanceof CliError) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  if (args.help || args.command === null) {
    printHelp();
    return;
  }

  if (args.command !== "init") {
    process.stderr.write(`Unknown command: ${args.command}\n`);
    process.stderr.write("Run with --help for usage.\n");
    process.exitCode = 2;
    return;
  }

  try {
    runInit(args);
  } catch (err) {
    if (err instanceof ScaffoldError || err instanceof CliError) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();