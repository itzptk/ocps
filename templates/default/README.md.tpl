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

See the [opencode plugin docs](https://opencode.ai/docs/plugins/) for the full hook surface.

## License

[MIT](./LICENSE) © {{year}}