#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValidUatp, loadUatp } from "../packages/parser-js/src/index.js";
import { hashObject, lexicalScore, renderYaml, tokenize } from "./lib/task-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const prompt = args.prompt ?? readStdin();

if (!prompt.trim()) {
  console.error("Usage: node tools/translate-prompt.js --prompt \"Review this pull request\"");
  process.exit(2);
}

const match = findBestMatch(prompt);
const task = loadUatp(path.join(root, match.path));
const translated = adaptTask(task, prompt, match);
assertValidUatp(translated);

if (args.json) {
  console.log(JSON.stringify({ match, task: translated }, null, 2));
} else {
  console.log(renderYaml(translated));
}

function findBestMatch(promptText) {
  const queryTokens = tokenize(promptText);
  const lexicalRows = readJsonl(path.join(root, "task-library-index", "lexical.jsonl"));
  let best = null;

  for (const row of lexicalRows) {
    const score = lexicalScore(queryTokens, row.tokens);
    if (!best || score > best.score) {
      best = { ...row, score };
    }
  }

  if (!best || best.score === 0) {
    throw new Error("No matching UATP task found. Build the index first with npm run build:index.");
  }

  return best;
}

function adaptTask(task, promptText, match) {
  const language = detectLanguage(promptText);
  const promptFingerprint = hashObject({
    normalized_prompt: promptText.toLowerCase().replace(/\s+/g, " ").trim()
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
      translator_match_score: Number(match.score.toFixed(4))
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
      translated_by: "tools/translate-prompt.js"
    }
  };
}

function detectLanguage(promptText) {
  const normalized = promptText.toLowerCase();
  const turkishSignals = ["ç", "ğ", "ı", "ö", "ş", "ü", " lütfen ", " hata ", " kod ", " çevir ", " özetle "];
  return turkishSignals.some((signal) => normalized.includes(signal)) ? "tr" : "en";
}

function anonymizePrompt(promptText) {
  return promptText
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, "[phone]")
    .replace(/https?:\/\/\S+/gi, "[url]")
    .replace(/\b(?:ghp|gho|sk|api)[A-Za-z0-9_-]{16,}\b/g, "[secret]")
    .trim();
}

function readJsonl(filename) {
  return fs.readFileSync(filename, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function parseArgs(argv) {
  const parsed = { json: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--prompt") {
      parsed.prompt = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--json") {
      parsed.json = true;
    }
  }
  return parsed;
}

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}
