import { ResetIcon, BotIcon } from "./IconComponents";
import { TimerReset } from "lucide-react";

const Header = ({ sessionId, setSessionId, onReset }) => {
  return (
    <header className="header">
      <div className="header__brand">
        <img src="/bot.png" alt="Bot" className="header__icon" />
        <h1 className="header__title">News RAG Chatbot</h1>
      </div>
      <button onClick={onReset} disabled={!sessionId} className="header__reset-btn" aria-label="Reset Session">
        <TimerReset size={15} />
        <span>Reset Session</span>
      </button>
    </header>
  );
};

export default Header;
