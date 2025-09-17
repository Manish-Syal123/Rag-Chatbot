const { ChromaClient } = require("chromadb");
const { config } = require("./config");

// Create a dummy embedding function to avoid default one
class DummyEmbeddingFunction {
  generateEmbeddings() {
    return [];
  }
}

let client;
let collection;

async function getCollection() {
  if (!client) {
    client = new ChromaClient({ path: config.chromaUrl });
  }
  if (!collection) {
    try {
      // Try to get existing collection first
      collection = await client.getCollection({ name: config.chromaCollection });
    } catch (error) {
      // If collection doesn't exist, create it with dummy embedding function
      collection = await client.createCollection({
        name: config.chromaCollection,
        embeddingFunction: new DummyEmbeddingFunction(),
      });
    }
  }
  return collection;
}

async function upsertDocuments(items) {
  // items: [{id, text, metadata, embedding?}]
  const coll = await getCollection();
  await coll.upsert({
    ids: items.map((i) => i.id),
    documents: items.map((i) => i.text),
    metadatas: items.map((i) => i.metadata || {}),
    embeddings: items[0].embedding ? items.map((i) => i.embedding) : undefined,
  });
}

async function similaritySearch(queryEmbedding, topK = 5) {
  const coll = await getCollection();
  const result = await coll.query({ queryEmbeddings: [queryEmbedding], nResults: topK });
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
