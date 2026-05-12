import { create } from "zustand";

export interface Player {
  id: number;
  username: string;
}

export interface Invitation {
  id: number;
  from: Player;
  to: Player;
}

interface LobbyState {
  onlinePlayers: Player[];
  receivedInvitations: Invitation[];
  sentInvitations: Invitation[];

  sendInvitation: (toId: number) => void;
  acceptInvitation: (invId: number) => void;
  declineInvitation: (invId: number) => void;
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  onlinePlayers: [
    { id: 1, username: "Alex" },
    { id: 2, username: "Sam" },
    { id: 3, username: "Lina" },
  ],

  receivedInvitations: [
    { id: 1, from: { id: 1, username: "Alex" }, to: { id: 99, username: "Yui" } },
  ],

  sentInvitations: [],

  sendInvitation: (toId) => {
    const { onlinePlayers, sentInvitations } = get();
    const target = onlinePlayers.find((p) => p.id === toId);
    if (!target) return;

    const newInv = {
      id: Date.now(),
      from: { id: 99, username: "Yui" },
      to: target,
    };

    set({
      sentInvitations: [...sentInvitations, newInv],
    });
  },

  acceptInvitation: (invId) => {
    const { receivedInvitations } = get();
    const inv = receivedInvitations.find((i) => i.id === invId);
    if (!inv) return;

    // plus tard : appeler backend → créer partie → navigate(`/game/${id}`)
    console.log("Invitation acceptée :", inv);

    set({
      receivedInvitations: receivedInvitations.filter((i) => i.id !== invId),
    });
  },

  declineInvitation: (invId) => {
    const { receivedInvitations } = get();
    set({
      receivedInvitations: receivedInvitations.filter((i) => i.id !== invId),
    });
  },
}));
