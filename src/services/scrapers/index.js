async function runScrapeJob({ source }) {
  return {
    source,
    startedAt: new Date().toISOString(),
    status: "queued",
    message: "Scraper adapter not implemented yet.",
  };
}

module.exports = { runScrapeJob };

