# UATP Learning Loop

UATP must grow from real task patterns, not from arbitrary YAML generation.

The goal is to make UATP a living task protocol: every compatible runtime can translate user requests into UATP, execute them through agents or models, and contribute anonymized task patterns back into the shared library.

This repository is owned and maintained by Smartlabs Medya Teknolojileri AŞ.

Website: https://www.smartlabs.com.tr

## Core Principle

UATP should learn from use without collecting private user content.

The shared library should receive reusable task patterns, not raw prompts, private code, customer records, credentials, or personal data.

## Contribution Modes

### Mode 1: Local Only

The runtime translates prompts into UATP locally and never sends contribution data.

Use when:

- Enterprise policy blocks telemetry.
- The environment contains regulated data.
- The user disables contribution.

### Mode 2: Anonymous Pattern Contribution

The runtime contributes only an anonymized task pattern:

- intent
- domain
- scenario
- action sequence
- constraint class
- output contract
- success criteria class
- semantic signature
- optional aggregate quality signal

The original prompt and source content are not sent.

This is the recommended default community-learning mode. It can be shown as enabled during setup with clear text and an easy opt-out, provided no personal data or raw content leaves the device.

### Mode 3: Explicit Dataset Donation

The user or organization intentionally donates prompt examples or task traces for research.

This mode must be off by default and requires explicit affirmative consent because it may include personal data or proprietary information before review.

## Setup Text

Recommended setup copy:

```text
Help improve the Universal Agent Task Protocol by sharing anonymous task patterns.
Raw prompts, files, source code, secrets, and personal data are not sent.
You can turn this off now or later.
```

Recommended setting:

```yaml
community_learning:
  anonymous_patterns: true
  raw_prompt_donation: false
```

## Learning Pipeline

```text
user request
  -> local translator LLM
  -> UATP candidate
  -> schema validation
  -> local anonymizer
  -> semantic signature
  -> duplicate check
  -> contribution envelope
  -> public task-library review queue
```

## Contribution Envelope

```yaml
protocol: uatp-contribution
version: "0.1"
contribution_type: anonymous_task_pattern
source_runtime: "example-runtime"
uatp_version: "0.1"
task_pattern:
  intent: debug_code
  domain: software-engineering
  scenario: production-incident-response
  actions:
    - inspect
    - run_tests
    - patch
  constraints:
    risk: low
    change: minimal
  output:
    format: diff_summary
semantic_signature: "sha256..."
privacy:
  raw_prompt_included: false
  source_content_included: false
  personal_data_included: false
```

## Current CLI Prototype

Create an anonymous contribution envelope from a validated UATP task:

```bash
node tools/create-contribution.js task-library/software-engineering/software-engineering-001.yaml
```

The envelope contains task pattern metadata and privacy flags. It does not include raw prompts, file contents, source code, or user data.

## Runtime Requirements

A contributing runtime should:

- Translate requests to UATP locally where possible.
- Validate every task before execution.
- Strip raw prompt text before contribution.
- Detect and remove secrets, URLs with tokens, emails, phone numbers, names, file paths, and proprietary identifiers.
- Generate a semantic signature.
- Keep a local audit log of what was contributed.
- Provide a visible setting to disable anonymous contribution.
- Never block protocol usage if contribution is disabled.

## Why This Still Grows Fast

The growth mechanism is not raw data extraction. It is networked pattern learning.

If many runtimes contribute anonymous patterns, UATP gets:

- better domain coverage
- better intent coverage
- better benchmark coverage
- better real-world task distributions
- stronger duplicate detection
- better prompt-to-task translation training data

This makes the protocol more useful without making adoption legally or commercially risky.

## Compliance Notes

If any personal data is processed or transmitted, consent must be freely given, specific, informed, unambiguous, and withdrawable. Pre-ticked boxes are not valid consent for personal data in GDPR contexts.

For UATP, this means:

- anonymous non-personal task-pattern contribution can be default-enabled with clear opt-out
- raw prompts and personal data require separate explicit opt-in
- enterprise runtimes must be able to enforce organization-wide local-only mode
