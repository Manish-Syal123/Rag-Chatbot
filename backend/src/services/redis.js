const { createClient } = require("redis");
const { config } = require("./config");

const redis = createClient({ url: config.redisUrl });
redis.on("error", (err) => console.error("Redis Client Error", err));

let connected = false;
async function ensureRedis() {
  if (!connected) {
    await redis.connect();
    connected = true;
  }
  return redis;
}

const sessionKey = (sessionId) => `session:${sessionId}:history`;

async function getHistory(sessionId) {
  const client = await ensureRedis();
  const raw = await client.get(sessionKey(sessionId));
  return raw ? JSON.parse(raw) : [];
}

//get whole/ all session history
async function getAllSessionsHistory() {
  const client = await ensureRedis();
  const keys = await client.keys("session:*:history");
  const sessions = await Promise.all(
    keys.map(async (key) => {
      const sessionId = key.split(":")[1];
      const history = await getHistory(sessionId);
      return { sessionId, history };
    })
  );
  return sessions;
}

async function appendMessage(sessionId, role, content) {
  const client = await ensureRedis();
  const history = await getHistory(sessionId);
  history.push({ role, content, ts: Date.now() });
  await client.set(sessionKey(sessionId), JSON.stringify(history), {
    EX: config.sessionTtlSeconds,
  });
  return history;
}

async function clearHistory(sessionId) {
  const client = await ensureRedis();
  await client.del(sessionKey(sessionId));
}

module.exports = { ensureRedis, getHistory, getAllSessionsHistory, appendMessage, clearHistory };
