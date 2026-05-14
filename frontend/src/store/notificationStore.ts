import { create } from "zustand";
import { api } from "../api/api.ts";

export type NotificationType =
  | "invitation"
  | "declined"
  | "reminder"
  | "friend_request"
  | "friend_accepted"
  | "friend_declined";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  gameId?: number;
  invitationId?: number;
  friendshipId?: number;
  fromUsername?: string;
  createdAt?: string;
}

// ─── Persistance localStorage des IDs déjà vus ────────────────────────────
const READ_IDS_KEY = "notif_read_ids";

const loadReadIds = (): Set<number> => {
  try {
    const stored = localStorage.getItem(READ_IDS_KEY);
    if (!stored) return new Set();
    return new Set(JSON.parse(stored));
  } catch {
    return new Set();
  }
};

const saveReadIds = (ids: Set<number>) => {
  try {
    localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
  } catch { /* localStorage indispo */ }
};

interface NotificationStore {
  notifications: Notification[];
  readIds: Set<number>;
  loadAll: () => Promise<void>;
  add: (notif: Notification) => void;
  markAllAsRead: () => void;
  dismiss: (id: number) => Promise<void>;
  dismissAll: () => Promise<void>;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  readIds: loadReadIds(),

  loadAll: async () => {
    try {
      const res = await api.get<Notification[]>("/notifications");
      // Purger les readIds qui ne correspondent plus à aucune notif existante
      const currentIds = new Set(res.data.map((n) => n.id));
      const cleanedReadIds = new Set([...get().readIds].filter((id) => currentIds.has(id)));
      saveReadIds(cleanedReadIds);
      set({ notifications: res.data, readIds: cleanedReadIds });
    } catch (e) {
      console.error("[NotifStore] loadAll failed:", e);
    }
  },

  add: (notif) =>
    set((s) => {
      if (s.notifications.some((n) => n.id === notif.id)) return s;
      return { notifications: [notif, ...s.notifications] };
    }),

  markAllAsRead: () => {
    const ids = new Set(get().notifications.map((n) => n.id));
    saveReadIds(ids);
    set({ readIds: ids });
  },

  dismiss: async (id) => {
    set((s) => {
      const newReadIds = new Set(s.readIds);
      newReadIds.delete(id);
      saveReadIds(newReadIds);
      return {
        notifications: s.notifications.filter((n) => n.id !== id),
        readIds: newReadIds,
      };
    });
    try {
      await api.delete(`/notifications/${id}`);
    } catch (e) {
      console.error("[NotifStore] dismiss failed:", e);
    }
  },

  dismissAll: async () => {
    saveReadIds(new Set());
    set({ notifications: [], readIds: new Set() });
    try {
      await api.delete("/notifications");
    } catch (e) {
      console.error("[NotifStore] dismissAll failed:", e);
    }
  },

  clear: () => {
    saveReadIds(new Set());
    set({ notifications: [], readIds: new Set() });
  },
}));