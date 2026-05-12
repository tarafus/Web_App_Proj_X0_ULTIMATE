import { create } from "zustand";

export interface ChatMessage {
    id: number;
    sender: "me" | "opponent";
    text: string;
    timestamp: number;
}

interface ChatState {
    messages: ChatMessage[];
    sendMessage: (text: string) => void;
    receiveMessage: (text: string) => void; // pour WebSocket plus tard
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [
        {
            id: 1,
            sender: "opponent",
            text: "Salut, prêt pour la partie ?",
            timestamp: Date.now() - 60000,
        },
        {
            id: 2,
            sender: "me",
            text: "Oui, je suis chaud !",
            timestamp: Date.now() - 55000,
        },
        {
            id: 3,
            sender: "opponent",
            text: "Ton dernier coup était pas mal.",
            timestamp: Date.now() - 40000,
        },
        {
            id: 4,
            sender: "me",
            text: "Merci haha j’essaie !",
            timestamp: Date.now() - 30000,
        },
        {
            id: 5,
            sender: "opponent",
            text: "Cette partie va être serrée.",
            timestamp: Date.now() - 15000,
        },
        {
            id: 6,
            sender: "me",
            text: "On va voir ça !",
            timestamp: Date.now() - 5000,
        },
        {
            id: 7,
            sender: "opponent",
            text: "T'es une grosse merde !",
            timestamp: Date.now(),
        },
    ],


    sendMessage: (text) => {
        const newMsg: ChatMessage = {
            id: Date.now(),
            sender: "me",
            text,
            timestamp: Date.now(),
        };

        set({ messages: [...get().messages, newMsg] });
    },

    receiveMessage: (text) => {
        const newMsg: ChatMessage = {
            id: Date.now(),
            sender: "opponent",
            text,
            timestamp: Date.now(),
        };

        set({ messages: [...get().messages, newMsg] });
    },
}));
