/// <reference types="bun-types" />

import { expect, test } from "bun:test";
import { addPlugin } from "./cli";

test("addPlugin adds missing plugin field", () => {
  expect(addPlugin('{\n  "$schema": "https://opencode.ai/config.json"\n}\n')).toContain(`"plugin": [
    "{{name}}"
  ]`);
});

test("addPlugin preserves JSONC comments when appending", () => {
  const updated = addPlugin(`{
  // keep me
  "plugin": [
    "existing-plugin",
  ]
}
`);
  expect(updated).toContain("// keep me");
  expect(updated).toContain('"existing-plugin"');
  expect(updated).toContain('"{{name}}"');
});

test("addPlugin is idempotent for tuple plugin entries", () => {
  const config = '{\n  "plugin": [["{{name}}", { "enabled": true }]]\n}\n';
  expect(addPlugin(config)).toBe(config);
});
