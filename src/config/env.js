const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

module.exports = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "*",
  serpApiKey: process.env.SERPAPI_KEY || "",
  autoRefreshEnabled: String(process.env.AUTO_REFRESH_ENABLED || "true") === "true",
  autoRefreshCron: process.env.AUTO_REFRESH_CRON || "0 3 1 * *",
  autoRefreshQuery: process.env.AUTO_REFRESH_QUERY || "software engineer",
  autoRefreshLocation: process.env.AUTO_REFRESH_LOCATION || "United States",
  autoRefreshPages: Math.max(1, Number(process.env.AUTO_REFRESH_PAGES || 1)),
  autoRefreshCompanyLimit: Math.max(1, Number(process.env.AUTO_REFRESH_COMPANY_LIMIT || 25)),
  enableGeminiNormalization: String(process.env.ENABLE_GEMINI_NORMALIZATION || "false") === "true",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  rapidApiKey: process.env.RAPIDAPI_KEY || "",
  rapidApiHost: process.env.RAPIDAPI_HOST || "",
  rapidGlassdoorHost: process.env.RAPID_GLASSDOOR_HOST || process.env.RAPIDAPI_HOST || "",
  fmpApiKey: process.env.FMP_API_KEY || "",
  linkdApiKey: process.env.LINKDAPI_KEY || "",
  linkdApiHost: process.env.LINKDAPI_HOST || "",
  abstractApiKey: process.env.ABSTRACT_API_KEY || "",
};
