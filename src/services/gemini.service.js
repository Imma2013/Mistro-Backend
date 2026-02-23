const env = require("../config/env");
const { fetchJson } = require("../utils/http");

function safeExtract(rawText, pattern) {
  const match = rawText.match(pattern);
  return match ? match[1].trim() : "";
}

function heuristicNormalize({ title, company, location, salary, descriptionSnippet }) {
  const text = [title, company, location, salary, descriptionSnippet].join(" ");
  const skills = ["React", "TypeScript", "Node", "Next.js", "MongoDB", "Python"].filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase())
  );
  return {
    role: title,
    company,
    location,
    salary,
    skills,
    employmentType: safeExtract(text, /(full[- ]time|part[- ]time|contract|internship)/i) || "",
    summary: (descriptionSnippet || "").slice(0, 260),
    source: "heuristic",
  };
}

async function normalizeJob(job) {
  if (!env.geminiApiKey) {
    return heuristicNormalize(job);
  }

  const prompt = [
    "Extract factual structured fields from this job posting.",
    "Only use facts present in input. No inventions.",
    "Return strict JSON with keys:",
    "role, company, location, salary, skills(array), employmentType, summary.",
    JSON.stringify(job),
  ].join("\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.0 },
  };

  const data = await fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const modelText =
    data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n") || "";

  try {
    const jsonStart = modelText.indexOf("{");
    const jsonEnd = modelText.lastIndexOf("}");
    const jsonText = modelText.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonText);
    return {
      ...parsed,
      source: "gemini",
    };
  } catch (_err) {
    return heuristicNormalize(job);
  }
}

module.exports = {
  normalizeJob,
};

