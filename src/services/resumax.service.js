function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function unique(values) {
  return Array.from(new Set(values));
}

function computeMatchScore({ resumeText, jobDescription, userCategory = "tech" }) {
  const resumeTokens = unique(tokenize(resumeText));
  const jdTokens = unique(tokenize(jobDescription));

  const techSignals = ["react", "node", "typescript", "javascript", "python", "cloud"];
  const constructionSignals = ["construction", "carpenter", "foreman", "welding", "contractor"];

  const jdHasConstruction = constructionSignals.some((token) => jdTokens.includes(token));
  const preferredTech = String(userCategory).toLowerCase() === "tech";
  if (preferredTech && jdHasConstruction) {
    return {
      score: 0,
      missingKeywords: [],
      matchedKeywords: [],
      reason: "Category mismatch detected.",
    };
  }

  const matched = jdTokens.filter((token) => resumeTokens.includes(token));
  const missing = jdTokens.filter((token) => !resumeTokens.includes(token));
  const denominator = Math.max(1, jdTokens.length);
  const score = Math.round((matched.length / denominator) * 100);

  const matchedTech = matched.filter((token) => techSignals.includes(token));
  const missingTech = missing.filter((token) => techSignals.includes(token));

  return {
    score,
    missingKeywords: missingTech.slice(0, 20),
    matchedKeywords: matchedTech.slice(0, 20),
    reason: "Keyword overlap score.",
  };
}

function optimizeResumeStrict({ resumeText, jobDescription }) {
  const resumeLines = String(resumeText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const jdTokens = unique(tokenize(jobDescription));

  const selected = resumeLines.filter((line) => {
    const lineTokens = tokenize(line);
    return lineTokens.some((token) => jdTokens.includes(token));
  });

  const optimized = selected.length ? selected : resumeLines.slice(0, 8);

  return {
    optimizedText: optimized.join("\n"),
    mode: "strict-grounded",
    note: "Only reused lines from the source resume.",
  };
}

function exportOptimizedResume({ optimizedText, format = "txt" }) {
  const timestamp = new Date().toISOString();
  if (format === "pdf") {
    return {
      format: "pdf",
      content: `PDF export placeholder\nGenerated: ${timestamp}\n\n${optimizedText}`,
    };
  }

  return {
    format: "txt",
    content: `Generated: ${timestamp}\n\n${optimizedText}`,
  };
}

module.exports = {
  computeMatchScore,
  optimizeResumeStrict,
  exportOptimizedResume,
};

