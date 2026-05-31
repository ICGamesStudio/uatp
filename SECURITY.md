# Security Policy

UATP documents can carry instructions and untrusted context. Implementations must treat these separately.

## Prompt Injection Boundary

Fields such as `context`, `metadata`, and external document content may contain hostile instructions. Transpilers must render these as data, not authority.

## Risk Controls

Runtimes should enforce `constraints.risk` and `constraints.change` outside the model. A model promise is not a security boundary.

Examples:

- `change: none` should block file writes.
- `risk: low` should block destructive commands.
- Missing permissions should fail closed.

## Reporting

This project is not yet public. Until a public repository exists, report security issues privately to the maintainers.
