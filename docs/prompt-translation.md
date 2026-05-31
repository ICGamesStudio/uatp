# Prompt to UATP Translation

UATP should work as a translation layer between ordinary user language and AI agents.

```text
user prompt
  -> local translator LLM
  -> UATP task
  -> validator
  -> task-library matcher
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

## Local LLM Integration

A runtime can use a local model for translation:

- Small local model for classification and extraction.
- Larger local or hosted model for ambiguous requests.
- Deterministic schema repair after model output.
- JSON Schema validation before execution.

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

## Contribution Hook

After translation, the runtime can produce an anonymous contribution envelope from the normalized UATP task. The contribution should use the Learning Loop rules and must not include the raw prompt unless explicit donation mode is enabled.
