import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { Player } from "../store/gameStore.ts";

interface MovePayload {
  sub: number;
  cell: number;
}


interface GameDTO {
  board: Player[][];
  currentPlayer: Player;
  globalWinner: Player;
  activeSubBoard: number | null;
}


export function useGameWebSocket(
  gameId: number,
  onStateUpdate: (dto: GameDTO) => void,
  onSystemMessage: (msg: string) => void
) {
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");

    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 500,
    });

    client.onConnect = () => {
      // Messages système
      client.subscribe(`/topic/game/${gameId}`, (message: IMessage) => {
        onSystemMessage(message.body);
      });

      // État du jeu
      client.subscribe(`/topic/game/${gameId}/state`, (message: IMessage) => {
        const dto: GameDTO = JSON.parse(message.body);
        onStateUpdate(dto);
      });
    };

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [gameId]);

  const sendJoin = (username: string) => {
    stompClient.current?.publish({
      destination: `/app/game/${gameId}/join`,
      body: username,
    });
  };

  const sendMove = (move: MovePayload) => {
    stompClient.current?.publish({
      destination: `/app/game/${gameId}/move`,
      body: JSON.stringify(move),
    });
  };

  const sendEnd = (winner: string) => {
    stompClient.current?.publish({
      destination: `/app/game/${gameId}/end`,
      body: winner,
    });
  };

  return { sendJoin, sendMove, sendEnd };
}
