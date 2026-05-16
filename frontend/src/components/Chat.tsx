import { useChatStore } from "../store/chatStore.ts";
import { useAuthStore } from "../store/authStore.ts";
import { useState, useRef, useEffect } from "react";
import "../styles/chat.css";

interface ChatProps {
  onSend: (content: string) => void;
}

export default function Chat({ onSend }: ChatProps) {
  const messages = useChatStore((s) => s.messages);
  const user     = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.slice(0, 40);
    onSend(text);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m) => {
          const mine = m.username === user?.username;
          return (
            <div key={m.id} className={`chat-msg ${mine ? "me" : "opponent"}`}>
              <span className="msg-username">{m.username}</span>
              <span className="msg-text">{m.content}</span>
              <span className="msg-time">
                {new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input">
        <input
          value={input}
          maxLength={40}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}