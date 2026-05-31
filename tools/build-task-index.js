#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadUatp } from "../packages/parser-js/src/index.js";
import { tokenize } from "./lib/task-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const libraryDir = path.join(root, "task-library");
const indexDir = path.join(root, "task-library-index");

fs.rmSync(indexDir, { recursive: true, force: true });
fs.mkdirSync(indexDir, { recursive: true });

const taskFiles = listYamlFiles(libraryDir);
const taxonomy = {};
const signatures = [];
const lexical = [];

for (const taskFile of taskFiles) {
  const task = loadUatp(taskFile);
  const relativePath = path.relative(root, taskFile).replaceAll("\\", "/");
  const domain = task.context?.domain ?? "Unknown";
  const domainKey = slug(domain);
  const intent = task.intent;
  const outputFormat = task.output?.format ?? "unknown";

  taxonomy[domainKey] ??= {
    title: domain,
    task_count: 0,
    intents: {},
    output_formats: {}
  };
  taxonomy[domainKey].task_count += 1;
  taxonomy[domainKey].intents[intent] = (taxonomy[domainKey].intents[intent] ?? 0) + 1;
  taxonomy[domainKey].output_formats[outputFormat] = (taxonomy[domainKey].output_formats[outputFormat] ?? 0) + 1;

  signatures.push({
    id: task.metadata?.id,
    semantic_signature: task.metadata?.semantic_signature,
    content_hash: task.metadata?.content_hash,
    path: relativePath,
    intent,
    domain: domainKey,
    scenario: task.context?.scenario,
    output_format: outputFormat
  });

  lexical.push({
    id: task.metadata?.id,
    path: relativePath,
    intent,
    domain: domainKey,
    tokens: tokenize([
      task.metadata?.title,
      task.context?.example_user_request,
      task.context?.request_pattern,
      task.context?.expected_business_value,
      task.success_criteria?.join(" "),
      task.actions?.join(" "),
      outputFormat
    ].filter(Boolean).join(" "))
  });
}

const manifest = {
  generated_by: "tools/build-task-index.js",
  protocol: "uatp",
  version: "0.1",
  task_count: taskFiles.length,
  index_files: ["taxonomy.json", "signatures.jsonl", "lexical.jsonl"]
};

fs.writeFileSync(path.join(indexDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
fs.writeFileSync(path.join(indexDir, "taxonomy.json"), JSON.stringify(taxonomy, null, 2) + "\n");
fs.writeFileSync(path.join(indexDir, "signatures.jsonl"), signatures.map((item) => JSON.stringify(item)).join("\n") + "\n");
fs.writeFileSync(path.join(indexDir, "lexical.jsonl"), lexical.map((item) => JSON.stringify(item)).join("\n") + "\n");

console.log(`Built task-library-index for ${taskFiles.length} tasks`);

function listYamlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return listYamlFiles(fullPath);
    }
    if (entry.isFile() && entry.name.endsWith(".yaml")) {
      return [fullPath];
    }
    return [];
  });
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
