import SubBoard from "./SubBoard.tsx";

interface BoardProps {
  onMove: (move: { sub: number; cell: number }) => void;
}

export default function Board({ onMove }: BoardProps) {
  return (
    <div className="board">
      {Array.from({ length: 9 }).map((_, i) => (
        <SubBoard key={i} index={i} onMove={onMove} />
      ))}
    </div>
  );
}
