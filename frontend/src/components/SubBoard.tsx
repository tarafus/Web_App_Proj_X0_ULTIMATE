import { useGameStore } from "../store/gameStore";
import Cell from "./Cell";

interface SubBoardProps {
  index: number;
}

export default function SubBoard({ index }: SubBoardProps) {
  const board = useGameStore((s) => s.board[index]);
  const play = useGameStore((s) => s.play);
  const activeSubBoard = useGameStore((s) => s.activeSubBoard);
  const winner = useGameStore((s) => s.subWinners[index]);

  const isActive = activeSubBoard === null || activeSubBoard === index;

  const globalWinner = useGameStore((s) => s.globalWinner);

  if (globalWinner) {
    return (
      <div className="subboard inactive">
        {/* on affiche quand même le gros X/O local */}
        {winner && (
          <div className={`subboard-winner ${winner === "X" ? "winner-x" : "winner-o"}`}>
            {winner}
          </div>
        )}
      </div>
    );
  }


  return (
    <div className={`subboard ${isActive ? "active" : "inactive"} ${winner ? "won" : ""}`}>
      {/* Cases normales */}
      {board.map((value, cellIndex) => (
        <Cell
          key={cellIndex}
          value={value}
          onClick={() => isActive && !winner && play(index, cellIndex)}
        />
      ))}

      {/* Overlay géant si la sous-grille est gagnée */}
      {winner && (
        <div className={`subboard-winner ${winner === "X" ? "winner-x" : "winner-o"}`}>
          {winner}
        </div>
      )}
    </div>
  );
}
