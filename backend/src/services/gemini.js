const { GoogleGenerativeAI } = require("@google/generative-ai");
const { config } = require("./config");

let genAI;
function getModel() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAI.getGenerativeModel({ model: config.geminiModel });
}

function buildPrompt(userQuestion, contexts) {
  const header =
    "You are a helpful assistant answering questions using ONLY the provided news context. If the answer is not in context, say you don't know.\n\n";
  const ctx = contexts
    .map((c, idx) => `Source ${idx + 1} (${c.metadata?.source || "unknown"}):\n${c.text}`)
    .join("\n\n");
  const instr = `\n\nQuestion: ${userQuestion}\nAnswer:`;
  return header + ctx + instr;
}

async function generateAnswer(userQuestion, contexts) {
  const model = getModel();
  const prompt = buildPrompt(userQuestion, contexts);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text;
}

module.exports = { generateAnswer };
