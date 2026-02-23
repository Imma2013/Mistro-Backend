const env = require("../config/env");
const { fetchJson } = require("../utils/http");

function mapSerpJob(raw, index) {
  const company = raw.company_name || raw.company || "Unknown Company";
  const title = raw.title || "Untitled role";
  const location = raw.location || "Unknown location";
  const applyUrl =
    raw.apply_options?.[0]?.link || raw.job_apply_link || raw.related_links?.[0]?.link || "";
  const salary =
    raw.detected_extensions?.salary ||
    raw.salary ||
    raw.extensions?.find?.((value) => /year|hour|\$/.test(String(value))) ||
    "";
  const externalId = raw.job_id || raw.job_key || raw.share_link || `${company}-${title}-${index}`;
  const companyId = company.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    jobId: `${companyId}-${String(externalId).slice(0, 24)}`,
    externalId: String(externalId),
    source: "serpapi",
    sourceUrl: raw.share_link || raw.related_links?.[0]?.link || "",
    title,
    company,
    companyId,
    location,
    salary,
    tags: raw.extensions || [],
    descriptionSnippet: raw.description || "",
    applyUrl,
    postedAt: raw.detected_extensions?.posted_at || null,
    scrapedAt: new Date().toISOString(),
    status: "active",
  };
}

async function searchJobs({ query, location, page = 1 }) {
  if (!env.serpApiKey) {
    throw new Error("SERPAPI_KEY is not configured");
  }

  const start = Math.max(0, (Number(page) - 1) * 10);
  const params = new URLSearchParams({
    engine: "google_jobs",
    q: query || "software engineer",
    location: location || "United States",
    api_key: env.serpApiKey,
    start: String(start),
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;
  const data = await fetchJson(url);
  const results = Array.isArray(data.jobs_results) ? data.jobs_results : [];
  return results.map(mapSerpJob);
}

module.exports = {
  searchJobs,
};

