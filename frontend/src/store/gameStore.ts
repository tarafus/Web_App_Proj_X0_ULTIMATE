import { create } from "zustand";

export type Player = "X" | "O" | null;

export interface GameState {
  board: Player[][]; // 9x9
  currentPlayer: Player;
  play: (sub: number, cell: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: Array(9).fill(null).map(() => Array(9).fill(null)),
  currentPlayer: "X",

  play: (sub, cell) => {
    const { board, currentPlayer } = get();

    // copie profonde
    const newBoard = board.map((row) => [...row]);

    // si la case est déjà prise → on ignore
    if (newBoard[sub][cell] !== null) return;

    newBoard[sub][cell] = currentPlayer;

    set({
      board: newBoard,
      currentPlayer: currentPlayer === "X" ? "O" : "X",
    });
  },
}));