import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/main.scss";

const SessionHistorySidebar = ({ activeSessionId, onSelectSession, onNewChat }) => {
  const [sessions, setSessions] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/session/history`);
        setSessions(response.data.sessions || []);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chat Sessions</h2>
        <button className="new-chat-btn" onClick={onNewChat}>
          New Chat
        </button>
      </div>
      <div className="session-list">
        {sessions.map(({ sessionId, history }) => (
          <div
            key={sessionId}
            className={`session-item ${sessionId === activeSessionId ? "active" : ""}`}
            onClick={() => onSelectSession(sessionId, history)}
          >
            <span className="session-title">Chat {sessionId.slice(0, 8)}</span>
            <span className="message-preview">
              {history.length > 0 ? history[history.length - 1].content.slice(0, 30) + "..." : "No messages"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionHistorySidebar;
