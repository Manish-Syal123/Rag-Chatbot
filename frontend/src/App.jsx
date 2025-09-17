import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import "./styles/main.scss";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function App() {
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || "");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`${API_BASE}/api/session/history/${sessionId}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.history || []))
      .catch(() => {});
  }, [sessionId]);

  const sendMessage = useCallback(
    async (message) => {
      if (!message || loading) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/chat/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId || undefined, message }),
        });
        const data = await res.json();
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem("sessionId", data.sessionId);
        }
        setMessages((m) => [...m, { role: "user", content: message }, { role: "assistant", content: data.answer }]);
      } catch (e) {
        console.error("Failed to send message:", e);
      } finally {
        setLoading(false);
      }
    },
    [API_BASE, loading, sessionId]
  );

  const resetSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      await fetch(`${API_BASE}/api/session/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } catch (e) {
      console.error("Failed to reset session:", e);
    }
    localStorage.removeItem("sessionId");
    setSessionId("");
    setMessages([]);
  }, [sessionId]);

  return (
    <div className="app">
      <Header sessionId={sessionId} onReset={resetSession} />
      <ChatWindow messages={messages} isLoading={loading} onSendMessage={sendMessage} />
    </div>
  );
}

export default App;
