const express = require("express");
const { listJobs } = require("../store/memory");
const { buildHireRate } = require("../services/companyIntel.service");
const { fetchCompanyReviews } = require("../services/reviews.service");
const { buildJobSpecificStats } = require("../services/jobStats.service");
const { getCompanyReviews, setCompanyReviews, setCompany } = require("../store/memory");

const router = express.Router();

router.get("/:companyId/reviews", async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const companyName = req.query.companyName || companyId;
    const cached = getCompanyReviews(companyId);
    if (cached) return res.json({ ok: true, data: cached, cached: true });

    const reviews = await fetchCompanyReviews({ companyId, companyName });
    setCompanyReviews(companyId, reviews);
    return res.json({ ok: true, data: reviews, cached: false });
  } catch (err) {
    return next(err);
  }
});

router.get("/:companyId/hire-rate", async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const companyName = req.query.companyName || companyId;
    const ticker = req.query.ticker || "";
    const jobsPosted = listJobs({ q: "", location: "" }).filter(
      (job) => job.companyId === companyId || job.company.toLowerCase() === companyName.toLowerCase()
    ).length;

    const result = await buildHireRate({
      companyName,
      ticker,
      jobsPosted,
    });

    setCompany(companyId, { hireRate: result });
    return res.json({ ok: true, data: result });
  } catch (err) {
    return next(err);
  }
});

router.get("/:companyId/job-stats", async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const companyName = req.query.companyName || companyId;
    const jobTitle = req.query.jobTitle || "Software Engineer";
    const data = await buildJobSpecificStats({ companyName, jobTitle });
    setCompany(companyId, { jobStats: data });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
