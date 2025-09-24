import { ResetIcon, BotIcon } from "./IconComponents";

const Header = ({ sessionId, setSessionId, onReset }) => {
  return (
    <header className="header">
      <div className="header__brand">
        {/* <BotIcon className="header__icon" /> */}
        <img src="/bot.png" alt="Bot" className="header__icon" />
        <h1 className="header__title">News RAG Chatbot</h1>
      </div>
      {/* New Session/chat */}
      <button
        onClick={() => {
          setSessionId("");
          localStorage.removeItem("sessionId");
        }}
        className="header__reset-btn"
        aria-label="New Session"
      >
        <ResetIcon className="header__reset-icon" />
        <span>New Session</span>
      </button>
      <button onClick={onReset} disabled={!sessionId} className="header__reset-btn" aria-label="Reset Session">
        <ResetIcon className="header__reset-icon" />
        <span>Reset Session</span>
      </button>
    </header>
  );
};

export default Header;
