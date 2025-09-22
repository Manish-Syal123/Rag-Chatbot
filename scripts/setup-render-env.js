#!/usr/bin/env node

/**
 * Render Environment Setup Helper
 * This script helps you prepare environment variables for Render deployment
 */

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log("🚀 Render Deployment Environment Setup\n");

  console.log("This script will help you gather the necessary environment variables for Render deployment.\n");

  // Get API Keys
  const jinaApiKey = await question("Enter your Jina AI API Key: ");
  const geminiApiKey = await question("Enter your Google Gemini API Key: ");

  console.log("\n📋 Environment Variables for Render:\n");
  console.log("Copy these environment variables to your Render service:\n");

  const envVars = [
    { key: "NODE_ENV", value: "production" },
    { key: "JINA_API_KEY", value: jinaApiKey || "your_jina_api_key_here" },
    { key: "GEMINI_API_KEY", value: geminiApiKey || "your_gemini_api_key_here" },
    { key: "CHROMA_COLLECTION", value: "news_articles" },
    { key: "SESSION_TTL_SECONDS", value: "86400" },
    { key: "RUN_INGESTION", value: "true" },
  ];

  envVars.forEach((env) => {
    console.log(`${env.key}=${env.value}`);
  });

  console.log("\n⚠️  IMPORTANT:");
  console.log("- REDIS_URL: Get this from your Redis service on Render");
  console.log("- CHROMA_URL: Get this from your ChromaDB service on Render");
  console.log("- These will be available after you create the services");

  console.log("\n📖 Next Steps:");
  console.log("1. Create Redis service on Render");
  console.log("2. Create ChromaDB service on Render");
  console.log("3. Create Web Service for your backend");
  console.log("4. Add all environment variables to your backend service");
  console.log("5. Deploy and test!");

  console.log("\n📚 For detailed instructions, see DEPLOYMENT.md");

  rl.close();
}

setupEnvironment().catch(console.error);
