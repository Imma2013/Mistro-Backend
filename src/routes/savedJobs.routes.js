const express = require("express");

const router = express.Router();
const savedJobs = [];

router.get("/", (req, res) => {
  res.json({ ok: true, data: savedJobs });
});

router.post("/", (req, res) => {
  const payload = {
    id: `saved_${Date.now()}`,
    ...req.body,
    savedAt: new Date().toISOString(),
  };
  savedJobs.push(payload);
  res.status(201).json({ ok: true, data: payload });
});

module.exports = router;

