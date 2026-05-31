# Data Sources

UATP task growth should be grounded in real user requests, public benchmarks, public documentation, and ethically collected submissions.

This repository is owned and maintained by Smartlabs Medya Teknolojileri AŞ.

Website: https://www.smartlabs.com.tr

## Source Policy

Use:

- Public benchmark task descriptions.
- Open-source issue and pull-request patterns.
- Official product documentation about prompt/task design.
- Public forum posts where reuse is permitted by the platform terms.
- Voluntary user submissions collected through explicit consent forms.
- Anonymous non-personal task-pattern contributions from compatible runtimes.
- Synthetic variations derived from documented task patterns.

Do not use:

- Private user prompts from commercial AI systems.
- Proprietary training data from Cursor, Bolt, GitHub, or similar tools.
- Scraped content where terms prohibit reuse.
- Personal data, secrets, credentials, customer records, or private code.
- Exact copyrighted prompt collections without permission.

## Initial Public Sources to Study

These sources are useful for task taxonomy and benchmark design:

- SWE-bench and related software engineering benchmarks.
- THUDM AgentBench for multi-environment agent task design.
- GitHub Copilot prompt engineering documentation.
- Aider benchmark documentation.
- Public issue and pull-request workflows from open-source repositories.
- Public support/forum posts from coding-tool users, when platform terms allow research use.

## Conversion Pipeline

1. Capture the source request pattern.
2. Remove personal data and proprietary details.
3. Classify the domain, intent, actions, risk, and expected output.
4. Convert the request into a UATP task.
5. Add success criteria and validation expectations.
6. Generate a semantic signature.
7. Reject duplicates before writing the task.
8. Validate against the JSON Schema and task-library uniqueness checks.

## Duplicate Control

Every generated task includes:

- `metadata.id`
- `metadata.semantic_signature`
- `metadata.content_hash`

The semantic signature intentionally ignores volatile file identity and focuses on the task meaning. CI fails if two task files share the same semantic signature.

## Scaling Plan

The task library should grow in layers:

- 1,000 generated baseline tasks.
- 2,500 public benchmark-inspired tasks.
- 5,000 public issue/forum-inspired task patterns.
- 10,000 anonymous runtime-contributed task patterns.
- 100,000+ indexed task patterns once contribution envelopes and duplicate controls are stable.

Growth should be quality-gated. A larger task library is only valuable if it remains deduplicated, valid, traceable, and useful for benchmark design.

See also:

- [Learning loop](learning-loop.md)
- [Prompt translation](prompt-translation.md)
