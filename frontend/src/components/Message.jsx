import React from "react";
import ReactMarkdown from "react-markdown";
import { UserIcon, BotIcon } from "./IconComponents";

const Message = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "message--user" : "message--bot"}`}>
      {!isUser && (
        <div className="message__avatar message__avatar--bot">
          {/* <img src="/bot.png" alt="Bot" className="message__avatar-icon message__avatar-icon--bot" /> */}
          <img src="/bot.png" alt="Bot" className="header__icon" />
        </div>
      )}
      <div className={`message__content ${isUser ? "message__content--user" : "message__content--bot"}`}>
        {/* <div className="message__role">{isUser ? "You" : "Bot"}:</div> */}
        <div className="message__text">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
      {isUser && (
        <div className="message__avatar message__avatar--user">
          <UserIcon className="message__avatar-icon message__avatar-icon--user" />
        </div>
      )}
    </div>
  );
};

export default Message;
