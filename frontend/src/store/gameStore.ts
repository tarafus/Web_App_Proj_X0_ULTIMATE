import { create } from "zustand";

export type Player = "X" | "O" | null;

export interface GameState {
  board: Player[][];             
  subWinners: Player[];          
  globalWinner: Player;          
  currentPlayer: Player;         
  activeSubBoard: number | null; 

  // setters WebSocket
  setState: (newBoard: Player[][]) => void;
  setCurrentPlayer: (player: Player) => void;
  setGlobalWinner: (winner: Player) => void;
  setActiveSubBoard: (sub: number | null) => void;
  setSubWinners: (subWinners: Player[]) => void;

  reset: () => void;
  play: (sub: number, cell: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // --- valeurs initiales ---
  board: Array(9).fill(null).map(() => Array(9).fill(null)),
  subWinners: Array(9).fill(null),
  globalWinner: null,
  currentPlayer: "X",
  activeSubBoard: null,

  // --- setters WebSocket ---
  setState: (newBoard) => set({ board: newBoard }),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  setGlobalWinner: (winner) => set({ globalWinner: winner }),
  setActiveSubBoard: (sub) => set({ activeSubBoard: sub }),
  setSubWinners: (subWinners) => set({ subWinners }),

  // --- logique locale ---
  play: (sub, cell) => {
    const { board, currentPlayer, activeSubBoard, subWinners, globalWinner } = get();

    if (globalWinner) return;
    if (activeSubBoard !== null && activeSubBoard !== sub) return;
    if (subWinners[sub] !== null) return;
    if (board[sub][cell] !== null) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[sub][cell] = currentPlayer;

    const winner = checkWin(newBoard[sub]);
    const newSubWinners = [...subWinners];
    if (winner) newSubWinners[sub] = winner;

    const global = checkGlobalWin(newSubWinners);

    let nextSub: number | null = cell;
    const targetSub = newBoard[nextSub];
    const isFull = targetSub.every((c) => c !== null);
    if (isFull || newSubWinners[nextSub] !== null) nextSub = null;

    set({
      board: newBoard,
      subWinners: newSubWinners,
      globalWinner: global,
      currentPlayer: currentPlayer === "X" ? "O" : "X",
      activeSubBoard: global ? null : nextSub,
    });
  },

  reset: () =>
    set({
      board: Array(9).fill(null).map(() => Array(9).fill(null)),
      subWinners: Array(9).fill(null),
      globalWinner: null,
      currentPlayer: "X",
      activeSubBoard: null,
    }),
}));

// --- Détection de victoire locale ---
function checkWin(cells: Player[]): Player | null {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6],
  ];

  for (const [a, b, c] of lines) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }
  return null;
}

// --- Détection de victoire globale ---
function checkGlobalWin(subWinners: Player[]): Player | null {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6],
  ];

  for (const [a, b, c] of lines) {
    if (subWinners[a] && subWinners[a] === subWinners[b] && subWinners[a] === subWinners[c]) {
      return subWinners[a];
    }
  }
  return null;
}
