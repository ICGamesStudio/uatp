# Contributing

UATP is early and intentionally strict. Contributions should improve interoperability, conformance, security, or real-world task execution.

## Development Rules

- Start with the specification before changing implementations.
- Keep the JSON Schema aligned with the spec.
- Add conformance fixtures for every behavior change.
- Do not add a new core intent, action, or output format without a concrete use case.
- Prefer namespaced extensions over expanding the core registry.

## Local Checks

JavaScript:

```bash
cd packages/parser-js
npm install
npm test
```

Python:

```bash
cd packages/parser-python
python -m pip install -e ".[dev]"
python -m pytest
```

CLI:

```bash
uatp validate examples/debug_code.yaml
uatp transpile examples/debug_code.yaml --target claude
```

## Standardization Bar

A proposal should answer:

- What real workflow does this unlock?
- Can it be validated?
- Can it be tested with fixtures?
- Does it overlap with MCP, A2A, provider APIs, or workflow engines?
- What breaks if another runtime ignores this field?
