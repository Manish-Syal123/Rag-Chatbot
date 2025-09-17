const express = require("express");
const { clearHistory, getHistory } = require("../services/redis");

const router = express.Router();

router.post("/reset", async (req, res, next) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: "sessionId is required" });
    await clearHistory(sessionId);
    res.json({ sessionId, cleared: true });
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
