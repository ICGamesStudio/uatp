#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadUatp, validateUatp } from "../packages/parser-js/src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const libraryDir = path.join(root, "task-library");
const manifestPath = path.join(libraryDir, "manifest.json");

if (!fs.existsSync(manifestPath)) {
  fail("task-library/manifest.json is missing");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const taskFiles = listYamlFiles(libraryDir);
const signatures = new Map();
const ids = new Map();

for (const taskFile of taskFiles) {
  const task = loadUatp(taskFile);
  const result = validateUatp(task);

  if (!result.valid) {
    fail(`${path.relative(root, taskFile)} is invalid: ${JSON.stringify(result.errors)}`);
  }

  const id = task.metadata?.id;
  const signature = task.metadata?.semantic_signature;

  if (!id) {
    fail(`${path.relative(root, taskFile)} is missing metadata.id`);
  }
  if (!signature) {
    fail(`${path.relative(root, taskFile)} is missing metadata.semantic_signature`);
  }
  if (ids.has(id)) {
    fail(`duplicate task id ${id}: ${ids.get(id)} and ${path.relative(root, taskFile)}`);
  }
  if (signatures.has(signature)) {
    fail(`duplicate semantic signature ${signature}: ${signatures.get(signature)} and ${path.relative(root, taskFile)}`);
  }

  ids.set(id, path.relative(root, taskFile));
  signatures.set(signature, path.relative(root, taskFile));
}

if (manifest.task_count !== taskFiles.length) {
  fail(`manifest task_count ${manifest.task_count} does not match ${taskFiles.length} task files`);
}

if (manifest.semantic_signature_count !== signatures.size) {
  fail(`manifest semantic_signature_count ${manifest.semantic_signature_count} does not match ${signatures.size}`);
}

if (taskFiles.length < 1000) {
  fail(`expected at least 1000 task files, found ${taskFiles.length}`);
}

console.log(`task library ok: ${taskFiles.length} tasks, ${signatures.size} unique semantic signatures`);

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

function fail(message) {
  console.error(message);
  process.exit(1);
}
