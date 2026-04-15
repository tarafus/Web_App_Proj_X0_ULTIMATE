interface CellProps {
  value: "X" | "O" | null;
  onClick: () => void;
}

export default function Cell({ value, onClick }: CellProps) {
  return (
    <button
      className={`cell ${value === "X" ? "x" : value === "O" ? "o" : ""}`}
      onClick={onClick}
    >
      {value}
    </button>
  );
}