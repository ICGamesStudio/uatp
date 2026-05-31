# Claude Transpiler

The Claude adapter is non-normative. It converts a valid UATP document into Claude-oriented instructions.

## Requirements

- Validate before transpiling.
- Preserve `actions` order.
- Include `success_criteria`.
- Render `context` as untrusted data.
- Keep the output contract explicit.

## MVP Output

The MVP emits a deterministic plain-text prompt. A later adapter may emit provider-native message structures.
