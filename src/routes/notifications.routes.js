const express = require("express");

const router = express.Router();

const notifications = [
  { id: "n1", text: "Northline Labs viewed your profile.", isRead: false },
  { id: "n2", text: "New job alert: Frontend Engineer in Dallas, TX.", isRead: false },
];

router.get("/", (req, res) => {
  res.json({ ok: true, data: notifications });
});

router.post("/read-all", (req, res) => {
  notifications.forEach((item) => {
    item.isRead = true;
  });
  res.json({ ok: true, data: { updated: notifications.length } });
});

module.exports = router;

