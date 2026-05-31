# UATP 0.1 Specification

## Status

Draft.

## Purpose

Universal Agent Task Protocol (UATP) describes AI tasks as structured, portable documents. A UATP document should be readable by humans and consistently interpretable by different AI systems.

UATP 0.1 is a task intent envelope. It is not a runtime transport, tool protocol, agent discovery protocol, authentication protocol, memory format, or workflow engine.

## Document Format

UATP documents may be encoded as YAML or JSON. The semantic structure is identical in both formats.

## Required Fields

| Field | Type | Description |
| --- | --- | --- |
| `protocol` | string | Must be `uatp`. |
| `version` | string | Protocol version. This specification defines `0.1`. |
| `intent` | string | Normalized task intent. |
| `scope` | object | Target and optional boundaries for the task. |
| `actions` | string[] | Ordered capabilities requested from the agent. |
| `success_criteria` | string[] | Observable conditions for completion. |
| `output` | object | Expected response shape. |

## Optional Fields

| Field | Type | Description |
| --- | --- | --- |
| `constraints` | object | Risk, change, privacy, runtime, and style limits. |
| `context` | object | Extra task facts, references, or user-provided data. |
| `metadata` | object | Authoring, trace, or tool metadata. |

## Intents

The `0.1` intent registry is intentionally small:

- `debug_code`
- `review_code`
- `write_tests`
- `refactor_code`
- `summarize`
- `translate`
- `extract_information`
- `create_plan`

Implementations MUST reject intents outside this registry unless extension mode is explicitly enabled.

Custom intents MUST be namespaced as `vendor-or-domain/intent_name`, for example `example.com/generate_asset`.

## Scope

`scope.target` is required and identifies the task target. Common values:

- `repository`
- `file`
- `directory`
- `text`
- `conversation`
- `document`

Optional scope fields:

- `path`: file or directory path
- `include`: glob or logical inclusions
- `exclude`: glob or logical exclusions
- `boundaries`: free-form limits

## Actions

Actions are ordered. The `0.1` action registry is:

- `inspect`
- `run_tests`
- `patch`
- `summarize`
- `validate`
- `plan`
- `translate`
- `extract`
- `report`

Implementations MUST reject actions outside this registry unless extension mode is explicitly enabled.

Custom actions MUST be namespaced as `vendor-or-domain/action_name`.

## Constraints

Known constraint fields:

- `risk`: `low`, `medium`, or `high`
- `change`: `none`, `minimal`, `moderate`, or `broad`
- `language`: BCP-47 style language tag or short language name
- `style`: response style guidance
- `privacy`: privacy requirements
- `max_tokens`: approximate response budget

## Output

`output.format` is required. Common values:

- `diff_summary`
- `review_findings`
- `test_report`
- `plain_text`
- `markdown`
- `json`
- `plan`

Implementations MUST reject output formats outside this registry unless extension mode is explicitly enabled.

Optional output fields:

- `language`
- `sections`
- `include_sources`

## Processing Rules

1. Reject documents where `protocol` is not `uatp`.
2. Reject unsupported `version` values unless the implementation explicitly enables compatibility mode.
3. Preserve action order when transpiling.
4. Treat `constraints` as higher priority than `context`.
5. Do not invent missing paths, files, or external facts during transpilation.
6. Treat `success_criteria` as the acceptance contract for task completion.
7. Unknown top-level fields MUST be rejected.
8. Extension keys MUST use a namespace prefix and MUST NOT redefine core field meanings.

## Compatibility

The `0.1` schema is strict for top-level fields and permissive inside `context` and `metadata`.

## Example

```yaml
protocol: uatp
version: "0.1"
intent: debug_code
scope:
  target: repository
  path: "."
actions:
  - inspect
  - run_tests
  - patch
success_criteria:
  - Failing tests are reproduced or the failure is explicitly documented.
  - The smallest practical fix is applied.
  - Relevant tests pass after the change.
constraints:
  risk: low
  change: minimal
output:
  format: diff_summary
```
