#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadUatp, transpileUatp, validateUatp } from "../packages/parser-js/src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, "cases.json"), "utf8"));
const writeReport = process.argv.includes("--write");

const rows = cases.map((benchmarkCase) => {
  const taskPath = path.join(root, benchmarkCase.uatpTask);
  const taskSource = fs.readFileSync(taskPath, "utf8");
  const task = loadUatp(taskPath);
  const validation = validateUatp(task);
  const openAiPrompt = transpileUatp(task, "openai");
  const claudePrompt = transpileUatp(task, "claude");

  return {
    id: benchmarkCase.id,
    title: benchmarkCase.title,
    naturalTokens: estimateTokens(benchmarkCase.naturalPrompt),
    uatpTokens: estimateTokens(taskSource),
    openAiTokens: estimateTokens(openAiPrompt),
    claudeTokens: estimateTokens(claudePrompt),
    valid: validation.valid,
    machineCheckableFields: validation.valid ? countContractFields(task) : 0,
    successCriteria: Array.isArray(task.success_criteria) ? task.success_criteria.length : 0,
    constraintFields: task.constraints ? Object.keys(task.constraints).length : 0
  };
});

const report = renderReport(rows);

if (writeReport) {
  const resultsDir = path.join(__dirname, "results");
  fs.mkdirSync(resultsDir, { recursive: true });
  fs.writeFileSync(path.join(resultsDir, "latest.md"), report);
}

console.log(report);

function estimateTokens(text) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function countContractFields(task) {
  const required = ["protocol", "version", "intent", "scope", "actions", "success_criteria", "output"];
  return required.filter((field) => task[field] !== undefined).length;
}

function renderReport(rows) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.naturalTokens += row.naturalTokens;
      acc.uatpTokens += row.uatpTokens;
      acc.openAiTokens += row.openAiTokens;
      acc.claudeTokens += row.claudeTokens;
      acc.machineCheckableFields += row.machineCheckableFields;
      acc.successCriteria += row.successCriteria;
      acc.constraintFields += row.constraintFields;
      return acc;
    },
    {
      naturalTokens: 0,
      uatpTokens: 0,
      openAiTokens: 0,
      claudeTokens: 0,
      machineCheckableFields: 0,
      successCriteria: 0,
      constraintFields: 0
    }
  );

  const lines = [
    "# UATP Benchmark Report",
    "",
    "This report measures the first practical value layer of UATP: machine-validatable task contracts.",
    "",
    "Token counts are approximate and use `ceil(characters / 4)`. They are useful for trend comparison, not billing.",
    "",
    "| Case | Valid UATP | Natural tokens | UATP tokens | OpenAI transpiled | Claude transpiled | Contract fields | Success criteria | Constraint fields |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...rows.map(
      (row) =>
        `| ${row.title} | ${row.valid ? "yes" : "no"} | ${row.naturalTokens} | ${row.uatpTokens} | ${row.openAiTokens} | ${row.claudeTokens} | ${row.machineCheckableFields} | ${row.successCriteria} | ${row.constraintFields} |`
    ),
    "| **Total** | - | " +
      `${totals.naturalTokens} | ${totals.uatpTokens} | ${totals.openAiTokens} | ${totals.claudeTokens} | ${totals.machineCheckableFields} | ${totals.successCriteria} | ${totals.constraintFields} |`,
    "",
    "## Interpretation",
    "",
    "- Natural-language prompts are shorter in these baseline cases, but they are not schema-validatable.",
    "- UATP adds explicit scope, ordered actions, success criteria, constraints, and output contracts.",
    "- The measurable near-term gain is auditability and consistency, not guaranteed token reduction.",
    "- Model-quality benchmarks should be layered on top of these fixed task contracts."
  ];

  return lines.join("\n") + "\n";
}
