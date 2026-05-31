# Benchmarks

UATP is owned and maintained by Smartlabs Medya Teknolojileri AŞ.

Website: https://www.smartlabs.com.tr

UATP should be evaluated by practical gains, not by theory.

## What to Measure

### Consistency

Run the same UATP task across multiple models and compare whether the outputs follow the requested intent, actions, constraints, and output format.

### Review Time

Measure how long humans need to understand what an AI agent was asked to do. Structured tasks should reduce review time compared with long natural-language prompts.

### Error Rate

Track invalid, ambiguous, incomplete, or unsafe tasks before execution. UATP should catch more task-definition errors at validation time.

### Token Use

Compare natural-language prompts, UATP documents, and transpiled UATP prompts. Token reduction is useful, but consistency and auditability matter more.

### Execution Outcomes

For coding workflows, compare:

- Test pass rate.
- Number of unnecessary file changes.
- Severity and frequency of missed issues.
- Output format compliance.

## Baseline Benchmark Tasks

- Debug a failing test.
- Review a pull request.
- Generate missing tests.
- Summarize a technical document.
- Extract structured information from a document.

## Expected Gains

Early UATP adoption should aim for:

- More consistent task interpretation.
- Fewer malformed agent requests.
- Faster human review of agent instructions.
- Easier model-to-model comparisons.
- Cleaner audit logs for automated AI workflows.

## Run the Current Benchmark

The current benchmark proves the first layer of value: UATP tasks are machine-validatable and expose an auditable contract that ordinary natural-language prompts do not.

```bash
cd packages/parser-js
npm install
npm run benchmark
```

The command writes:

```text
benchmarks/results/latest.md
```

This benchmark does not claim model-quality improvement yet. Provider/model execution benchmarks will be added after the task contract is stable.
