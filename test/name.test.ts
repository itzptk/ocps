/// <reference types="bun-types" />

import { expect, test } from "bun:test";
import {
  parseName,
  isValidName,
  toPascalCase,
  deriveExportName,
  derivePluginExportName,
  sanitizePathSegment,
} from "../src/name";

test("parseName accepts simple lowercase names", () => {
  expect(parseName("opencode-foo")!.local).toBe("opencode-foo");
  expect(parseName("opencode-foo")!.scope).toBeNull();
});

test("parseName accepts scoped names", () => {
  const p = parseName("@scope/opencode-foo");
  expect(p!.scope).toBe("scope");
  expect(p!.local).toBe("opencode-foo");
  expect(p!.raw).toBe("@scope/opencode-foo");
});

test("parseName rejects invalid names", () => {
  expect(parseName("")).toBeNull();
  expect(parseName("UPPER")).toBeNull();
  expect(parseName("   ")).toBeNull();
  expect(parseName("node_modules")).toBeNull();
  expect(parseName("favicon.ico")).toBeNull();
  expect(parseName("@UPPER/foo")).toBeNull();
  expect(parseName("@scope/")).toBeNull();
  expect(parseName("foo bar")).toBeNull();
});

test("isValidName wraps parseName", () => {
  expect(isValidName("opencode-foo")).toBe(true);
  expect(isValidName("@scope/opencode-foo")).toBe(true);
  expect(isValidName("Bad Name")).toBe(false);
});

test("toPascalCase basic", () => {
  expect(toPascalCase("opencode-foo")).toBe("OpencodeFoo");
  expect(toPascalCase("foo_bar.baz")).toBe("FooBarBaz");
  expect(toPascalCase("@scope/foo")).toBe("ScopeFoo");
  expect(toPascalCase("")).toBe("Plugin");
});

test("toPascalCase avoids reserved words", () => {
  expect(toPascalCase("class")).toBe("ClassPlugin");
});

test("toPascalCase handles leading digits", () => {
  expect(toPascalCase("123foo")).toBe("Plugin123foo");
});

test("deriveExportName uses scoped form by default", () => {
  expect(deriveExportName("@scope/opencode-foo")).toBe("ScopeOpencodeFooPlugin");
  expect(deriveExportName("opencode-foo")).toBe("OpencodeFooPlugin");
});

test("deriveExportName strips scope when asked", () => {
  expect(deriveExportName("@scope/opencode-foo", { stripScope: true })).toBe("OpencodeFooPlugin");
});

test("derivePluginExportName always strips scope", () => {
  expect(derivePluginExportName("@scope/opencode-foo")).toBe("OpencodeFooPlugin");
  expect(derivePluginExportName("opencode-foo")).toBe("OpencodeFooPlugin");
});

test("sanitizePathSegment mirrors name as directory", () => {
  expect(sanitizePathSegment("opencode-foo")).toBe("opencode-foo");
  expect(sanitizePathSegment("@scope/opencode-foo")).toBe("scope/opencode-foo");
});