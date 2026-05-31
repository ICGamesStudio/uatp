#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const indexDir = path.join(root, "task-library-index");
const libraryDir = path.join(root, "task-library");

const manifest = readJson(path.join(indexDir, "manifest.json"));
const taxonomy = readJson(path.join(indexDir, "taxonomy.json"));
const signatures = readJsonl(path.join(indexDir, "signatures.jsonl"));
const lexical = readJsonl(path.join(indexDir, "lexical.jsonl"));
const libraryTaskCount = countYamlFiles(libraryDir);

if (manifest.task_count !== libraryTaskCount) {
  fail(`index task_count ${manifest.task_count} does not match library count ${libraryTaskCount}`);
}
if (signatures.length !== libraryTaskCount) {
  fail(`signatures index has ${signatures.length} rows, expected ${libraryTaskCount}`);
}
if (lexical.length !== libraryTaskCount) {
  fail(`lexical index has ${lexical.length} rows, expected ${libraryTaskCount}`);
}
if (Object.keys(taxonomy).length < 20) {
  fail(`taxonomy should contain at least 20 domains, found ${Object.keys(taxonomy).length}`);
}

const ids = new Set();
const semanticSignatures = new Set();
for (const row of signatures) {
  if (!row.id || !row.semantic_signature || !row.path) {
    fail(`invalid signature row: ${JSON.stringify(row)}`);
  }
  if (ids.has(row.id)) {
    fail(`duplicate id in signatures index: ${row.id}`);
  }
  if (semanticSignatures.has(row.semantic_signature)) {
    fail(`duplicate semantic signature in signatures index: ${row.semantic_signature}`);
  }
  ids.add(row.id);
  semanticSignatures.add(row.semantic_signature);
}

console.log(`task index ok: ${libraryTaskCount} tasks, ${Object.keys(taxonomy).length} domains`);

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf8"));
}

function readJsonl(filename) {
  return fs.readFileSync(filename, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function countYamlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((count, entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return count + countYamlFiles(fullPath);
    }
    return count + (entry.isFile() && entry.name.endsWith(".yaml") ? 1 : 0);
  }, 0);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
