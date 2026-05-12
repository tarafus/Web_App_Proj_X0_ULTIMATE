import { useChatStore } from "../store/chatStore.ts";
import { useState, useRef, useEffect } from "react";
import "../styles/chat.css";

export default function Chat() {
  const messages = useChatStore((s) => s.messages);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll auto
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Limite stricte à 40 caractères
    const text = input.slice(0, 40);

    sendMessage(text);
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
        {messages.map((m) => (
          <div key={m.id} className={`chat-msg ${m.sender}`}>
            <span className="msg-text">{m.text}</span>
            <span className="msg-time">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          value={input}
          maxLength={40}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message..."
        />
        <button onClick={handleSend}>Envoyer</button>
      </div>
    </div>
  );
}
