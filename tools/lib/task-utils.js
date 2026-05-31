import crypto from "node:crypto";

export function tokenize(text) {
  return [...new Set(String(text).toLowerCase().match(/[a-z0-9]+/g) ?? [])].sort();
}

export function lexicalScore(queryTokens, candidateTokens) {
  if (queryTokens.length === 0 || candidateTokens.length === 0) {
    return 0;
  }

  const candidate = new Set(candidateTokens);
  const matches = queryTokens.filter((token) => candidate.has(token)).length;
  return matches / Math.sqrt(queryTokens.length * candidateTokens.length);
}

export function stableStringify(value) {
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

export function hashObject(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

export function renderYaml(value, indent = 0) {
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
