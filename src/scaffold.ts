import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  derivePluginExportName,
  parseName,
  type ParsedName,
} from "./name";
import { defaultTemplateDir, listTemplateFiles, render, type TemplateVars } from "./template-files";

export type ScaffoldOptions = {
  name: string;
  directory?: string;
  description?: string;
  authorName?: string;
  force?: boolean;
};

export type ScaffoldResult = {
  directory: string;
  written: string[];
  name: string;
  exportName: string;
};

export class ScaffoldError extends Error {}

const IGNORED_EXISTING = new Set([".git", ".DS_Store"]);

function dirIsEmptyOrVcsOnly(dir: string): boolean {
  if (!existsSync(dir)) return true;
  const entries = readdirSync(dir).filter((e) => !IGNORED_EXISTING.has(e));
  return entries.length === 0;
}

export function resolveDirectory(opts: ScaffoldOptions, parsed: ParsedName): string {
  if (opts.directory && opts.directory.trim().length > 0) {
    return resolve(opts.directory);
  }
  return resolve(parsed.local);
}

export function scaffold(
  opts: ScaffoldOptions,
  templateRootDir: string,
  now: Date = new Date(),
): ScaffoldResult {
  const parsed = parseName(opts.name);
  if (!parsed) {
    throw new ScaffoldError(`Invalid package name: "${opts.name}". Use a valid npm name like "opencode-foo" or "@scope/opencode-foo".`);
  }

  const directory = resolveDirectory(opts, parsed);
  if (existsSync(directory) && statSync(directory).isFile()) {
    throw new ScaffoldError(`Target path exists and is a file: ${directory}`);
  }
  if (existsSync(directory) && !statSync(directory).isDirectory()) {
    throw new ScaffoldError(`Target path is not a directory: ${directory}`);
  }
  if (!opts.force && existsSync(directory) && !dirIsEmptyOrVcsOnly(directory)) {
    throw new ScaffoldError(
      `Target directory is not empty: ${directory}. Pass --force to overwrite, or choose an empty directory.`,
    );
  }

  const exportName = derivePluginExportName(opts.name);
  const description = (opts.description ?? "An opencode plugin").trim();
  const year = String(now.getFullYear());

  const vars: TemplateVars = {
    name: parsed.raw,
    binName: parsed.local,
    schemaUrl: `https://raw.githubusercontent.com/${parsed.scope ?? parsed.local}/${parsed.local}/main/schema.json`,
    exportName,
    description,
    year,
    authorName: opts.authorName ?? parsed.local,
  };

  const templateDir = defaultTemplateDir(templateRootDir);
  if (!existsSync(templateDir)) {
    throw new ScaffoldError(`Template directory not found: ${templateDir}`);
  }

  const files = listTemplateFiles(templateDir);
  const written: string[] = [];

  for (const file of files) {
    const target = join(directory, file.relative);
    mkdirSync(dirname(target), { recursive: true });
    const body = render(file.content, vars);
    writeFileSync(target, body);
    written.push(file.relative);
  }

  return { directory, written, name: parsed.raw, exportName };
}
