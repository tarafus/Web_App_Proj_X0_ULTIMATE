import Board from "../components/Board.tsx";
import Chat from "../components/Chat.tsx";
import { useGameStore } from "../store/gameStore.ts";
import { useUIStore } from "../store/uiStore.ts";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useGameWebSocket } from "../hooks/useGameWebSocket.ts";
import "../styles/game.css";

export default function Game() {
  const { id } = useParams();
  const gameId = Number(id);

  // Zustand getters
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const globalWinner = useGameStore((s) => s.globalWinner);

  // Zustand setters
  const setState = useGameStore((s) => s.setState);
  const setCurrentPlayer = useGameStore((s) => s.setCurrentPlayer);
  const setGlobalWinner = useGameStore((s) => s.setGlobalWinner);
  const setActiveSubBoard = useGameStore((s) => s.setActiveSubBoard);
  const reset = useGameStore((s) => s.reset);

  const chatOpen = useUIStore((s) => s.chatOpen);
  const toggleChat = useUIStore((s) => s.toggleChat);

  // WebSocket hook
  const { sendJoin, sendMove, sendEnd } = useGameWebSocket(
    gameId,
    (dto) => {
      // DTO reçu du backend
      if (dto.board) setState(dto.board);
      if (dto.currentPlayer) setCurrentPlayer(dto.currentPlayer);
      if (dto.globalWinner !== undefined) setGlobalWinner(dto.globalWinner);
      if (dto.activeSubBoard !== undefined) setActiveSubBoard(dto.activeSubBoard);
    },
    (msg) => console.log("System:", msg)
  );

  // Charger l'état initial via REST
  useEffect(() => {
    axios.get(`http://localhost:8080/game/${gameId}`).then((res) => {
      const dto = res.data;

      if (dto.board) setState(dto.board);
      if (dto.currentPlayer) setCurrentPlayer(dto.currentPlayer);
      if (dto.globalWinner !== undefined) setGlobalWinner(dto.globalWinner);
      if (dto.activeSubBoard !== undefined) setActiveSubBoard(dto.activeSubBoard);
    });
  }, [gameId]);

  // Rejoindre la room WebSocket
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) sendJoin(username);
  }, [sendJoin]);

  return (
    <div className="game-page">
      <div className="game-left">
        <h1>Partie</h1>
        <p>Tour de : {currentPlayer}</p>

        {globalWinner && (
          <h2 className="winner-banner">
            Le joueur {globalWinner} a gagné la partie !
          </h2>
        )}

        <Board onMove={sendMove} />

        {globalWinner && (
          <button className="reset-btn" onClick={reset}>
            Nouvelle partie
          </button>
        )}
      </div>

      <div className={`game-right fixed-chat ${chatOpen ? "open" : "closed"}`}>
        <button className="chat-toggle-btn" onClick={toggleChat}>
          {chatOpen ? "→" : "←"}
        </button>

        {chatOpen && <Chat />}
      </div>
    </div>
  );
}
