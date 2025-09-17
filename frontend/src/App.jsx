import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function App() {
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || "");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`${API_BASE}/api/session/history/${sessionId}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.history || []))
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId || undefined, message: trimmed }),
      });
      const data = await res.json();
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("sessionId", data.sessionId);
      }
      setMessages((m) => [...m, { role: "user", content: trimmed }, { role: "assistant", content: data.answer }]);
      setInput("");
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  }, [API_BASE, input, loading, sessionId]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const resetSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      await fetch(`${API_BASE}/api/session/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } catch {}
    localStorage.removeItem("sessionId");
    setSessionId("");
    setMessages([]);
  }, [sessionId]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">News RAG Chatbot</div>
        <button className="chat-reset" onClick={resetSession} disabled={!sessionId}>
          Reset session
        </button>
      </div>
      <div className="messages" ref={listRef}>
        {messages.map((m, idx) => (
          <div key={idx} className="message">
            <span className="role">{m.role === "user" ? "You" : "Bot"}:</span>
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        ))}
      </div>
      <div className="input-row">
        <textarea
          className="input"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about the news..."
        />
        <button className="send-btn" onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
