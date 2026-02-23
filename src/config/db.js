const mongoose = require("mongoose");
const env = require("./env");

async function connectDb() {
  if (!env.mongodbUri) {
    console.warn("[db] MONGODB_URI not set. Running without DB connection.");
    return;
  }

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("[db] connected");
}

module.exports = { connectDb };

