export async function normalizePrompt(promptText, options = {}) {
  const provider = options.provider ?? "deterministic";

  if (provider === "deterministic") {
    return deterministicNormalize(promptText);
  }

  if (provider === "local-llm") {
    return localLlmNormalize(promptText, options);
  }

  throw new Error(`Unsupported translator provider: ${provider}`);
}

export function deterministicNormalize(promptText) {
  const sourceText = String(promptText).trim();
  const sourceLanguage = detectLanguage(sourceText);

  return {
    source_language: sourceLanguage,
    canonical_language: "en",
    canonical_prompt: toCanonicalEnglish(sourceText, sourceLanguage),
    provider: "deterministic",
    confidence: "medium"
  };
}

export async function localLlmNormalize(promptText, options = {}) {
  if (!options.endpoint) {
    return {
      ...deterministicNormalize(promptText),
      fallback_reason: "local LLM endpoint was not configured"
    };
  }

  const response = await fetch(options.endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...(options.model ? { model: options.model } : {}),
      prompt: translatorInstruction(promptText),
      stream: false,
      options: { temperature: 0 }
    })
  });

  if (!response.ok) {
    throw new Error(`Local translator LLM request failed: ${response.status}`);
  }

  const payload = await response.json();
  const raw = payload.response ?? payload.output ?? payload.text ?? "";
  const parsed = parseModelJson(raw);
  const fallback = deterministicNormalize(promptText);

  return {
    source_language: parsed.source_language ?? fallback.source_language,
    canonical_language: "en",
    canonical_prompt: parsed.canonical_prompt ?? fallback.canonical_prompt,
    provider: "local-llm",
    confidence: parsed.confidence ?? "medium"
  };
}

export function detectLanguage(promptText) {
  const normalized = String(promptText).toLowerCase();
  const turkishSignals = [
    "\u00e7",
    "\u011f",
    "\u0131",
    "\u00f6",
    "\u015f",
    "\u00fc",
    "l\u00fctfen",
    "hata",
    "kodu",
    "kod",
    "incele",
    "eksik",
    "bul",
    "yaz",
    "yap",
    "olu\u015ftur",
    "\u00e7evir",
    "\u00f6zetle"
  ];
  return turkishSignals.some((signal) => normalized.includes(signal)) ? "tr" : "en";
}

function toCanonicalEnglish(promptText, sourceLanguage) {
  let normalized = String(promptText).toLowerCase();

  if (sourceLanguage === "tr") {
    const replacements = [
      [/\bkodu\b|\bkod\b/g, "code"],
      [/\bincele\b/g, "review"],
      [/\btest\b/g, "test"],
      [/\beksiklerini\b|\beksik\b/g, "missing"],
      [/\bbul\b/g, "find"],
      [/\bhata\b/g, "bug"],
      [/\bd\u00fczelt\b|\bd\u00fczeltme\b/g, "fix"],
      [/\byaz\b/g, "write"],
      [/\byap\b/g, "create"],
      [/\bolu\u015ftur\b/g, "create"],
      [/\bplan\b/g, "plan"],
      [/\b\u00f6zetle\b/g, "summarize"],
      [/\b\u00e7evir\b/g, "translate"],
      [/\bd\u00f6n\u00fc\u015ft\u00fcr\b|\bd\u00f6n\u00fc\u015ft\u00fcrme\b/g, "convert"],
      [/\bgeli\u015ftir\b|\bgeli\u015ftirme\b|\bgeli\u015ftirelim\b/g, "improve"],
      [/\b\u00e7al\u0131\u015ft\u0131r\b|\b\u00e7al\u0131\u015ft\u0131rma\b/g, "run"],
      [/\bkullan\u0131c\u0131\b|\bkullan\u0131c\u0131n\u0131n\b/g, "user"],
      [/\bdil\b|\bdille\b/g, "language"],
      [/\bdepo\b|\brepo\b/g, "repository"],
      [/\bg\u00fcvenlik\b/g, "security"],
      [/\brisk\b/g, "risk"]
    ];

    for (const [pattern, replacement] of replacements) {
      normalized = normalized.replace(pattern, replacement);
    }
  }

  return normalized.replace(/\s+/g, " ").trim();
}

function translatorInstruction(promptText) {
  return [
    "Convert the user request into canonical English for UATP task matching.",
    "Return only compact JSON with source_language, canonical_prompt, confidence.",
    "Do not execute the task.",
    "Do not include private data beyond what is required to normalize intent.",
    "",
    `User request: ${promptText}`
  ].join("\n");
}

function parseModelJson(raw) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) {
    return {};
  }

  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return {};
  }
}
