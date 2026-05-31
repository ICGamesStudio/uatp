# Universal Agent Task Protocol (UATP)

Owned and maintained by Smartlabs Medya Teknolojileri AŞ.

Website: https://www.smartlabs.com.tr

UATP is a compact, model-agnostic task format for describing AI agent work in a way that can be validated, logged, shared, and translated across different AI systems.

Instead of sending the same vague prompt again and again, teams can define a task once as structured data:

```yaml
protocol: uatp
version: "0.1"
intent: debug_code
scope:
  target: repository
actions:
  - inspect
  - run_tests
  - patch
success_criteria:
  - Failing behavior is reproduced or documented.
  - Minimal code change is applied.
  - Relevant validation result is reported.
constraints:
  risk: low
  change: minimal
output:
  format: diff_summary
```

## Why UATP?

AI teams increasingly use multiple models, agents, IDEs, CI assistants, and automation tools. The hard part is not only calling a model; it is making sure the same task is understood consistently.

UATP helps teams:

- Reduce ambiguity in repeated AI tasks.
- Validate agent instructions before execution.
- Log and audit what an agent was asked to do.
- Translate the same task into provider-specific prompts.
- Compare model behavior using the same task input.
- Build benchmark suites around stable task definitions.

UATP is not a replacement for MCP, A2A, provider APIs, workflow engines, or prompt libraries. It is the task description layer that can fit inside those systems.

## Who Is It For?

- Companies building internal AI automation.
- Developer-tool teams building coding agents.
- AI platform teams that need audit trails and repeatable tasks.
- Researchers comparing model behavior across task types.
- Open-source projects that want model-agnostic agent instructions.

## What Is Included?

- UATP `0.1` specification.
- JSON Schema validation.
- JavaScript parser, validator, CLI, and prompt transpilers.
- Python parser, validator, CLI, and prompt transpilers.
- Valid and invalid conformance fixtures.
- Example task library.
- Benchmark methodology.
- Generated library of 1,000 valid UATP task definitions.

## Quickstart

Validate a task with JavaScript:

```bash
cd packages/parser-js
npm install
npm test
node src/cli.js validate ../../examples/debug_code.yaml
node src/cli.js transpile ../../examples/debug_code.yaml --target openai
```

Validate a task with Python:

```bash
cd packages/parser-python
python -m pip install -e ".[dev]"
python -m pytest
python -m uatp.cli validate ../../examples/debug_code.yaml
python -m uatp.cli transpile ../../examples/debug_code.yaml --target claude
```

## Documentation

- [Value proposition](docs/value-proposition.md)
- [Quickstart](docs/quickstart.md)
- [Task library](docs/task-library.md)
- [Data sources](docs/data-sources.md)
- [Learning loop](docs/learning-loop.md)
- [Prompt translation](docs/prompt-translation.md)
- [Benchmarks](docs/benchmarks.md)
- [Specification](spec/uatp-0.1.md)
- [Roadmap](docs/roadmap.md)

## License

MIT.

Copyright (c) 2026 Smartlabs Medya Teknolojileri AŞ.
