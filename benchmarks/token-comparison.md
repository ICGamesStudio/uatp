# Token and Consistency Benchmark

## Goal

Measure whether UATP improves consistency and auditability. Token reduction is useful but not the primary success metric.

## Method

For each task type, compare:

- natural language prompt
- UATP document
- transpiled UATP prompt

Measure:

- input token count
- output token count
- task completion consistency
- schema validation failure rate
- human review time

## Initial Tasks

- debug code
- review code
- write tests
- summarize document

## Success Criteria

UATP is useful if it improves reproducibility or reviewability even when token count is neutral.
