import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "../../../schema/uatp.schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateWithSchema = ajv.compile(schema);

export function parseUatp(source, options = {}) {
  const format = options.format ?? inferFormat(options.filename);
  if (format === "json") {
    return JSON.parse(source);
  }
  return YAML.parse(source);
}

export function loadUatp(filename) {
  return parseUatp(fs.readFileSync(filename, "utf8"), { filename });
}

export function validateUatp(document) {
  const valid = validateWithSchema(document);
  return {
    valid,
    errors: valid ? [] : normalizeErrors(validateWithSchema.errors ?? [])
  };
}

export function assertValidUatp(document) {
  const result = validateUatp(document);
  if (!result.valid) {
    throw new Error(result.errors.map((error) => `${error.path}: ${error.message}`).join("\n"));
  }
  return document;
}

export function transpileUatp(document, target = "openai") {
  assertValidUatp(document);
  if (target === "openai") {
    return toOpenAiPrompt(document);
  }
  if (target === "claude") {
    return toClaudePrompt(document);
  }
  throw new Error(`Unsupported transpiler target: ${target}`);
}

export function toOpenAiPrompt(document) {
  return [
    "You are executing a Universal Agent Task Protocol (UATP) task.",
    "",
    renderTask(document),
    "",
    "Follow the constraints exactly. Return only the requested output format."
  ].join("\n");
}

export function toClaudePrompt(document) {
  return [
    "Execute this UATP task carefully and explain only what the output contract asks for.",
    "",
    renderTask(document),
    "",
    "Respect action order, scope boundaries, and risk constraints."
  ].join("\n");
}

function renderTask(document) {
  return YAML.stringify(document).trim();
}

function inferFormat(filename = "") {
  return filename.endsWith(".json") ? "json" : "yaml";
}

function normalizeErrors(errors) {
  return errors.map((error) => ({
    path: error.instancePath || "/",
    message: error.message ?? "invalid value",
    keyword: error.keyword
  }));
}
