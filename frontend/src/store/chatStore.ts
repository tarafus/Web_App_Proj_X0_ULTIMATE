import { create } from "zustand";

export interface ChatMessage {
  id: number;
  username: string;
  content: string;
  sentAt: string;
}

interface ChatStore {
  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  clear: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) =>
    set((s) => {
      if (s.messages.some((m) => m.id === msg.id)) return s; // dédupliquer
      return { messages: [...s.messages, msg] };
    }),
  clear: () => set({ messages: [] }),
}));