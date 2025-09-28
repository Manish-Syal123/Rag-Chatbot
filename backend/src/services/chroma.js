const { ChromaClient } = require("chromadb");
const { config } = require("./config");

// Create a dummy embedding function to avoid default one
class DummyEmbeddingFunction {
  async generateEmbeddings() {
    return [];
  }
}

let client;
let collection;

// Helper function to implement exponential backoff for rate limiting
async function withRetry(fn, maxRetries = 5, initialDelay = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      // Check if it's a rate limit error
      if (error.name === 'ChromaRateLimitError' || error.message?.includes('Rate limit exceeded')) {
        retries++;
        if (retries >= maxRetries) {
          console.error(`Max retries (${maxRetries}) reached for ChromaDB operation`);
          throw error;
        }
        
        // Calculate exponential backoff delay with jitter
        const delay = initialDelay * Math.pow(2, retries) + Math.random() * 1000;
        console.log(`ChromaDB rate limit hit, retrying in ${Math.round(delay/1000)}s (attempt ${retries}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Not a rate limit error, rethrow
        throw error;
      }
    }
  }
}

async function getCollection() {
  if (!client) {
    // Configure ChromaDB client with host, port, and ssl
    const chromaUrl = new URL(config.chromaUrl);
    client = new ChromaClient({
      host: chromaUrl.hostname,
      port: chromaUrl.port || (chromaUrl.protocol === 'https:' ? '443' : '80'),
      ssl: chromaUrl.protocol === 'https:',
      headers: {
        'Content-Type': 'application/json',
      },
      fetchOptions: {
        timeout: 60000,
      },
    });
  }
  
  if (!collection) {
    try {
      // Try to get existing collection first with retry logic
      collection = await withRetry(async () => {
        return await client.getCollection({
          name: config.chromaCollection,
          embeddingFunction: new DummyEmbeddingFunction(),
        });
      });
      console.log(`Connected to existing collection: ${config.chromaCollection}`);
    } catch (error) {
      if (error.name === 'ChromaRateLimitError' || error.message?.includes('Rate limit exceeded')) {
        console.error('Failed to connect to ChromaDB due to rate limiting after multiple retries');
        throw error;
      }
      
      console.log(`Creating new collection: ${config.chromaCollection}`);
      // If collection doesn't exist, create it with dummy embedding function and retry logic
      collection = await withRetry(async () => {
        return await client.createCollection({
          name: config.chromaCollection,
          embeddingFunction: new DummyEmbeddingFunction(),
        });
      });
    }
  }
  return collection;
}

async function upsertDocuments(items) {
  // items: [{id, text, metadata, embedding?}]
  const coll = await getCollection();
  await withRetry(async () => {
    await coll.upsert({
      ids: items.map((i) => i.id),
      documents: items.map((i) => i.text),
      metadatas: items.map((i) => i.metadata || {}),
      embeddings: items[0].embedding ? items.map((i) => i.embedding) : undefined,
    });
  });
}

async function similaritySearch(queryEmbedding, topK = 5) {
  const coll = await getCollection();
  const result = await withRetry(async () => {
    return await coll.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    });
  });
  
  const matches = [];
  if (result && result.ids && result.ids[0]) {
    for (let i = 0; i < result.ids[0].length; i++) {
      matches.push({
        id: result.ids[0][i],
        text: result.documents[0][i],
        metadata: result.metadatas?.[0]?.[i] || {},
        distance: result.distances?.[0]?.[i],
      });
    }
  }
  return matches;
}

module.exports = { getCollection, upsertDocuments, similaritySearch };
