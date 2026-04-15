import SubBoard from "./SubBoard";

export default function Board() {
  return (
    <div className="board">
      {Array.from({ length: 9 }).map((_, i) => (
        <SubBoard key={i} index={i} />
      ))}
    </div>
  );
}