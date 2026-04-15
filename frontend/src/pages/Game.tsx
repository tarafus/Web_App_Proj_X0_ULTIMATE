import Board from "../components/Board";
import { useGameStore } from "../store/gameStore";
import "../styles/board.css";

export default function Game() {
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const globalWinner = useGameStore((s) => s.globalWinner);
  const reset = useGameStore((s) => s.reset);

  


  return (
    <div className="game-container">
      <h1>Partie</h1>
      <p>Tour de : {currentPlayer}</p>

      <Board />
      {globalWinner && (
        <h2 className="winner-banner">
          Le joueur {globalWinner} a gagné la partie !
        </h2>
      )}
      {globalWinner && (
        <button className="reset-btn" onClick={reset}>
          Nouvelle partie
        </button>
      )}

    </div>
  );
}