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

The CLI also copies `config.json` to `~/.config/opencode/{{binName}}.json` if it does not already exist.

`config.json` points at the generated `schema.json` with a raw GitHub URL. Scoped packages use the scope as the GitHub owner; unscoped packages assume the owner matches the package name.

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
- `config.json` is the default plugin config copied by the setup CLI.
- `schema.json` describes the plugin config shape and is referenced from `config.json` by raw GitHub URL.

See the [opencode plugin docs](https://opencode.ai/docs/plugins/) for the full hook surface.

## License

[MIT](./LICENSE) © {{year}}
