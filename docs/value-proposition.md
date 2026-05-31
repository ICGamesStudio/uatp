# Value Proposition

UATP gives teams a stable task contract for AI agent work.

## Business Value

### Repeatability

The same task can be sent to different models, agents, or environments without rewriting the instructions from scratch.

### Auditability

Structured task documents make it easier to answer:

- What was the agent asked to do?
- What files or data were in scope?
- What constraints were applied?
- What counted as success?

### Lower Integration Cost

Instead of hard-coding separate prompt formats for every provider, teams can validate one UATP document and transpile it into provider-specific instructions.

### Safer Automation

Fields like `scope`, `constraints`, and `success_criteria` give runtimes a concrete contract to enforce before an agent acts.

### Benchmarkable Workflows

Structured tasks make model comparisons more reliable because each model receives the same intent, actions, constraints, and output contract.

## Example Use Cases

- Code review agents.
- Debugging assistants.
- Test generation workflows.
- Document summarization pipelines.
- Translation and extraction jobs.
- CI-based AI automation.

## What UATP Does Not Do

UATP does not execute tools, authenticate users, route messages, or manage agent memory. Existing systems can handle those layers. UATP focuses on the portable task definition.
