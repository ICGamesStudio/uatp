import assert from "node:assert/strict";
import { createContributionEnvelope, searchTasks, translatePromptToUatp } from "../src/uatp-tools.js";

const translated = JSON.parse(await translatePromptToUatp("Review this pull request and list security risks with evidence", "json"));
assert.equal(translated.task.protocol, "uatp");
assert.equal(translated.task.intent, "review_code");
assert.equal(translated.task.output.language, "en");
assert.equal(translated.normalized.canonical_language, "en");
assert.ok(["high", "medium", "low"].includes(translated.task.context.translator_confidence));

const translatedTurkish = JSON.parse(await translatePromptToUatp("Bu kodu incele ve test eksiklerini bul", "json"));
assert.equal(translatedTurkish.task.intent, "review_code");
assert.equal(translatedTurkish.match.domain, "software-engineering");
assert.equal(translatedTurkish.task.output.language, "tr");
assert.match(translatedTurkish.normalized.canonical_prompt, /review|test|missing|code/);

const results = searchTasks("debug failing tests", 3);
assert.equal(results.length, 3);
assert.ok(results[0].score > 0);

const contribution = JSON.parse(createContributionEnvelope(translated.task, "json"));
assert.equal(contribution.protocol, "uatp-contribution");
assert.equal(contribution.privacy.raw_prompt_included, false);

console.log("mcp companion smoke ok");
