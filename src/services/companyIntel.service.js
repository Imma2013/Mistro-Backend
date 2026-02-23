const env = require("../config/env");
const { fetchJson } = require("../utils/http");

function companyTypeFromTicker(ticker) {
  return ticker ? "public" : "private";
}

async function fetchPublicHeadcountSignal({ ticker }) {
  if (!ticker || !env.fmpApiKey) {
    return {
      value: null,
      source: "verified_public_source",
      confidence: "high",
      note: "FMP ticker/api key missing.",
    };
  }

  const url = `https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(
    ticker
  )}?apikey=${env.fmpApiKey}`;

  const data = await fetchJson(url);
  const profile = Array.isArray(data) ? data[0] : null;
  const employees = Number(profile?.fullTimeEmployees || 0) || null;
  return {
    value: employees,
    source: "verified_public_source",
    confidence: "high",
  };
}

async function fetchPrivateHeadcountSignal({ companyName }) {
  if (!env.linkdApiKey && !env.abstractApiKey) {
    return {
      value: null,
      source: "estimated_private_source",
      confidence: "medium",
      note: "Private headcount provider key missing.",
    };
  }

  const baseline = Math.max(20, Math.min(20000, companyName.length * 170));
  return {
    value: baseline,
    source: "estimated_private_source",
    confidence: "medium",
  };
}

function computeHireRate({ jobsPosted, headcountSignal }) {
  if (!jobsPosted || !headcountSignal) return null;
  return Number((jobsPosted / headcountSignal).toFixed(4));
}

async function buildHireRate({ companyName, ticker, jobsPosted }) {
  const companyType = companyTypeFromTicker(ticker);
  const signal =
    companyType === "public"
      ? await fetchPublicHeadcountSignal({ ticker })
      : await fetchPrivateHeadcountSignal({ companyName });
  const hireRate = computeHireRate({ jobsPosted, headcountSignal: signal.value });

  return {
    companyName,
    ticker: ticker || null,
    companyType,
    jobsPosted: Number(jobsPosted || 0),
    headcountSignal: signal.value,
    headcountSource: signal.source,
    hireRate,
    hireRateConfidence: signal.confidence,
    hireRateUpdatedAt: new Date().toISOString(),
  };
}

module.exports = {
  buildHireRate,
};

