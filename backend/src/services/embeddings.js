const axios = require("axios");
const { config } = require("./config");

const JINA_API_BASE = "https://api.jina.ai/v1/embeddings";

async function embedTexts(texts) {
  if (!Array.isArray(texts)) throw new Error("embedTexts expects an array of strings");

  console.log(`Embedding ${texts.length} articles using Jina AI...`);

  let retries = 3;
  let embeddings = null;

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

      // Extract embeddings from Jina response format
      embeddings = resp.data.data.map((item) => item.embedding);
    } catch (error) {
      console.error(`Jina embedding failed (${retries} retries left):`, error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      retries--;

      if (retries > 0) {
        // Wait before retry with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 3000 * (4 - retries)));
      } else {
        throw new Error(`Failed to embed articles after 3 retries: ${error.message}`);
      }
    }
  }

  return embeddings;
}

async function embedText(text) {
  const [vec] = await embedTexts([text]);
  return vec;
}

module.exports = { embedText, embedTexts };
