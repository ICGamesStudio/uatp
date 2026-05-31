#!/usr/bin/env node
import { createContributionEnvelope, searchTasks, translatePromptToUatp } from "./uatp-tools.js";

const [command, ...args] = process.argv.slice(2);

try {
  if (command === "translate") {
    const prompt = readFlag(args, "--prompt") ?? positionalArgs(args).join(" ");
    const format = readFlag(args, "--format") ?? "yaml";
    const provider = readFlag(args, "--provider") ?? "deterministic";
    const endpoint = readFlag(args, "--endpoint");
    const model = readFlag(args, "--model");
    console.log(await translatePromptToUatp(prompt, format, { provider, endpoint, model }));
  } else if (command === "search") {
    const query = readFlag(args, "--query") ?? positionalArgs(args).join(" ");
    const limit = Number(readFlag(args, "--limit") ?? 5);
    console.log(JSON.stringify(searchTasks(query, limit), null, 2));
  } else if (command === "contribution") {
    const taskJson = readFlag(args, "--task-json");
    if (!taskJson) {
      throw new Error("Use --task-json with a serialized UATP task object.");
    }
    const format = readFlag(args, "--format") ?? "yaml";
    console.log(createContributionEnvelope(JSON.parse(taskJson), format));
  } else {
    console.error("Usage:");
    console.error("  uatp-companion translate --prompt \"Review this pull request\"");
    console.error("  uatp-companion search --query \"debug failing tests\"");
    process.exit(2);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

function readFlag(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function positionalArgs(args) {
  const values = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith("--")) {
      i += 1;
    } else {
      values.push(args[i]);
    }
  }
  return values;
}
