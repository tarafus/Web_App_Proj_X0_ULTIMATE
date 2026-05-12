import { create } from "zustand";

interface UIState {
  chatOpen: boolean;
  toggleChat: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  chatOpen: true,
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
}));
