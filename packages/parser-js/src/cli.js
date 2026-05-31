#!/usr/bin/env node
import { loadUatp, transpileUatp, validateUatp } from "./index.js";

const [, , command, filename, ...args] = process.argv;
const target = readTarget(args);

if (!command || !filename || !["validate", "transpile"].includes(command)) {
  console.error("Usage: uatp <validate|transpile> <file.yaml|file.json> [--target openai|claude]");
  process.exit(2);
}

try {
  const document = loadUatp(filename);

  if (command === "validate") {
    const result = validateUatp(document);
    if (!result.valid) {
      console.error(JSON.stringify(result.errors, null, 2));
      process.exit(1);
    }
    console.log("valid");
  }

  if (command === "transpile") {
    console.log(transpileUatp(document, target));
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

function readTarget(args) {
  if (args.length === 0) {
    return "openai";
  }
  if (args.length === 1 && ["openai", "claude"].includes(args[0])) {
    return args[0];
  }
  if (args.length === 2 && args[0] === "--target" && ["openai", "claude"].includes(args[1])) {
    return args[1];
  }
  console.error("Invalid target. Use --target openai or --target claude.");
  process.exit(2);
}
