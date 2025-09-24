import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import "./styles/main.scss";
import SessionHistorySidebar from "./components/SessionHistorySidebar";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function App() {
  const [sessionId, setSessionId] = useState(localStorage.getItem("activeSessionId") || "");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allSessions, setAllSessions] = useState([]);

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
          // // Get existing session IDs from localStorage and parse them
          // let existingIds = JSON.parse(localStorage.getItem("sessionId")) || [];
          // // Add the new session ID
          // existingIds.push(data.sessionId);
          // // Save the updated array back to localStorage
          // localStorage.setItem("sessionId", JSON.stringify(existingIds));

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

  const createNewChat = useCallback(async () => {
    setSessionId("");
    setMessages([]);
    localStorage.removeItem("activeSessionId");
  }, []);

  const selectSession = useCallback((id, history) => {
    setSessionId(id);
    setMessages(history || []);
    localStorage.setItem("activeSessionId", id);
  }, []);

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
    localStorage.removeItem("activeSessionId");
    setSessionId("");
    setMessages([]);
  }, [sessionId]);

  return (
    <div className="app">
      <SessionHistorySidebar activeSessionId={sessionId} onSelectSession={selectSession} onNewChat={createNewChat} />
      <div className="main-content">
        <Header sessionId={sessionId} setSessionId={setSessionId} onReset={resetSession} />
        <ChatWindow messages={messages} isLoading={loading} onSendMessage={sendMessage} />
      </div>
    </div>
  );
}

export default App;
