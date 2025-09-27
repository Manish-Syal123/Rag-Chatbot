import ReactMarkdown from "react-markdown";
import { BotMessageSquare, User } from "lucide-react";

const Message = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "message--user" : "message--bot"}`}>
      {!isUser && (
        <div className="message__avatar message__avatar--bot">
          <BotMessageSquare />
        </div>
      )}
      <div className={`message__content ${isUser ? "message__content--user" : "message__content--bot"}`}>
        <div className="message__text">
          {typeof message.content === "string" ? <ReactMarkdown>{message.content}</ReactMarkdown> : message.content}
        </div>
      </div>
      {isUser && (
        <div className="message__avatar message__avatar--user">
          <User />
        </div>
      )}
    </div>
  );
};

export default Message;
