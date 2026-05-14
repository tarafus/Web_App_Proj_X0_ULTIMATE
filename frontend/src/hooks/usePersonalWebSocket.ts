import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { Notification } from "../store/notificationStore.ts";

export interface PersonalCallbacks {
  onNotification?:       (notif: Notification) => void;
  onInvitationAccepted?: (gameId: number) => void;
  onMatched?:            (gameId: number) => void;
}

export function usePersonalWebSocket(username: string, callbacks: PersonalCallbacks) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!username) return;

    console.log(`[Personal WS] Connecting for ${username}...`);

    const socket = new SockJS(`http://${window.location.hostname}:8080/ws`);
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 1000,
    });

    client.onConnect = () => {
      console.log(`[Personal WS] Connected, subscribing to /topic/user/${username}`);

      client.subscribe(`/topic/user/${username}`, (message: IMessage) => {
        const msg = message.body;
        console.log("[Personal WS] ←", msg);

        if (msg.startsWith("[NOTIF]")) {
          try {
            const json = msg.substring("[NOTIF] ".length);
            const notif: Notification = JSON.parse(json);
            callbacks.onNotification?.(notif);
          } catch (e) {
            console.error("[Personal WS] Failed to parse notification:", e);
          }
        } else if (msg.startsWith("[INVITATION_ACCEPTED]")) {
          const gid = Number(msg.substring("[INVITATION_ACCEPTED] ".length).trim());
          callbacks.onInvitationAccepted?.(gid);
        } else if (msg.startsWith("[MATCHED]")) {
          const gid = Number(msg.substring("[MATCHED] ".length).trim());
          callbacks.onMatched?.(gid);
        }
      });
    };

    client.onStompError = (frame) => console.error("[Personal WS] STOMP error:", frame);
    client.onWebSocketError = (e) => console.error("[Personal WS] WS error:", e);

    client.activate();
    clientRef.current = client;

    return () => {
      console.log(`[Personal WS] Deactivating for ${username}`);
      client.deactivate();
    };
  }, [username]);
}