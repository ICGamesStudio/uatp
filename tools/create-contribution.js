#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadUatp } from "../packages/parser-js/src/index.js";
import { hashObject, renderYaml } from "./lib/task-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const filename = process.argv[2];

if (!filename) {
  console.error("Usage: node tools/create-contribution.js <task.yaml>");
  process.exit(2);
}

const task = loadUatp(path.resolve(root, filename));
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

console.log(renderYaml(contribution));

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
