require("dotenv").config();
const { exec } = require("child_process");
const { promisify } = require("util");
const redis = require("redis");

const execAsync = promisify(exec);

async function waitForServices() {
  console.log("Waiting for services to be ready...");

  // Wait for ChromaDB
  const { config } = require("../src/services/config");
  const axios = require("axios");

  let chromaReady = false;
  let attempts = 0;
  const maxAttempts = 30;

  while (!chromaReady && attempts < maxAttempts) {
    try {
      await axios.get(`${config.chromaUrl}/api/v1/heartbeat`, { timeout: 5000 });
      chromaReady = true;
      console.log("✅ ChromaDB is ready");
    } catch (error) {
      attempts++;
      console.log(`⏳ Waiting for ChromaDB... (${attempts}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!chromaReady) {
    console.log("⚠️ ChromaDB not ready, continuing without ingestion");
    return;
  }

  // Run ingestion if this is the first startup
  try {
    console.log("🚀 Running initial data ingestion...");
    await execAsync("npm run ingest");
    console.log("✅ Data ingestion completed");
  } catch (error) {
    console.log("⚠️ Ingestion failed, continuing:", error.message);
  }
}

async function waitForRedis() {
  let ready = false;
  let attempts = 0;
  const maxAttempts = 30;

  while (!ready && attempts < maxAttempts) {
    try {
      const client = redis.createClient({ url: process.env.REDIS_URL });
      await client.connect();
      await client.ping();
      await client.disconnect();
      ready = true;
      console.log("✅ Redis is ready");
    } catch (err) {
      attempts++;
      console.log(`⏳ Waiting for Redis... (${attempts}/${maxAttempts})`);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }

  if (!ready) {
    console.log("⚠️ Redis not ready, continuing anyway");
  }
}

async function startServer() {
  console.log("🚀 Starting server...");
  const { exec } = require("child_process");

  const server = exec("node index.js", (error, stdout, stderr) => {
    if (error) {
      console.error("Server error:", error);
      return;
    }
  });

  server.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  server.stderr.on("data", (data) => {
    console.error(data.toString());
  });
}

async function main() {
  try {
    // Only run ingestion on first startup or when explicitly requested
    if (process.env.RUN_INGESTION === "true" || process.env.NODE_ENV === "production") {
      await waitForRedis();
      await waitForServices();
    }

    await startServer();
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

main();
