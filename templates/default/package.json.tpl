{
  "name": "{{name}}",
  "version": "0.1.0",
  "description": "{{description}}",
  "type": "module",
  "main": "src/index.ts",
  "exports": "./src/index.ts",
  "files": [
    "src",
    "README.md"
  ],
  "scripts": {
    "test": "bun test",
    "typecheck": "tsc -p tsconfig.json --noEmit"
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