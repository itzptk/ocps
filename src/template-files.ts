import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export type TemplateVars = {
  name: string;
  exportName: string;
  description: string;
  year: string;
  repository?: string;
  authorName?: string;
};

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function render(content: string, vars: TemplateVars): string {
  return content.replace(PLACEHOLDER_RE, (match, key: string) => {
    if (key === "name") return vars.name;
    if (key === "exportName") return vars.exportName;
    if (key === "description") return vars.description;
    if (key === "year") return vars.year;
    if (key === "repository") return vars.repository ?? "";
    if (key === "authorName") return vars.authorName ?? "";
    return match;
  });
}

export type TemplateFile = {
  relative: string;
  content: string;
};

export function listTemplateFiles(templateDir: string): TemplateFile[] {
  const results: TemplateFile[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      const rel = relative(templateDir, full).split(sep).join("/");
      const content = readFileSync(full, "utf-8");
      const stripped = rel.endsWith(".tpl") ? rel.slice(0, -".tpl".length) : rel;
      const target = stripped === "gitignore" ? ".gitignore" : stripped;
      results.push({ relative: target, content });
    }
  };
  walk(templateDir);
  return results.sort((a, b) => a.relative.localeCompare(b.relative));
}

export function defaultTemplateDir(rootDir: string): string {
  return join(rootDir, "templates", "default");
}