const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { connectDb } = require("./config/db");
const { startRefreshScheduler, stopRefreshScheduler } = require("./services/refreshScheduler.service");

async function start() {
  try {
    await connectDb();
    const server = http.createServer(app);

    server.listen(env.port, () => {
      console.log(`[server] listening on :${env.port}`);
      startRefreshScheduler();
    });

    const shutdown = () => {
      stopRefreshScheduler();
      server.close(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("[server] failed to start", err);
    process.exit(1);
  }
}

start();
