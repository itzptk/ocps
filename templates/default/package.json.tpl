{
  "name": "{{name}}",
  "version": "0.1.0",
  "description": "{{description}}",
  "type": "module",
  "main": "src/index.ts",
  "exports": "./src/index.ts",
  "bin": {
    "{{binName}}": "src/cli.ts"
  },
  "files": [
    "config.json",
    "schema.json",
    "src",
    "README.md"
  ],
  "scripts": {
    "test": "bun test",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "jsonc-parser": "^3.3.1"
  },
  "peerDependencies": {
    "@opencode-ai/plugin": "*"
  },
  "devDependencies": {
    "@opencode-ai/plugin": "latest",
    "@types/node": "latest",
    "bun-types": "^1.3.14",
    "typescript": "latest"
  },
  "keywords": [
    "opencode",
    "plugin"
  ],
  "license": "MIT",
  "homepage": "https://opencode.ai/docs/plugins/",
  "repository": {
    "type": "git",
    "url": ""
  }
}
