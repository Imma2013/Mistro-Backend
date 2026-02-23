const express = require("express");

const router = express.Router();

router.post("/checkout", (req, res) => {
  res.status(501).json({
    ok: false,
    error: "Stripe checkout not implemented yet.",
  });
});

router.get("/status", (req, res) => {
  res.json({
    ok: true,
    data: {
      tier: "free",
      active: false,
    },
  });
});

module.exports = router;

