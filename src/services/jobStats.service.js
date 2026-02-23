const env = require("../config/env");
const { fetchJson } = require("../utils/http");

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function withinLastYears(value, years) {
  const date = toDate(value);
  if (!date) return true;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return date >= cutoff;
}

function parseApplicantCount(raw) {
  if (raw == null) return 0;
  const text = String(raw).trim();
  if (!text) return 0;
  if (/\+$/.test(text)) {
    const base = Number(text.replace(/[^0-9]/g, "")) || 0;
    return Math.round(base * 1.25);
  }
  return Number(text.replace(/[^0-9]/g, "")) || 0;
}

async function fetchGlassdoorInterviews({ companyName, jobTitle }) {
  if (!env.rapidApiKey || !env.rapidGlassdoorHost) {
    return [
      { outcome: "Offer Accepted", date: "2025-12-01" },
      { outcome: "No Offer", date: "2025-11-20" },
      { outcome: "Offer Declined", date: "2025-10-10" },
      { outcome: "No Offer", date: "2025-09-18" },
      { outcome: "No Offer", date: "2025-08-05" },
      { outcome: "Offer Accepted", date: "2025-07-14" },
    ];
  }

  const url = `https://${env.rapidGlassdoorHost}/interviews?company=${encodeURIComponent(
    companyName
  )}&jobTitle=${encodeURIComponent(jobTitle)}`;
  const data = await fetchJson(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": env.rapidApiKey,
      "x-rapidapi-host": env.rapidGlassdoorHost,
    },
  });
  return Array.isArray(data?.interviews) ? data.interviews : [];
}

async function fetchApplicantCount({ companyName, jobTitle }) {
  if (!env.linkdApiKey || !env.linkdApiHost) {
    return { applicantCount: 250, raw: "200+", source: "fallback" };
  }

  const url = `https://${env.linkdApiHost}/jobs/search?companyName=${encodeURIComponent(
    companyName
  )}&keywords=${encodeURIComponent(jobTitle)}&limit=1`;
  const data = await fetchJson(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.linkdApiKey}`,
    },
  });

  const job = Array.isArray(data?.jobs) ? data.jobs[0] : data?.job || null;
  const raw = job?.num_applicants || job?.applicantCount || 0;
  return {
    applicantCount: parseApplicantCount(raw),
    raw,
    source: "linkdapi",
  };
}

function calculateInterviewOfferRate(interviews) {
  const recent = interviews.filter((item) => withinLastYears(item.date || item.createdAt, 2));
  const totalInterviews = recent.length;
  if (totalInterviews < 5) {
    return {
      value: null,
      label: "Not enough data",
      totalInterviews,
      offersMade: 0,
    };
  }

  const offersMade = recent.filter((item) => {
    const outcome = String(item.outcome || "").toLowerCase();
    return outcome.includes("accepted") || outcome.includes("declined");
  }).length;

  const value = Number(((offersMade / totalInterviews) * 100).toFixed(1));
  return {
    value,
    label: `${value}%`,
    totalInterviews,
    offersMade,
  };
}

function calculateApplicantSelectivityRate({ applicantCount, hiresEstimate = 1 }) {
  if (!applicantCount) {
    return {
      value: null,
      label: "Not enough data",
      applicantCount: 0,
      hiresEstimate,
    };
  }

  const value = Number(((hiresEstimate / applicantCount) * 100).toFixed(2));
  return {
    value,
    label: `${value}%`,
    applicantCount,
    hiresEstimate,
  };
}

async function buildJobSpecificStats({ companyName, jobTitle }) {
  const [interviews, applicants] = await Promise.all([
    fetchGlassdoorInterviews({ companyName, jobTitle }),
    fetchApplicantCount({ companyName, jobTitle }),
  ]);

  const interviewSuccess = calculateInterviewOfferRate(interviews);
  const selectivity = calculateApplicantSelectivityRate({
    applicantCount: applicants.applicantCount,
    hiresEstimate: 1,
  });

  return {
    companyName,
    jobTitle,
    interview_success_rate: interviewSuccess,
    applicant_selectivity_rate: selectivity,
    applicant_count_raw: applicants.raw,
    sources: {
      interviews: env.rapidGlassdoorHost ? "rapid-glassdoor" : "fallback-mock",
      applicants: applicants.source,
    },
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  buildJobSpecificStats,
};

