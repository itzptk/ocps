/// <reference types="bun-types" />

import { expect, test, mock } from "bun:test";
import { {{exportName}} } from "./index";
import type { PluginInput, Hooks } from "@opencode-ai/plugin";

function makeFakeCtx(): { ctx: PluginInput; logCalls: Array<Record<string, unknown>> } {
  const logCalls: Array<Record<string, unknown>> = [];
  const ctx = {
    client: {
      app: {
        log: mock((opts: unknown) => {
          logCalls.push(opts as Record<string, unknown>);
        }),
      },
      session: {},
      tui: {},
    },
    directory: "/test",
    worktree: "/test",
    project: { id: "proj-1" },
    serverUrl: new URL("http://localhost"),
    $: {} as PluginInput["$"],
    experimental_workspace: {} as PluginInput["experimental_workspace"],
  } as unknown as PluginInput;
  return { ctx, logCalls };
}

test("plugin initializes, logs, and returns hooks", async () => {
  const { ctx, logCalls } = makeFakeCtx();
  const hooks: Hooks = await {{exportName}}(ctx, {});

  expect(hooks.event).toBeDefined();
  expect(hooks.dispose).toBeDefined();
  expect(logCalls.length).toBe(1);
  expect((logCalls[0]!.body as Record<string, unknown>).service).toBe("{{name}}");
});

test("disabled plugin returns no-op hooks without logging", async () => {
  const { ctx, logCalls } = makeFakeCtx();
  const hooks: Hooks = await {{exportName}}(ctx, { enabled: false });

  expect(hooks.event).toBeUndefined();
  expect(logCalls.length).toBe(0);
  await hooks.dispose?.();
});

test("event hook logs session.idle", async () => {
  const { ctx, logCalls } = makeFakeCtx();
  const hooks: Hooks = await {{exportName}}(ctx, {});

  await hooks.event?.({ event: { type: "session.idle", properties: {} } as never });
  for (let i = 0; i < 4; i++) await Promise.resolve();

  const idleLog = logCalls.find(
    (c) => (c.body as Record<string, unknown>).message === "session idle",
  );
  expect(idleLog).toBeDefined();
  await hooks.dispose?.();
});