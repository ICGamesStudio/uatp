# UATP Benchmark Report

This report measures the first practical value layer of UATP: machine-validatable task contracts.

Token counts are approximate and use `ceil(characters / 4)`. They are useful for trend comparison, not billing.

| Case | Valid UATP | Natural tokens | UATP tokens | OpenAI transpiled | Claude transpiled | Contract fields | Success criteria | Constraint fields |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Debug failing repository tests | yes | 21 | 102 | 130 | 133 | 7 | 3 | 2 |
| Review code changes | yes | 13 | 109 | 137 | 140 | 7 | 3 | 2 |
| Summarize a document | yes | 14 | 91 | 120 | 123 | 7 | 3 | 2 |
| Translate text | yes | 8 | 79 | 109 | 112 | 7 | 3 | 1 |
| **Total** | - | 56 | 381 | 496 | 508 | 28 | 12 | 7 |

## Interpretation

- Natural-language prompts are shorter in these baseline cases, but they are not schema-validatable.
- UATP adds explicit scope, ordered actions, success criteria, constraints, and output contracts.
- The measurable near-term gain is auditability and consistency, not guaranteed token reduction.
- Model-quality benchmarks should be layered on top of these fixed task contracts.
