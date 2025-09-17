import React, { useRef, useEffect } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";

const ChatWindow = ({ messages, isLoading, onSendMessage }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-window__messages">
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <Message message={{ id: "loading", role: "assistant", content: "..." }} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-window__input">
        <ChatInput onSend={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatWindow;
