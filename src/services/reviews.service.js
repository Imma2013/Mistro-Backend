const env = require("../config/env");
const { fetchJson } = require("../utils/http");

async function fetchCompanyReviews({ companyId, companyName }) {
  if (!env.rapidApiKey || !env.rapidApiHost) {
    return {
      companyId,
      companyName,
      source: "mock",
      fetchedAt: new Date().toISOString(),
      reviews: [
        { rating: 4.2, text: "Strong engineering culture and mentorship." },
        { rating: 3.9, text: "Good learning pace, occasional deadline pressure." },
      ],
    };
  }

  const url = `https://${env.rapidApiHost}/company-reviews?company=${encodeURIComponent(
    companyName || companyId
  )}`;
  const data = await fetchJson(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": env.rapidApiKey,
      "x-rapidapi-host": env.rapidApiHost,
    },
  });

  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  return {
    companyId,
    companyName,
    source: "rapidapi",
    fetchedAt: new Date().toISOString(),
    reviews: reviews.slice(0, 25),
  };
}

module.exports = {
  fetchCompanyReviews,
};

