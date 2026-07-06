/**
 * npm package name validation and TypeScript export name derivation.
 */

const NAME_RE = /^(?:@([a-z0-9][a-z0-9._-]*)\/)?([a-z0-9][a-z0-9._-]*)$/;

export type ParsedName = {
  raw: string;
  scope: string | null;
  local: string;
};

export function parseName(raw: string): ParsedName | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > 214) return null;
  const match = NAME_RE.exec(trimmed);
  if (!match) return null;
  const scope = match[1] ?? null;
  const local = match[2]!;
  if (scope !== null && scope.length > 214) return null;
  if (local.length > 214) return null;
  if (trimmed.toLowerCase() === "node_modules" || trimmed.toLowerCase() === "favicon.ico") return null;
  return { raw: trimmed, scope, local };
}

export function isValidName(raw: string): boolean {
  return parseName(raw) !== null;
}

const RESERVED_WORDS = new Set([
  "abstract", "await", "boolean", "break", "byte", "case", "catch", "char",
  "class", "const", "continue", "debugger", "default", "delete", "do", "double",
  "else", "enum", "export", "extends", "false", "final", "finally", "float",
  "for", "function", "goto", "if", "implements", "import", "in", "instanceof",
  "int", "interface", "let", "long", "native", "new", "null", "package", "private",
  "protected", "public", "return", "short", "static", "super", "switch",
  "synchronized", "this", "throw", "throws", "transient", "true", "try",
  "typeof", "var", "void", "volatile", "while", "with", "yield",
]);

export function toPascalCase(input: string): string {
  const cleaned = input.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  if (cleaned.length === 0) return "Plugin";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const pascal = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  if (RESERVED_WORDS.has(pascal.toLowerCase())) return `${pascal}Plugin`;
  if (/^[0-9]/.test(pascal)) return `Plugin${pascal}`;
  return pascal;
}

export function deriveExportName(raw: string, opts: { stripScope?: boolean } = {}): string {
  const parsed = parseName(raw);
  if (!parsed) return "MyPlugin";
  const source = opts.stripScope ? parsed.local : (parsed.scope ? `${parsed.scope}-${parsed.local}` : parsed.local);
  return `${toPascalCase(source)}Plugin`;
}

export function derivePluginExportName(raw: string): string {
  const parsed = parseName(raw);
  if (!parsed) return "MyPlugin";
  return `${toPascalCase(parsed.local)}Plugin`;
}

export function sanitizePathSegment(raw: string): string {
  const parsed = parseName(raw);
  if (!parsed) return "opencode-plugin";
  return parsed.scope ? `${parsed.scope}/${parsed.local}` : parsed.local;
}