import { useGameStore } from "../store/gameStore";
import Cell from "./Cell";

interface SubBoardProps {
  index: number;
}

export default function SubBoard({ index }: SubBoardProps) {
  const board = useGameStore((s) => s.board[index]);
  const play = useGameStore((s) => s.play);

  return (
    <div className="subboard">
      {board.map((value, cellIndex) => (
        <Cell
          key={cellIndex}
          value={value}
          onClick={() => play(index, cellIndex)}
        />
      ))}
    </div>
  );
}