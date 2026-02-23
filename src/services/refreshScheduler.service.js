const cron = require("node-cron");
const env = require("../config/env");
const { ingestFromSerpApi, listJobs } = require("./jobs.service");
const { fetchCompanyReviews } = require("./reviews.service");
const { buildHireRate } = require("./companyIntel.service");
const { setCompany, setCompanyReviews } = require("../store/memory");

let monthlyTask = null;

function uniqueCompaniesFromJobs(jobs) {
  const map = new Map();
  jobs.forEach((job) => {
    if (!job.companyId || !job.company) return;
    if (!map.has(job.companyId)) {
      map.set(job.companyId, {
        companyId: job.companyId,
        companyName: job.company,
        sampleJobTitle: job.title || "Software Engineer",
      });
    }
  });
  return Array.from(map.values());
}

async function refreshMonthlyData() {
  const startedAt = new Date().toISOString();
  const pages = Math.max(1, env.autoRefreshPages);
  console.log(`[refresh] monthly refresh started at ${startedAt}`);

  if (env.serpApiKey) {
    for (let page = 1; page <= pages; page += 1) {
      try {
        await ingestFromSerpApi({
          query: env.autoRefreshQuery,
          location: env.autoRefreshLocation,
          page,
        });
      } catch (err) {
        console.error(`[refresh] job ingest failed for page ${page}`, err.message);
      }
    }
  } else {
    console.warn("[refresh] skipped SerpAPI ingest (SERPAPI_KEY missing)");
  }

  const jobs = listJobs({ q: "", location: "" });
  const companies = uniqueCompaniesFromJobs(jobs).slice(0, env.autoRefreshCompanyLimit);

  await Promise.all(
    companies.map(async ({ companyId, companyName }) => {
      try {
        const reviews = await fetchCompanyReviews({ companyId, companyName });
        setCompanyReviews(companyId, reviews);
      } catch (err) {
        console.error(`[refresh] reviews refresh failed for ${companyName}`, err.message);
      }
    })
  );

  await Promise.all(
    companies.map(async ({ companyId, companyName }) => {
      try {
        const companyJobs = jobs.filter((job) => job.companyId === companyId);
        const hireRate = await buildHireRate({
          companyName,
          ticker: "",
          jobsPosted: companyJobs.length,
        });
        setCompany(companyId, { hireRate });
      } catch (err) {
        console.error(`[refresh] hire-rate refresh failed for ${companyName}`, err.message);
      }
    })
  );

  console.log(
    `[refresh] monthly refresh completed. jobs=${jobs.length} companies=${companies.length} at ${new Date().toISOString()}`
  );
}

function startRefreshScheduler() {
  if (!env.autoRefreshEnabled) {
    console.log("[refresh] monthly scheduler disabled by AUTO_REFRESH_ENABLED=false");
    return;
  }
  if (!cron.validate(env.autoRefreshCron)) {
    console.warn(`[refresh] invalid AUTO_REFRESH_CRON: ${env.autoRefreshCron}. Scheduler disabled.`);
    return;
  }

  monthlyTask = cron.schedule(env.autoRefreshCron, () => {
    refreshMonthlyData().catch((err) => {
      console.error("[refresh] monthly refresh failed", err);
    });
  });

  // Warm once at boot so deployments have fresh data quickly.
  refreshMonthlyData().catch((err) => {
    console.error("[refresh] initial refresh failed", err);
  });

  console.log(`[refresh] scheduler started with cron "${env.autoRefreshCron}" (server timezone)`);
}

function stopRefreshScheduler() {
  if (monthlyTask) {
    monthlyTask.stop();
    monthlyTask = null;
  }
}

module.exports = {
  startRefreshScheduler,
  stopRefreshScheduler,
  refreshMonthlyData,
};

