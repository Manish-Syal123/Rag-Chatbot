import React, { useRef, useEffect } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";
import { Loader } from "lucide-react";

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
        <Message key={90} message={{ content: "Hello! How can I help you with the news today?" }} />
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <Message
            message={{
              id: "loading",
              role: "assistant",
              content: (
                <>
                  Thinking <Loader className="spinner" />
                </>
              ),
            }}
          />
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
