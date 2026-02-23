function getPlan(req) {
  return String(req.headers["x-user-plan"] || "free").toLowerCase();
}

function requirePaid(req, res, next) {
  const plan = getPlan(req);
  if (plan === "paid" || plan === "pro") return next();
  return res.status(402).json({
    ok: false,
    error: "Paid plan required for this feature.",
  });
}

module.exports = {
  getPlan,
  requirePaid,
};

