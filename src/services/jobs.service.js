const { listJobs: listFromStore, getJobById: getFromStore, upsertJobs } = require("../store/memory");
const { searchJobs } = require("./serpapi.service");
const { normalizeJob } = require("./gemini.service");
const { buildHireRate } = require("./companyIntel.service");

const seedJobs = [
  {
    jobId: "northline-labs-seed-1",
    externalId: "seed-1",
    source: "seed",
    sourceUrl: "",
    title: "Senior Frontend Engineer",
    company: "Northline Labs",
    companyId: "northline-labs",
    location: "Dallas, TX (Hybrid)",
    salary: "$145,000 - $175,000",
    tags: ["React", "TypeScript"],
    descriptionSnippet: "Build and scale customer-facing React surfaces.",
    applyUrl: "https://example.com/jobs/job_1",
    postedAt: null,
    scrapedAt: new Date().toISOString(),
    status: "active",
  },
];

upsertJobs(seedJobs);

function listJobs({ q, location }) {
  return listFromStore({ q, location });
}

function getJobById(id) {
  return getFromStore(id);
}

async function getJobStatsById(id) {
  const job = getFromStore(id);
  if (!job) return null;

  const companyJobs = listFromStore({ q: "", location: "" }).filter(
    (item) => item.companyId === job.companyId || item.company.toLowerCase() === job.company.toLowerCase()
  );
  const activePostings = companyJobs.filter((item) => item.status !== "expired").length;

  const hireRateIntel = await buildHireRate({
    companyName: job.company,
    ticker: "",
    jobsPosted: activePostings,
  });

  // Fallback estimate when provider signals are missing.
  const baselineMonthlyHires = Math.max(1, Math.round(activePostings * 0.35));
  const providerMonthlyHires =
    Number.isFinite(hireRateIntel.hireRate) && Number.isFinite(hireRateIntel.headcountSignal)
      ? Math.max(1, Math.round((hireRateIntel.hireRate * hireRateIntel.headcountSignal) / 12))
      : null;

  return {
    jobId: job.jobId,
    companyId: job.companyId,
    monthly_hires: providerMonthlyHires || baselineMonthlyHires,
    active_postings: Math.max(1, activePostings),
    source: providerMonthlyHires ? "hire-rate-derived" : "active-postings-fallback",
    generatedAt: new Date().toISOString(),
  };
}

async function ingestFromSerpApi({ query, location, page }) {
  const rawJobs = await searchJobs({ query, location, page });
  const normalized = await Promise.all(
    rawJobs.map(async (job) => {
      const enriched = await normalizeJob(job);
      return {
        ...job,
        normalized: enriched,
      };
    })
  );

  upsertJobs(normalized);
  return normalized;
}

module.exports = {
  listJobs,
  getJobById,
  getJobStatsById,
  ingestFromSerpApi,
};
