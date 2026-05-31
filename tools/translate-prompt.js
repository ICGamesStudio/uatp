#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translatePromptAsync } from "../packages/parser-js/src/translator.js";
import { renderYaml } from "./lib/task-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const prompt = args.prompt ?? readStdin();

if (!prompt.trim()) {
  console.error("Usage: node tools/translate-prompt.js --prompt \"Review this pull request\"");
  process.exit(2);
}

const { match, normalized, task } = await translatePromptAsync(prompt, {
  root,
  translator: {
    provider: args.provider,
    endpoint: args.endpoint,
    model: args.model
  }
});

if (args.json) {
  console.log(JSON.stringify({ match, normalized, task }, null, 2));
} else {
  console.log(renderYaml(task));
}

function parseArgs(argv) {
  const parsed = { json: false, provider: "deterministic" };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--prompt") {
      parsed.prompt = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--json") {
      parsed.json = true;
    } else if (argv[i] === "--provider") {
      parsed.provider = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--endpoint") {
      parsed.endpoint = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--model") {
      parsed.model = argv[i + 1];
      i += 1;
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
