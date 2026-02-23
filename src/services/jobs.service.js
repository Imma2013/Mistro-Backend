const { listJobs: listFromStore, getJobById: getFromStore, upsertJobs } = require("../store/memory");
const { searchJobs } = require("./serpapi.service");
const { normalizeJob } = require("./gemini.service");

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
  ingestFromSerpApi,
};

