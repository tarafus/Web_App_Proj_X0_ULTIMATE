import { useGameStore } from "../store/gameStore.ts";
import Cell from "./Cell.tsx";

interface SubBoardProps {
  index: number;
  onMove: (move: { sub: number; cell: number }) => void;
}

export default function SubBoard({ index, onMove }: SubBoardProps) {
  const board = useGameStore((s) => s.board[index]);
  const activeSubBoard = useGameStore((s) => s.activeSubBoard);
  const winner = useGameStore((s) => s.subWinners[index]);
  const globalWinner = useGameStore((s) => s.globalWinner);

  const isActive = activeSubBoard === null || activeSubBoard === index;

  if (globalWinner) {
    return (
      <div className="subboard inactive">
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
      {board.map((value, cellIndex) => (
        <Cell
          key={cellIndex}
          value={value}
          onClick={() =>
            isActive &&
            !winner &&
            onMove({ sub: index, cell: cellIndex })
          }
        />
      ))}

      {winner && (
        <div className={`subboard-winner ${winner === "X" ? "winner-x" : "winner-o"}`}>
          {winner}
        </div>
      )}
    </div>
  );
}
