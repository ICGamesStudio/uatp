import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadUatp, transpileUatp, validateUatp } from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");
const validDir = path.join(root, "tests/fixtures/valid");
const invalidDir = path.join(root, "tests/fixtures/invalid");

for (const filename of listFixtures(validDir)) {
  const document = loadUatp(filename);
  const result = validateUatp(document);
  assert.equal(result.valid, true, `${filename} should be valid`);
}

for (const filename of listFixtures(invalidDir)) {
  const document = loadUatp(filename);
  const result = validateUatp(document);
  assert.equal(result.valid, false, `${filename} should be invalid`);
}

const debugTask = loadUatp(path.join(validDir, "debug_code.yaml"));
assert.match(transpileUatp(debugTask, "openai"), /Universal Agent Task Protocol/);
assert.match(transpileUatp(debugTask, "claude"), /success_criteria/);
assert.match(
  execFileSync(process.execPath, ["src/cli.js", "transpile", path.join(validDir, "debug_code.yaml"), "--target", "claude"], {
    cwd: path.resolve(root, "packages/parser-js"),
    encoding: "utf8"
  }),
  /success_criteria/
);

console.log("conformance ok");

function listFixtures(directory) {
  return fs
    .readdirSync(directory)
    .filter((filename) => filename.endsWith(".yaml") || filename.endsWith(".json"))
    .map((filename) => path.join(directory, filename));
}
