import { create } from "zustand";

interface User {
  id: number;
  username: string;
  elo: number;
  wins: number;
  losses: number;
}

interface AuthState {
  token: string | null;
  user: User | null;

  login: (token: string, user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: null,

  login: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));
