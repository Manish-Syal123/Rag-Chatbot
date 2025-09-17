require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  sessionTtlSeconds: parseInt(process.env.SESSION_TTL_SECONDS || "86400", 10),
  chromaUrl: process.env.CHROMA_URL || "http://localhost:8000",
  chromaCollection: process.env.CHROMA_COLLECTION || "news_articles",
  hfEmbeddingModel: process.env.HF_EMBEDDING_MODEL || "sentence-transformers/all-MiniLM-L6-v2",
  hfApiKey: process.env.HF_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  jinaApiKey: process.env.JINA_API_KEY || "",
};

module.exports = { config };
