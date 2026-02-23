const express = require("express");

const router = express.Router();

router.post("/push", (req, res) => {
  res.json({
    ok: true,
    data: {
      accepted: true,
      receivedAt: new Date().toISOString(),
    },
  });
});

router.post("/pull", (req, res) => {
  res.json({
    ok: true,
    data: {
      serverTime: new Date().toISOString(),
      changes: [],
    },
  });
});

module.exports = router;

