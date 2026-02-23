function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    ok: false,
    error: message,
  });
}

module.exports = { errorHandler };

