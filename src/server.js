const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { connectDb } = require("./config/db");

async function start() {
  try {
    await connectDb();
    const server = http.createServer(app);

    server.listen(env.port, () => {
      console.log(`[server] listening on :${env.port}`);
    });
  } catch (err) {
    console.error("[server] failed to start", err);
    process.exit(1);
  }
}

start();

