import { create } from "zustand";
import { api } from "../api/api.ts";

export interface Notification {
  id: number;
  type: "invitation" | "declined" | "reminder";
  message: string;
  gameId?: number;
  invitationId?: number;
  fromUsername?: string;
  createdAt?: string;
}

interface NotificationStore {
  notifications: Notification[];
  loadAll: () => Promise<void>;
  add: (notif: Notification) => void;
  dismiss: (id: number) => Promise<void>;
  dismissAll: () => Promise<void>;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  loadAll: async () => {
    try {
      const res = await api.get<Notification[]>("/notifications");
      set({ notifications: res.data });
    } catch (e) {
      console.error("[NotifStore] loadAll failed:", e);
    }
  },

  add: (notif) =>
    set((s) => {
      // Éviter les doublons si le WS envoie une notif déjà présente
      if (s.notifications.some((n) => n.id === notif.id)) return s;
      return { notifications: [notif, ...s.notifications] };
    }),

  dismiss: async (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    try {
      await api.delete(`/notifications/${id}`);
    } catch (e) {
      console.error("[NotifStore] dismiss failed:", e);
    }
  },

  dismissAll: async () => {
    set({ notifications: [] });
    try {
      await api.delete("/notifications");
    } catch (e) {
      console.error("[NotifStore] dismissAll failed:", e);
    }
  },

  clear: () => set({ notifications: [] }),
}));