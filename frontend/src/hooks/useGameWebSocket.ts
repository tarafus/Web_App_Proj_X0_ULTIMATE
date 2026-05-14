import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { Player } from "../store/gameStore.ts";
import { ChatMessage } from "../store/chatStore.ts";

export interface GameStatePayload {
  board: Player[][];
  subWinners: Player[];
  currentPlayer: Player;
  globalWinner: Player;
  activeSubBoard: number | null;
  sub?: number;
  cell?: number;
}

export function useGameWebSocket(
  gameId: number,
  onStateUpdate: (state: GameStatePayload) => void,
  onSystemMessage: (msg: string) => void,
  onChatMessage: (msg: ChatMessage) => void
) {
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    const socket = new SockJS(`http://${window.location.hostname}:8080/ws`);

    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 500,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/game/${gameId}`, (message: IMessage) => {
        onSystemMessage(message.body);
      });

      client.subscribe(`/topic/game/${gameId}/state`, (message: IMessage) => {
        const state: GameStatePayload = JSON.parse(message.body);
        onStateUpdate(state);
      });

      client.subscribe(`/topic/game/${gameId}/chat`, (message: IMessage) => {
        try {
          const chatMsg: ChatMessage = JSON.parse(message.body);
          onChatMessage(chatMsg);
        } catch (e) {
          console.error("[GameWS] chat parse:", e);
        }
      });
    };

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [gameId]);

  const safePublish = (destination: string, body: string) => {
    const client = stompClient.current;
    if (!client || !client.connected) return;
    try {
      client.publish({ destination, body });
    } catch (e) {
      console.warn("Publish failed:", e);
    }
  };

  const sendJoin = (username: string) =>
    safePublish(`/app/game/${gameId}/join`, username);

  const sendState = (state: GameStatePayload) =>
    safePublish(`/app/game/${gameId}/move`, JSON.stringify(state));

  const sendLeave = (username: string) =>
    safePublish(`/app/game/${gameId}/leave`, username);

  const sendEnd = (winner: string) =>
    safePublish(`/app/game/${gameId}/end`, winner);

  const sendAbandon = (username: string) =>
    safePublish(`/app/game/${gameId}/abandon`, username);

  const sendChatMessage = (username: string, content: string) =>
    safePublish(`/app/game/${gameId}/chat`, JSON.stringify({ username, content }));

  const sendRematchRequest = (username: string) =>
    safePublish(`/app/game/${gameId}/rematch/request`, username);

  const sendRematchAccept = (username: string) =>
    safePublish(`/app/game/${gameId}/rematch/accept`, username);

  const sendRematchDecline = (username: string) =>
    safePublish(`/app/game/${gameId}/rematch/decline`, username);

  return {
    sendJoin,
    sendState,
    sendLeave,
    sendEnd,
    sendAbandon,
    sendChatMessage,
    sendRematchRequest,
    sendRematchAccept,
    sendRematchDecline,
  };
}