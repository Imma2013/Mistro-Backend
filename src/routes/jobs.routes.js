const express = require("express");
const { listJobs, getJobById, ingestFromSerpApi } = require("../services/jobs.service");

const router = express.Router();

router.get("/", (req, res) => {
  const { q = "", location = "" } = req.query;
  const data = listJobs({ q, location });
  res.json({ ok: true, data });
});

router.get("/search/live", async (req, res, next) => {
  try {
    const { q = "software engineer", location = "United States", page = 1 } = req.query;
    const data = await ingestFromSerpApi({ query: q, location, page: Number(page) || 1 });
    res.json({ ok: true, data, source: "serpapi" });
  } catch (err) {
    next(err);
  }
});

router.post("/ingest", async (req, res, next) => {
  try {
    const { query = "software engineer", location = "United States", page = 1 } = req.body || {};
    const data = await ingestFromSerpApi({ query, location, page: Number(page) || 1 });
    res.status(202).json({ ok: true, data, ingested: data.length });
  } catch (err) {
    next(err);
  }
});

router.post("/scrape", async (req, res, next) => {
  try {
    const { query = "software engineer", location = "United States", page = 1 } = req.body || {};
    const data = await ingestFromSerpApi({ query, location, page: Number(page) || 1 });
    res.status(202).json({ ok: true, data, ingested: data.length });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", (req, res) => {
  const job = getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ ok: false, error: "Job not found" });
  }
  return res.json({ ok: true, data: job });
});

module.exports = router;
