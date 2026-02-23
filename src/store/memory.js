const jobs = [];
const companies = new Map();
const reviewCache = new Map();

function upsertJobs(items) {
  const byId = new Map(jobs.map((job) => [job.jobId, job]));
  items.forEach((item) => byId.set(item.jobId, item));
  jobs.length = 0;
  jobs.push(...Array.from(byId.values()));
}

function listJobs({ q, location }) {
  return jobs.filter((job) => {
    const qLower = (q || "").toLowerCase();
    const locLower = (location || "").toLowerCase();
    const matchesQ =
      !qLower ||
      job.title.toLowerCase().includes(qLower) ||
      job.company.toLowerCase().includes(qLower) ||
      (job.tags || []).some((tag) => tag.toLowerCase().includes(qLower));
    const matchesLocation = !locLower || job.location.toLowerCase().includes(locLower);
    return matchesQ && matchesLocation;
  });
}

function getJobById(id) {
  return jobs.find((job) => job.jobId === id) || null;
}

function setCompany(companyId, payload) {
  const existing = companies.get(companyId) || {};
  const next = {
    ...existing,
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  companies.set(companyId, next);
  return next;
}

function getCompany(companyId) {
  return companies.get(companyId) || null;
}

function setCompanyReviews(companyId, reviewsPayload) {
  reviewCache.set(companyId, reviewsPayload);
  return setCompany(companyId, { reviews: reviewsPayload });
}

function getCompanyReviews(companyId) {
  return reviewCache.get(companyId) || null;
}

module.exports = {
  upsertJobs,
  listJobs,
  getJobById,
  setCompany,
  getCompany,
  setCompanyReviews,
  getCompanyReviews,
};

