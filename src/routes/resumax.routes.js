const express = require("express");
const { requirePaid, getPlan } = require("../middleware/planGate");
const {
  computeMatchScore,
  optimizeResumeStrict,
  exportOptimizedResume,
} = require("../services/resumax.service");

const router = express.Router();

router.post("/score", (req, res) => {
  const { resumeText = "", jobDescription = "", userCategory = "tech" } = req.body || {};
  const data = computeMatchScore({ resumeText, jobDescription, userCategory });
  res.json({
    ok: true,
    plan: getPlan(req),
    data,
  });
});

router.post("/optimize", requirePaid, (req, res) => {
  const { resumeText = "", jobDescription = "" } = req.body || {};
  const data = optimizeResumeStrict({ resumeText, jobDescription });
  res.json({
    ok: true,
    plan: getPlan(req),
    data,
  });
});

router.post("/export", requirePaid, (req, res) => {
  const { optimizedText = "", format = "txt" } = req.body || {};
  const data = exportOptimizedResume({ optimizedText, format });
  res.json({
    ok: true,
    plan: getPlan(req),
    data,
  });
});

module.exports = router;

