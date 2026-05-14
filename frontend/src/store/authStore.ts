// src/store/authStore.ts
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
  loading: boolean;

  login: (token: string, user: User | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: null,
  // Si on a un token au démarrage, on est "en train de charger l'user"
  loading: !!localStorage.getItem("token"),

  login: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user, loading: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, loading: false });
  },

  setLoading: (loading) => set({ loading }),
}));