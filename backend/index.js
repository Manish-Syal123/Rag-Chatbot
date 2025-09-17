require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { router: chatRouter } = require("./src/routes/chat");
const { router: sessionRouter } = require("./src/routes/session");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/chat", chatRouter);
app.use("/api/session", sessionRouter);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
