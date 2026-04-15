import Board from "../components/Board";
import { useGameStore } from "../store/gameStore";
import "../styles/board.css";

export default function Game() {
  const currentPlayer = useGameStore((s) => s.currentPlayer);

  return (
    <div className="game-container">
      <h1>Partie</h1>
      <p>Tour de : {currentPlayer}</p>

      <Board />
    </div>
  );
}