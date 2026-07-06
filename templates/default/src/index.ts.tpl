import type { Hooks, Plugin } from "@opencode-ai/plugin";

export type {{exportName}}Options = {
  enabled?: boolean;
};

const DEFAULT_OPTIONS: {{exportName}}Options = {
  enabled: true,
};

export const {{exportName}}: Plugin = async (ctx, rawOptions = {}): Promise<Hooks> => {
  const options: {{exportName}}Options = {
    ...DEFAULT_OPTIONS,
    ...(rawOptions as {{exportName}}Options),
  };

  if (!options.enabled) {
    return { dispose: async () => {} };
  }

  await ctx.client.app.log({
    body: {
      service: "{{name}}",
      level: "info",
      message: "plugin loaded",
    },
  });

  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await ctx.client.app.log({
          body: {
            service: "{{name}}",
            level: "debug",
            message: "session idle",
          },
        });
      }
    },
    dispose: async () => {},
  };
};

export default {{exportName}};