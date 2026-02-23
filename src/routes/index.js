const express = require("express");
const jobsRoutes = require("./jobs.routes");
const savedJobsRoutes = require("./savedJobs.routes");
const profileRoutes = require("./profile.routes");
const notificationsRoutes = require("./notifications.routes");
const billingRoutes = require("./billing.routes");
const syncRoutes = require("./sync.routes");
const companiesRoutes = require("./companies.routes");
const resumaxRoutes = require("./resumax.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "astrid-backend",
    timestamp: new Date().toISOString(),
  });
});

router.use("/jobs", jobsRoutes);
router.use("/saved-jobs", savedJobsRoutes);
router.use("/profile", profileRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/billing", billingRoutes);
router.use("/sync", syncRoutes);
router.use("/companies", companiesRoutes);
router.use("/resumax", resumaxRoutes);

module.exports = router;
