import React, { useState, useRef, useEffect } from "react";
import { SendIcon } from "./IconComponents";

const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about the news..."
        className="chat-input__textarea"
        rows={2}
        disabled={disabled}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        className="chat-input__button"
        aria-label="Send Message"
      >
        {disabled ? "..." : "Send"}
      </button>
    </div>
  );
};

export default ChatInput;
