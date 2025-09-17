require("dotenv").config();
const RSSParser = require("rss-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { embedTexts } = require("../src/services/embeddings");
const { upsertDocuments } = require("../src/services/chroma");

const RSS_FEEDS = [
  "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://www.aljazeera.com/xml/rss/all.xml",
];

async function fetchArticleText(url) {
  try {
    const { data: html } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(html);
    const text = $("p").text();
    return text.replace(/\s+/g, " ").trim();
  } catch (e) {
    return "";
  }
}

async function main() {
  const parser = new RSSParser();
  const items = [];
  for (const feed of RSS_FEEDS) {
    const res = await parser.parseURL(feed);
    for (const it of res.items) {
      if (items.length >= 5) break;
      const url = it.link;
      const text = await fetchArticleText(url);
      if (!text || text.length < 300) continue;
      items.push({ id: uuidv4(), text, metadata: { title: it.title || "", source: url } });
      if (items.length >= 5) break;
    }
    if (items.length >= 5) break;
  }

  console.log(`Fetched ${items.length} articles. Embedding...`);
  const embeddings = await embedTexts(items.map((i) => i.text));
  const payload = items.map((i, idx) => ({ ...i, embedding: embeddings[idx] }));
  await upsertDocuments(payload);
  console.log("Ingestion completed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
