import { create } from "zustand";

export type Player = "X" | "O" | null;

export interface GameState {
  board: Player[][];             // 9 sous-grilles × 9 cases
  subWinners: Player[];          // gagnant de chaque sous-grille
  globalWinner: Player;          // gagnant final
  currentPlayer: Player;         // X ou O
  activeSubBoard: number | null; // sous-grille imposée
  reset: () => void;
  play: (sub: number, cell: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: Array(9)
    .fill(null)
    .map(() => Array(9).fill(null)),

  subWinners: Array(9).fill(null),

  globalWinner: null,

  currentPlayer: "X",

  activeSubBoard: null, // au début : liberté totale

  play: (sub, cell) => {
    const { board, currentPlayer, activeSubBoard, subWinners, globalWinner } = get();

    // Si la partie est déjà gagnée → on ignore
    if (globalWinner) return;

    // Si une sous-grille est imposée → on empêche de jouer ailleurs
    if (activeSubBoard !== null && activeSubBoard !== sub) return;

    // Si la sous-grille est déjà gagnée → on ignore
    if (subWinners[sub] !== null) return;

    // Si la case est déjà prise → on ignore
    if (board[sub][cell] !== null) return;

    // Copie profonde du board
    const newBoard = board.map((row) => [...row]);

    // On joue
    newBoard[sub][cell] = currentPlayer;

    // Détection de victoire locale
    const winner = checkWin(newBoard[sub]);
    const newSubWinners = [...subWinners];

    if (winner) {
      newSubWinners[sub] = winner;
    }

    // Détection de victoire globale
    const global = checkGlobalWin(newSubWinners);

    // Déterminer la prochaine sous-grille active
    let nextSub: number | null = cell;

    // Si la sous-grille ciblée est pleine ou gagnée → liberté totale
    const targetSub = newBoard[nextSub];
    const isFull = targetSub.every((c) => c !== null);

    if (isFull || newSubWinners[nextSub] !== null) {
      nextSub = null;
    }

    // Mise à jour du store
    set({
      board: newBoard,
      subWinners: newSubWinners,
      globalWinner: global,
      currentPlayer: currentPlayer === "X" ? "O" : "X",
      activeSubBoard: global ? null : nextSub, // si victoire globale → on arrête tout
    });
  },

  reset: () => set({
    board: Array(9).fill(null).map(() => Array(9).fill(null)),
    subWinners: Array(9).fill(null),
    globalWinner: null,
    currentPlayer: "X",
    activeSubBoard: null,
  }),

}));



// --- Détection de victoire locale (dans une sous-grille) ---
function checkWin(cells: Player[]): Player | null {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8], // lignes
    [0,3,6], [1,4,7], [2,5,8], // colonnes
    [0,4,8], [2,4,6],          // diagonales
  ];

  for (const [a, b, c] of lines) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }

  return null;
}

// --- Détection de victoire globale (3 sous-grilles gagnées) ---
function checkGlobalWin(subWinners: Player[]): Player | null {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8], // lignes
    [0,3,6], [1,4,7], [2,5,8], // colonnes
    [0,4,8], [2,4,6],          // diagonales
  ];

  for (const [a, b, c] of lines) {
    if (subWinners[a] && subWinners[a] === subWinners[b] && subWinners[a] === subWinners[c]) {
      return subWinners[a];
    }
  }

  return null;
}
