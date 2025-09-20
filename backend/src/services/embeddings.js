const axios = require("axios");
const { config } = require("./config");

const JINA_API_BASE = "https://api.jina.ai/v1/embeddings";

async function embedTexts(texts) {
  if (!Array.isArray(texts)) throw new Error("embedTexts expects an array of strings");
  if (!config.jinaApiKey) throw new Error("JINA_API_KEY is required but not set");

  console.log(`Embedding ${texts.length} articles using Jina AI...`);

  let retries = 3;
  let embeddings = null;
  let lastError = null;

  while (retries > 0 && !embeddings) {
    try {
      const resp = await axios.post(
        JINA_API_BASE,
        {
          model: "jina-embeddings-v3",
          task: "text-matching",
          input: texts,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.jinaApiKey}`,
          },
          timeout: 120000,
        }
      );

      if (!resp.data || !resp.data.data) {
        throw new Error("Invalid response format from Jina AI API");
      }

      // Extract embeddings from Jina response format
      embeddings = resp.data.data.map((item) => {
        if (!item.embedding || !Array.isArray(item.embedding)) {
          throw new Error(`Invalid embedding format for item ${item.index}`);
        }
        return item.embedding;
      });
    } catch (error) {
      lastError = error;
      console.error(`Jina embedding failed (${retries} retries left):`, error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      retries--;

      if (retries > 0) {
        // Wait before retry with exponential backoff
        const delay = 3000 * (4 - retries);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  if (!embeddings) {
    throw new Error(`Failed to embed articles after 3 retries: ${lastError.message}`);
  }

  return embeddings;
}

async function embedText(text) {
  if (typeof text !== "string") throw new Error("embedText expects a string");
  const [vec] = await embedTexts([text]);
  return vec;
}

module.exports = { embedText, embedTexts };
