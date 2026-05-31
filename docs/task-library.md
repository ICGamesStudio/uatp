# Task Library

UATP includes a generated library of at least 1,000 valid task definitions.

The library is owned and maintained by Smartlabs Medya Teknolojileri AŞ.

Website: https://www.smartlabs.com.tr

## Purpose

The task library turns UATP from a small protocol example into a practical benchmark and integration corpus.

It helps teams:

- Test validators against many realistic request patterns.
- Compare model behavior using stable task contracts.
- Seed internal automation workflows.
- Build domain-specific task catalogs.
- Measure coverage across intents, domains, constraints, and output formats.
- Reject duplicate task meanings before they enter the library.

## Structure

```text
task-library/
  manifest.json
  software-engineering/
  devops/
  security/
  data-analytics/
  ...
```

Each task is a valid UATP `0.1` YAML document.

## Generate

```bash
cd packages/parser-js
npm install
npm run generate:library
```

## Validate

```bash
cd packages/parser-js
npm test
```

The conformance test fails if the task library contains fewer than 1,000 task files or if any generated task is invalid.

## Duplicate Prevention

Each task includes:

- `metadata.id`
- `metadata.semantic_signature`
- `metadata.content_hash`

The generator fails if it creates the same semantic signature twice. JS and Python conformance tests also fail if duplicate semantic signatures are found.

For direct validation:

```bash
cd packages/parser-js
npm run validate:library
```

## Current Coverage

- 20 domains
- 50 tasks per domain
- 1,000 total task definitions
- 1,000 unique semantic signatures
- Core UATP intents only
- Open extension path remains available through namespaced identifiers
