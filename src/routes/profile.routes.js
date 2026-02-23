const express = require("express");

const router = express.Router();

let profile = {
  id: "user_local",
  name: "Lloyd Eb-Nchenge",
  title: "Frontend Engineer",
  location: "Mansfield, Texas",
  updatedAt: new Date().toISOString(),
};

router.get("/", (req, res) => {
  res.json({ ok: true, data: profile });
});

router.put("/", (req, res) => {
  profile = {
    ...profile,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json({ ok: true, data: profile });
});

module.exports = router;

