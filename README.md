# octp

[![npm version](https://img.shields.io/npm/v/octp.svg?logo=npm&style=flat-square)](https://www.npmjs.com/package/octp)
[![npm downloads](https://img.shields.io/npm/dm/octp.svg?style=flat-square)](https://www.npmjs.com/package/octp)
[![license](https://img.shields.io/github/license/itzptk/octp.svg?style=flat-square)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/itzptk/octp/ci.yml?branch=main&label=ci&style=flat-square)](https://github.com/itzptk/octp/actions/workflows/ci.yml)
[![Bun](https://img.shields.io/badge/powered%20by-bun-f9f1e1?style=flat-square&logo=bun)](https://bun.sh)
[![opencode](https://img.shields.io/badge/opencode-plugin-0ea5e9?style=flat-square)](https://opencode.ai)

> **octp** = **o**pencode **c**reate **t**emplate **p**lugin

Scaffold a new [opencode](https://opencode.ai) plugin project with a single command. Generate a clean, typed, test-driven TypeScript plugin boilerplate — ready to develop, test, and publish to npm.

## Quickstart

```bash
npx octp init my-plugin --name opencode-greeter
```

This creates an `opencode-greeter/` directory with a working plugin, installs dependencies, and prints the next steps.

## Usage

```text
octp init [directory] --name <package-name> [options]

Options:
  --name <name>           npm package name for the plugin (required)
  --description <text>    Short description for package.json and README
  --author <name>          Copyright author name for LICENSE
  --force                 Write into a non-empty directory (does not delete existing files)
  --no-install            Skip running bun install after scaffolding
  -h, --help              Show help

Examples:
  octp init my-plugin --name opencode-greeter
  octp init --name @scope/opencode-greeter --author "Jane Doe"
```

## What it creates

```text
opencode-greeter/
  package.json
  tsconfig.json
  .gitignore
  README.md
  LICENSE
  src/
    index.ts        # plugin entry exporting the hook function
    index.test.ts   # initialization + hook test
  .github/workflows/
    ci.yml
    release-please.yml
```

The generated `src/index.ts` exports a typed opencode plugin that:

- logs to `client.app.log` on load,
- subscribes to `session.idle` events,
- and short-circuits when `enabled: false`.

Register the published plugin in `opencode.json`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-greeter"]
}
```

Restart opencode after changing config. See the [opencode plugin docs](https://opencode.ai/docs/plugins/) for the full hook surface.

## Develop this scaffolder

```bash
bun install
bun test
bun run typecheck
```

Scripts:

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `bun test`          | Run the test suite                       |
| `bun run typecheck` | Type-check source without emitting       |

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit with [conventional commits](https://www.conventionalcommits.org/) (`feat: ...`, `fix: ...`, `docs: ...`)
4. Open a pull request against `main`

Make sure `bun test` and `bun run typecheck` pass locally before submitting.

## Releasing

Releases are automated via [release-please](https://github.com/googleapis/release-please). Merge commits to `main` with conventional-commit titles to trigger release PRs. Publishing to npm uses provenance and the `NPM_TOKEN` secret.

## License

[MIT](./LICENSE) © itzptk