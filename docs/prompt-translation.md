# Prompt to UATP Translation

UATP should work as a translation layer between ordinary user language and AI agents.

```text
user prompt
  -> canonical English normalizer
  -> task-library matcher
  -> UATP task adaptation
  -> validator
  -> agent/model adapter
```

## Translator Goals

The translator converts natural language into a UATP task:

- `intent`
- `scope`
- `actions`
- `success_criteria`
- `constraints`
- `context`
- `output`

The translator should not execute the task. It only compiles the user request into a structured task contract.

## Canonical English Layer

UATP uses English as the canonical matching language. The user may write in any supported language, but the runtime first normalizes the request into a short canonical English prompt, then matches that normalized text against the indexed task library.

The output task should still preserve the user's source language unless the user requested another language.

The normalized payload records:

- `source_language`
- `canonical_language`
- `canonical_prompt`
- `provider`
- `confidence`

The adapted UATP task records `context.canonical_prompt` and `context.translator_provider` so runtimes can audit how the task was selected.

## Local LLM Integration

A runtime can use a local model for translation:

- Small local model for classification and extraction.
- Larger local or hosted model for ambiguous requests.
- Deterministic schema repair after model output.
- JSON Schema validation before execution.

The default runtime can work without a model using deterministic normalization. A local LLM adapter can be enabled when prompts are multilingual, incomplete, or ambiguous. Hosted model adapters should be optional provider plugins, not a requirement for the core standard.

Example with an Ollama-compatible local endpoint:

```bash
npm run translate -- --prompt "Bu kodu incele ve test eksiklerini bul" --json \
  --provider local-llm \
  --endpoint http://localhost:11434/api/generate \
  --model llama3.1
```

Recommended local translator stages:

1. Language detection.
2. Domain classification.
3. Intent classification.
4. Scope extraction.
5. Action planning.
6. Constraint extraction.
7. Success criteria generation.
8. Output contract selection.
9. Schema validation.
10. Library matching.

## Avoid Searching the Whole Library

Runtimes should not scan every task file for each prompt.

Use a layered retrieval index:

### 1. Taxonomy Router

Fast deterministic routing:

- language
- domain
- intent
- target type
- risk/change class
- output format

This narrows the candidate set before semantic search.

### 2. Signature Index

Use semantic signatures for exact or near-exact task-pattern matches.

Examples:

- `intent + domain + scenario + actions + output`
- normalized success criteria
- normalized constraints

### 3. Embedding Index

Build a vector index over:

- `context.example_user_request`
- `metadata.title`
- `success_criteria`
- `actions`
- `output.format`

Use approximate nearest-neighbor search for large libraries.

### 4. Cache

Cache recent prompt fingerprints:

- prompt hash after anonymization
- selected task id
- selected semantic signature
- translator confidence

## Index Artifact

The repository should eventually publish:

```text
task-library-index/
  taxonomy.json
  signatures.jsonl
  embeddings.jsonl
  manifest.json
```

The runtime loads the index, not the entire YAML library, during normal operation.

## Match Flow

```text
prompt
  -> canonical English normalization
  -> local classification
  -> taxonomy candidate bucket
  -> semantic signature lookup
  -> embedding top-k
  -> candidate task adaptation
  -> schema validation
```

## Translator Output Policy

The translator may adapt a matched library task, but it must preserve:

- user intent
- user scope
- safety constraints
- output requirements
- language preference

If confidence is low, the runtime should ask a clarifying question instead of inventing missing details.

## Current CLI Prototype

Build the index:

```bash
cd packages/parser-js
npm run build:index
npm run validate:index
```

Translate a prompt:

```bash
npm run translate -- --prompt "Review this pull request and list security risks with evidence"
```

The prototype:

- narrows search with a prebuilt lexical index
- avoids scanning every YAML file during prompt translation
- adapts the matched task into a valid UATP document
- records `context.canonical_prompt`
- records `context.translator_confidence`
- records `context.translator_provider`
- records `metadata.matched_task_id`
- records an anonymized `metadata.prompt_fingerprint`
- strips common email, phone, URL, and token-like secrets from the stored prompt example

## Contribution Hook

After translation, the runtime can produce an anonymous contribution envelope from the normalized UATP task. The contribution should use the Learning Loop rules and must not include the raw prompt unless explicit donation mode is enabled.
