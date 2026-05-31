# OpenAI Transpiler

The OpenAI adapter is non-normative. It converts a valid UATP document into provider instructions.

## Requirements

- Validate before transpiling.
- Preserve `actions` order.
- Include `success_criteria`.
- Render `context` as untrusted data.
- Do not invent missing paths, files, test results, or external facts.

## MVP Output

The MVP emits a deterministic plain-text prompt. A later adapter may emit structured message arrays.
