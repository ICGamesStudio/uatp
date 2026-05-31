# MCP Companion

The UATP MCP Companion is the first integration layer for making UATP easy to use from coding agents and desktop AI tools.

It avoids fragile desktop UI automation. Instead, it exposes UATP through:

- MCP tools
- a companion CLI
- prompt translation
- task-library search
- anonymous contribution-envelope generation

## Why MCP First

MCP is a better first integration point than directly typing into another application's textbox.

Direct UI automation is fragile, app-specific, and harder to trust. MCP and CLI integration are portable, inspectable, and easier for enterprise teams to adopt.

## Install

```bash
cd packages/mcp-server
npm install
```

## Companion CLI

Translate a user prompt:

```bash
npm run smoke
node src/companion.js translate --prompt "Review this pull request and list security risks with evidence"
```

Translate a non-English prompt through an optional local LLM normalizer:

```bash
node src/companion.js translate \
  --prompt "Bu kodu incele ve test eksiklerini bul" \
  --provider local-llm \
  --endpoint http://localhost:11434/api/generate \
  --model llama3.1
```

Search the task library:

```bash
node src/companion.js search --query "debug failing tests"
```

## MCP Server

Run over stdio:

```bash
node src/server.js
```

Available tools:

- `translate_prompt`
- `search_tasks`
- `create_contribution`

`translate_prompt` accepts `translator_provider`, `translator_endpoint`, and `translator_model` for runtimes that want local model normalization before task matching.

## Next Steps

- Add published package instructions.
- Add Claude Desktop configuration example.
- Add Cursor/IDE integration notes where supported.
- Add clipboard mode after the MCP and CLI flows are stable.
