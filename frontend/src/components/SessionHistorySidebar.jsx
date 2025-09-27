import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/main.scss";
import { Plus } from "lucide-react";
import { MessagesSquare } from "lucide-react";
import { Menu } from "lucide-react";

const SessionHistorySidebar = ({ activeSessionId, onSelectSession, onNewChat }) => {
  const [sessions, setSessions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
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

  const handleSessionSelect = (sessionId, history) => {
    onSelectSession(sessionId, history);
    setIsOpen(false); // Close sidebar on mobile after selection
  };

  const handleNewChat = () => {
    onNewChat();
    setIsOpen(false); // Close sidebar on mobile after new chat
  };

  return (
    <>
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        <Menu size={24} />
      </button>
      <div className={`sidebar-overlay ${isOpen ? "sidebar-open" : ""}`} onClick={() => setIsOpen(false)}></div>
      <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h2>Chat Sessions</h2>
          <button className="new-chat-btn" onClick={handleNewChat}>
            <span>
              <Plus />
            </span>
            <span>New Chat</span>
          </button>
        </div>
        <div className="session-list">
          {sessions.map(({ sessionId, history }) => (
            <div
              key={sessionId}
              className={`session-item ${sessionId === activeSessionId ? "active" : ""}`}
              onClick={() => handleSessionSelect(sessionId, history)}
            >
              <span className="session-title">
                <MessagesSquare size={20} /> {sessionId.slice(0, 8)}
              </span>
              <span className="message-preview">
                {history.length > 0 ? history[history.length - 1].content.slice(0, 30) + "..." : "No messages"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SessionHistorySidebar;
