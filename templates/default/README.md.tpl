# {{name}}

{{description}}

## Install

Add the plugin to your OpenCode config:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["{{name}}"]
}
```

Restart OpenCode after changing config.

Or run the setup CLI:

```bash
bunx {{name}}
```

## Configure with options

You can also pass options inline:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    ["{{name}}", { "enabled": true }]
  ]
}
```

## Development

```bash
bun install
bun test
bun run typecheck
```

## Plugin structure

- `src/index.ts` exports the plugin function. Edit the hooks here.
- `src/index.test.ts` verifies the plugin initializes and returns hooks.
- `src/cli.ts` installs the plugin in `~/.config/opencode/opencode.json`.
- `src/cli.test.ts` verifies the setup CLI preserves JSONC config.

See the [opencode plugin docs](https://opencode.ai/docs/plugins/) for the full hook surface.

## License

[MIT](./LICENSE) © {{year}}
