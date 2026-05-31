import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValidUatp, loadUatp } from "./index.js";
import { hashObject, lexicalScore, tokenize } from "../../../tools/lib/task-utils.js";
import { detectLanguage, deterministicNormalize, normalizePrompt } from "./translator-model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(__dirname, "../../..");

export function translatePrompt(promptText, options = {}) {
  const root = options.root ?? defaultRoot;
  const normalized = deterministicNormalize(promptText);
  const match = findBestMatch(normalized.canonical_prompt, root);
  const task = loadUatp(path.join(root, match.path));
  const translated = adaptTask(task, promptText, match, normalized);
  assertValidUatp(translated);

  return { match, normalized, task: translated };
}

export async function translatePromptAsync(promptText, options = {}) {
  const root = options.root ?? defaultRoot;
  const normalized = await normalizePrompt(promptText, options.translator ?? {});
  const match = findBestMatch(normalized.canonical_prompt, root);
  const task = loadUatp(path.join(root, match.path));
  const translated = adaptTask(task, promptText, match, normalized);
  assertValidUatp(translated);

  return { match, normalized, task: translated };
}

export function anonymizePrompt(promptText) {
  return String(promptText)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, "[phone]")
    .replace(/https?:\/\/\S+/gi, "[url]")
    .replace(/\b(?:ghp|gho|sk|api)[A-Za-z0-9_-]{16,}\b/g, "[secret]")
    .trim();
}

export function findBestMatch(promptText, root = defaultRoot) {
  const queryTokens = tokenize(promptText);
  const intentHint = inferIntentHint(queryTokens);
  const lexicalRows = readJsonl(path.join(root, "task-library-index", "lexical.jsonl"));
  let best = null;

  for (const row of lexicalRows) {
    const baseScore = lexicalScore(queryTokens, row.tokens);
    const score = baseScore + intentBoost(row, intentHint) + domainBoost(row, queryTokens);
    if (!best || score > best.score) {
      best = { ...row, score, lexical_score: baseScore };
    }
  }

  if (!best || best.score === 0) {
    throw new Error("No matching UATP task found. Build the index first with npm run build:index.");
  }

  return best;
}

function inferIntentHint(tokens) {
  const tokenSet = new Set(tokens);

  if (tokenSet.has("code") || tokenSet.has("repository") || tokenSet.has("repo") || tokenSet.has("pull")) {
    if (tokenSet.has("debug") || tokenSet.has("bug") || tokenSet.has("fix") || tokenSet.has("failure")) {
      return "debug_code";
    }
    if (tokenSet.has("write") && (tokenSet.has("test") || tokenSet.has("tests"))) {
      return "write_tests";
    }
    if (tokenSet.has("review") || tokenSet.has("inspect") || tokenSet.has("risk") || tokenSet.has("missing")) {
      return "review_code";
    }
  }

  return undefined;
}

function intentBoost(row, intentHint) {
  if (!intentHint) {
    return 0;
  }
  return row.intent === intentHint ? 0.2 : 0;
}

function domainBoost(row, tokens) {
  const tokenSet = new Set(tokens);
  const isCodeRequest =
    tokenSet.has("code") ||
    tokenSet.has("repository") ||
    tokenSet.has("repo") ||
    tokenSet.has("pull");

  if (!isCodeRequest) {
    return 0;
  }

  if (tokenSet.has("game") || tokenSet.has("gameplay")) {
    return row.domain === "game-development" ? 0.08 : 0;
  }
  if (tokenSet.has("security") || tokenSet.has("risk")) {
    return row.domain === "security" ? 0.08 : 0;
  }
  if (tokenSet.has("agent") || tokenSet.has("model")) {
    return row.domain === "ai-operations" ? 0.08 : 0;
  }

  return row.domain === "software-engineering" ? 0.1 : 0;
}

function adaptTask(task, promptText, match, normalized) {
  const language = normalized.source_language ?? detectLanguage(promptText);
  const promptFingerprint = hashObject({
    normalized_prompt: String(promptText).toLowerCase().replace(/\s+/g, " ").trim()
  });

  return {
    ...task,
    constraints: {
      ...task.constraints,
      language
    },
    context: {
      ...task.context,
      example_user_request: anonymizePrompt(promptText),
      canonical_prompt: normalized.canonical_prompt,
      translator_match_score: Number(match.score.toFixed(4)),
      translator_confidence: confidenceLabel(match.score, normalized.confidence),
      translator_provider: normalized.provider
    },
    output: {
      ...task.output,
      language
    },
    metadata: {
      ...task.metadata,
      source: "prompt-translator",
      matched_task_id: match.id,
      prompt_fingerprint: promptFingerprint,
      translated_by: "packages/parser-js/src/translator.js"
    }
  };
}

function confidenceLabel(score, modelConfidence = "medium") {
  if (score >= 0.25) {
    return "high";
  }
  if (score >= 0.1 || modelConfidence === "high") {
    return "medium";
  }
  return "low";
}

function readJsonl(filename) {
  return fs.readFileSync(filename, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}
