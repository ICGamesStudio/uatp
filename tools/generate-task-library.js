#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const libraryDir = path.join(root, "task-library");
const targetCount = 1000;

const domains = [
  domain("software-engineering", "Software Engineering", "engineering teams", "repository", ["debug a failing test suite", "review a pull request", "write missing regression tests", "refactor a module without behavior changes", "summarize a technical change", "extract API contract details", "create an implementation plan", "translate developer notes"]),
  domain("devops", "DevOps", "platform teams", "repository", ["review a CI workflow", "debug a deployment failure", "summarize infrastructure changes", "extract required environment variables", "create a rollback plan", "write validation checks", "refactor automation scripts", "translate runbook notes"]),
  domain("security", "Security", "security teams", "document", ["review a security report", "summarize risk findings", "extract indicators of compromise", "create a remediation plan", "translate incident notes", "write verification steps", "debug a security test failure", "refactor policy wording"]),
  domain("data-analytics", "Data Analytics", "analytics teams", "document", ["summarize a metrics report", "extract KPIs", "create an analysis plan", "translate dashboard notes", "review metric definitions", "debug a data quality issue", "write validation checks", "refactor a reporting query"]),
  domain("customer-support", "Customer Support", "support teams", "conversation", ["summarize a support thread", "extract customer issue details", "create a resolution plan", "translate customer feedback", "review escalation notes", "write test cases for reproduction", "debug a reported workflow", "refactor a help-center article"]),
  domain("product-management", "Product Management", "product teams", "document", ["summarize product feedback", "extract feature requests", "create a product plan", "translate roadmap notes", "review requirements", "write acceptance tests", "debug a user journey", "refactor user stories"]),
  domain("marketing-operations", "Marketing Operations", "marketing teams", "document", ["summarize campaign results", "extract audience insights", "create a content plan", "translate campaign copy", "review messaging consistency", "write validation checks", "debug tracking setup", "refactor brief wording"]),
  domain("sales-operations", "Sales Operations", "sales teams", "document", ["summarize pipeline notes", "extract qualification signals", "create a follow-up plan", "translate account notes", "review proposal requirements", "write CRM validation checks", "debug reporting inconsistencies", "refactor sales playbook content"]),
  domain("legal-operations", "Legal Operations", "legal teams", "document", ["summarize contract terms", "extract obligations", "create a review plan", "translate legal notes", "review clause consistency", "write compliance checks", "debug document mismatch", "refactor policy language"]),
  domain("finance-operations", "Finance Operations", "finance teams", "document", ["summarize expense report", "extract budget variances", "create a reconciliation plan", "translate finance notes", "review invoice fields", "write validation checks", "debug calculation mismatch", "refactor report structure"]),
  domain("human-resources", "Human Resources", "people teams", "document", ["summarize interview feedback", "extract hiring criteria", "create an onboarding plan", "translate HR notes", "review policy clarity", "write checklist tests", "debug workflow confusion", "refactor handbook content"]),
  domain("education", "Education", "learning teams", "document", ["summarize lesson material", "extract learning objectives", "create a study plan", "translate course notes", "review assessment clarity", "write quiz checks", "debug learner confusion", "refactor curriculum outline"]),
  domain("healthcare-admin", "Healthcare Administration", "healthcare operations teams", "document", ["summarize administrative notes", "extract appointment requirements", "create a process plan", "translate patient-facing text", "review form completeness", "write validation checks", "debug scheduling workflow", "refactor instruction text"]),
  domain("research", "Research", "research teams", "document", ["summarize a paper", "extract research questions", "create an experiment plan", "translate abstract notes", "review methodology clarity", "write evaluation checks", "debug reproducibility issue", "refactor literature notes"]),
  domain("content-production", "Content Production", "content teams", "document", ["summarize source material", "extract content pillars", "create an editorial plan", "translate draft content", "review tone consistency", "write editorial checks", "debug missing context", "refactor article structure"]),
  domain("game-development", "Game Development", "game teams", "repository", ["debug gameplay behavior", "review gameplay code", "write regression tests", "refactor a gameplay system", "summarize design notes", "extract tuning parameters", "create an implementation plan", "translate production notes"]),
  domain("ai-operations", "AI Operations", "AI platform teams", "document", ["review an agent workflow", "debug an evaluation failure", "write evaluation checks", "refactor prompt templates", "summarize model behavior", "extract task requirements", "create a rollout plan", "translate eval notes"]),
  domain("knowledge-management", "Knowledge Management", "operations teams", "document", ["summarize knowledge base content", "extract decision records", "create a documentation plan", "translate internal notes", "review information architecture", "write freshness checks", "debug missing references", "refactor taxonomy labels"]),
  domain("procurement", "Procurement", "procurement teams", "document", ["summarize vendor requirements", "extract evaluation criteria", "create a comparison plan", "translate vendor notes", "review requirement coverage", "write validation checks", "debug scoring mismatch", "refactor request document"]),
  domain("executive-operations", "Executive Operations", "leadership teams", "document", ["summarize executive briefing", "extract decision points", "create an action plan", "translate board notes", "review strategic alignment", "write follow-up checks", "debug conflicting priorities", "refactor briefing structure"])
];

const variations = [
  { risk: "low", change: "none", language: "en", style: "concise", outputLanguage: "en" },
  { risk: "low", change: "minimal", language: "en", style: "evidence-first", outputLanguage: "en" },
  { risk: "medium", change: "moderate", language: "en", style: "structured", outputLanguage: "en" },
  { risk: "low", change: "none", language: "tr", style: "concise", outputLanguage: "tr" },
  { risk: "medium", change: "minimal", language: "tr", style: "action-oriented", outputLanguage: "tr" }
];

const scenarios = [
  "new-project-bootstrap",
  "existing-codebase-maintenance",
  "production-incident-response",
  "team-handoff",
  "quality-audit",
  "migration-work",
  "performance-review",
  "compliance-check",
  "documentation-refresh",
  "release-readiness"
];

fs.rmSync(libraryDir, { recursive: true, force: true });
fs.mkdirSync(libraryDir, { recursive: true });

const manifest = {
  generated_by: "tools/generate-task-library.js",
  owner: "Smartlabs Medya Teknolojileri AŞ",
  website: "https://www.smartlabs.com.tr",
  protocol: "uatp",
  version: "0.1",
  task_count: 0,
  semantic_signature_count: 0,
  domains: []
};

let count = 0;
const semanticSignatures = new Set();
for (const domainDef of domains) {
  const domainDir = path.join(libraryDir, domainDef.id);
  fs.mkdirSync(domainDir, { recursive: true });
  let domainCount = 0;

  for (let i = 0; i < 50; i += 1) {
    const pattern = domainDef.patterns[i % domainDef.patterns.length];
    const variation = variations[i % variations.length];
    const scenario = scenarios[Math.floor(i / domainDef.patterns.length) % scenarios.length];
    const id = `${domainDef.id}-${String(i + 1).padStart(3, "0")}`;
    const task = buildTask(id, domainDef, pattern, variation, scenario, i);
    const semanticSignature = hashObject(toSemanticSignature(task));

    if (semanticSignatures.has(semanticSignature)) {
      throw new Error(`Duplicate semantic task signature generated for ${id}`);
    }

    semanticSignatures.add(semanticSignature);
    task.metadata.semantic_signature = semanticSignature;
    task.metadata.content_hash = hashObject(task);

    fs.writeFileSync(path.join(domainDir, `${id}.yaml`), renderYaml(task));
    count += 1;
    domainCount += 1;
  }

  manifest.domains.push({ id: domainDef.id, title: domainDef.title, task_count: domainCount });
}

manifest.task_count = count;
manifest.semantic_signature_count = semanticSignatures.size;
fs.writeFileSync(path.join(libraryDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

if (count < targetCount) {
  throw new Error(`Expected at least ${targetCount} tasks, generated ${count}`);
}

if (semanticSignatures.size !== count) {
  throw new Error(`Expected ${count} unique semantic signatures, got ${semanticSignatures.size}`);
}

console.log(`Generated ${count} UATP tasks in ${path.relative(root, libraryDir)}`);

function domain(id, title, audience, target, patterns) {
  return { id, title, audience, target, patterns };
}

function buildTask(id, domainDef, pattern, variation, scenario, index) {
  const intent = inferIntent(pattern);
  const outputFormat = inferOutputFormat(intent);

  return {
    protocol: "uatp",
    version: "0.1",
    intent,
    scope: {
      target: domainDef.target,
      path: domainDef.target === "repository" ? "." : `${domainDef.id}/source-${index + 1}`
    },
    actions: inferActions(intent),
    success_criteria: successCriteria(intent, domainDef, pattern),
    constraints: {
      risk: variation.risk,
      change: variation.change,
      language: variation.language,
      style: variation.style,
      max_tokens: 900
    },
    context: {
      domain: domainDef.title,
      audience: domainDef.audience,
      scenario,
      request_pattern: pattern,
      expected_business_value: businessValue(intent),
      example_user_request: `Please ${pattern} for this ${domainDef.title.toLowerCase()} ${scenario.replaceAll("-", " ")} workflow.`
    },
    output: {
      format: outputFormat,
      language: variation.outputLanguage,
      sections: outputSections(outputFormat),
      include_sources: ["review_code", "extract_information", "summarize"].includes(intent)
    },
    metadata: {
      id,
      title: `${domainDef.title}: ${pattern}`,
      source: "generated-task-library",
      owner: "Smartlabs Medya Teknolojileri AŞ",
      website: "https://www.smartlabs.com.tr"
    }
  };
}

function toSemanticSignature(task) {
  return {
    intent: task.intent,
    scope: {
      target: task.scope.target
    },
    actions: task.actions,
    success_criteria: task.success_criteria,
    constraints: task.constraints,
    context: {
      domain: task.context.domain,
      audience: task.context.audience,
      scenario: task.context.scenario,
      request_pattern: task.context.request_pattern,
      expected_business_value: task.context.expected_business_value
    },
    output: task.output
  };
}

function hashObject(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function inferIntent(pattern) {
  if (pattern.includes("debug")) return "debug_code";
  if (pattern.includes("review")) return "review_code";
  if (pattern.includes("write")) return "write_tests";
  if (pattern.includes("refactor")) return "refactor_code";
  if (pattern.includes("translate")) return "translate";
  if (pattern.includes("extract")) return "extract_information";
  if (pattern.includes("plan")) return "create_plan";
  return "summarize";
}

function inferActions(intent) {
  return {
    debug_code: ["inspect", "run_tests", "patch", "summarize"],
    review_code: ["inspect", "report"],
    write_tests: ["inspect", "run_tests", "patch", "validate"],
    refactor_code: ["inspect", "patch", "validate", "summarize"],
    summarize: ["inspect", "summarize"],
    translate: ["translate"],
    extract_information: ["inspect", "extract", "report"],
    create_plan: ["inspect", "plan", "report"]
  }[intent];
}

function inferOutputFormat(intent) {
  return {
    debug_code: "diff_summary",
    review_code: "review_findings",
    write_tests: "test_report",
    refactor_code: "diff_summary",
    summarize: "markdown",
    translate: "plain_text",
    extract_information: "json",
    create_plan: "plan"
  }[intent];
}

function successCriteria(intent, domainDef, pattern) {
  const common = [`The response stays within the ${domainDef.title} task scope.`, `The output directly addresses: ${pattern}.`];
  const byIntent = {
    debug_code: ["The failure mode is reproduced or explicitly documented.", "The smallest practical fix is proposed or applied."],
    review_code: ["Findings are ordered by severity.", "Each finding includes evidence or a concrete location."],
    write_tests: ["Tests cover the requested behavior.", "Validation steps are listed with expected outcomes."],
    refactor_code: ["External behavior is preserved.", "The refactor reduces complexity or duplication."],
    summarize: ["The main claims are preserved.", "Unsupported speculation is omitted."],
    translate: ["Meaning is preserved.", "The target language reads naturally."],
    extract_information: ["Extracted fields are structured.", "Missing information is represented explicitly."],
    create_plan: ["The plan is ordered by execution priority.", "Risks and validation steps are included."]
  };
  return [...byIntent[intent], ...common];
}

function outputSections(format) {
  return {
    diff_summary: ["summary", "changes", "validation", "risks"],
    review_findings: ["findings", "questions", "test_gaps"],
    test_report: ["coverage", "test_cases", "validation"],
    markdown: ["summary", "key_points", "open_questions"],
    plain_text: ["translation"],
    json: ["fields", "missing_information", "sources"],
    plan: ["steps", "dependencies", "risks", "validation"]
  }[format];
}

function businessValue(intent) {
  return {
    debug_code: "Reduce time to diagnose and fix operational failures.",
    review_code: "Improve review consistency and reduce missed issues.",
    write_tests: "Increase confidence with repeatable validation.",
    refactor_code: "Improve maintainability while controlling change risk.",
    summarize: "Reduce review time and preserve key information.",
    translate: "Make information usable across languages.",
    extract_information: "Turn unstructured input into reusable data.",
    create_plan: "Convert ambiguous requests into executable steps."
  }[intent];
}

function renderYaml(value, indent = 0) {
  if (Array.isArray(value)) {
    return value.map((item) => `${" ".repeat(indent)}- ${renderScalarOrNested(item, indent + 2)}`).join("\n") + "\n";
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        if (Array.isArray(item) || (item && typeof item === "object")) {
          return `${" ".repeat(indent)}${key}:\n${renderYaml(item, indent + 2).trimEnd()}`;
        }
        return `${" ".repeat(indent)}${key}: ${renderScalar(item)}`;
      })
      .join("\n") + "\n";
  }
  return `${" ".repeat(indent)}${renderScalar(value)}\n`;
}

function renderScalarOrNested(value, indent) {
  if (Array.isArray(value) || (value && typeof value === "object")) {
    return `\n${renderYaml(value, indent).trimEnd()}`;
  }
  return renderScalar(value);
}

function renderScalar(value) {
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(String(value));
}
