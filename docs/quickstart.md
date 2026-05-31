# Quickstart

## 1. Create a Task

```yaml
protocol: uatp
version: "0.1"
intent: review_code
scope:
  target: repository
  path: "."
actions:
  - inspect
  - report
success_criteria:
  - Findings are ordered by severity.
  - Each finding includes concrete evidence.
constraints:
  risk: low
  change: none
output:
  format: review_findings
```

## 2. Validate It

JavaScript:

```bash
cd packages/parser-js
npm install
node src/cli.js validate ../../examples/review_code.yaml
```

Python:

```bash
cd packages/parser-python
python -m pip install -e ".[dev]"
python -m uatp.cli validate ../../examples/review_code.yaml
```

## 3. Transpile It

OpenAI-style prompt:

```bash
node packages/parser-js/src/cli.js transpile examples/debug_code.yaml --target openai
```

Claude-style prompt:

```bash
python -m uatp.cli transpile ../../examples/debug_code.yaml --target claude
```

## 4. Integrate It

UATP can be embedded in:

- CLI automation.
- CI workflows.
- Agent task queues.
- IDE extensions.
- Internal AI platforms.
- MCP or A2A payloads.
