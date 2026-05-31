import path from "node:path";
import { fileURLToPath } from "node:url";
import { translatePromptAsync } from "../../parser-js/src/translator.js";
import { loadUatp } from "../../parser-js/src/index.js";
import { hashObject, lexicalScore, renderYaml, tokenize } from "../../../tools/lib/task-utils.js";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");

export async function translatePromptToUatp(prompt, format = "json", translator = {}) {
  if (!prompt || !String(prompt).trim()) {
    throw new Error("prompt is required");
  }

  const result = await translatePromptAsync(String(prompt), { root, translator });
  return format === "yaml" ? renderYaml(result.task) : JSON.stringify(result, null, 2);
}

export function searchTasks(query, limit = 5) {
  if (!query || !String(query).trim()) {
    throw new Error("query is required");
  }

  const rows = readJsonl(path.join(root, "task-library-index", "lexical.jsonl"));
  const queryTokens = tokenize(query);

  return rows
    .map((row) => ({
      id: row.id,
      path: row.path,
      intent: row.intent,
      domain: row.domain,
      score: Number(lexicalScore(queryTokens, row.tokens).toFixed(4))
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => ({
      ...row,
      task: loadUatp(path.join(root, row.path))
    }));
}

export function createContributionEnvelope(task, format = "json") {
  if (!task || typeof task !== "object") {
    throw new Error("task object is required");
  }

  const contribution = {
    protocol: "uatp-contribution",
    version: "0.1",
    contribution_type: "anonymous_task_pattern",
    uatp_version: task.version,
    task_pattern: {
      intent: task.intent,
      domain: slug(task.context?.domain ?? "unknown"),
      scenario: task.context?.scenario ?? "unknown",
      actions: task.actions,
      constraints: {
        risk: task.constraints?.risk,
        change: task.constraints?.change
      },
      output: {
        format: task.output?.format
      }
    },
    semantic_signature: task.metadata?.semantic_signature ?? hashObject(task),
    privacy: {
      raw_prompt_included: false,
      source_content_included: false,
      personal_data_included: false
    }
  };

  return format === "yaml" ? renderYaml(contribution) : JSON.stringify(contribution, null, 2);
}

function readJsonl(filename) {
  return fs.readFileSync(filename, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
