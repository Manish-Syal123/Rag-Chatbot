const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { appendMessage, getHistory } = require("../services/redis");
const { embedText } = require("../services/embeddings");
const { similaritySearch } = require("../services/chroma");
const { generateAnswer } = require("../services/gemini");

const router = express.Router();

router.post("/message", async (req, res, next) => {
  try {
    const { sessionId: providedSessionId, message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }
    const sessionId = providedSessionId || uuidv4();

    await appendMessage(sessionId, "user", message);

    const queryEmbedding = await embedText(message);
    const contexts = await similaritySearch(queryEmbedding, 5);

    const answer = await generateAnswer(message, contexts);

    await appendMessage(sessionId, "assistant", answer);

    res.json({ sessionId, answer, contexts });
  } catch (err) {
    next(err);
  }
});

router.get("/history/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const history = await getHistory(sessionId);
    res.json({ sessionId, history });
  } catch (err) {
    next(err);
  }
});

module.exports = { router };
