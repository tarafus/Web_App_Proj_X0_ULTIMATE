import { create } from "zustand";

export type Player = "X" | "O" | null;

export interface GameState {
  board: Player[][];            // 9 sous-grilles × 9 cases
  subWinners: Player[];         // gagnant de chaque sous-grille
  currentPlayer: Player;        // X ou O
  activeSubBoard: number | null; // sous-grille imposée
  play: (sub: number, cell: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: Array(9)
    .fill(null)
    .map(() => Array(9).fill(null)),

  subWinners: Array(9).fill(null),

  currentPlayer: "X",

  activeSubBoard: null, // au début : liberté totale

  play: (sub, cell) => {
    const { board, currentPlayer, activeSubBoard, subWinners } = get();

    // 1) Si une sous-grille est imposée → on empêche de jouer ailleurs
    if (activeSubBoard !== null && activeSubBoard !== sub) return;

    // 2) Si la sous-grille est déjà gagnée → on ignore
    if (subWinners[sub] !== null) return;

    // 3) Si la case est déjà prise → on ignore
    if (board[sub][cell] !== null) return;

    // 4) Copie profonde du board
    const newBoard = board.map((row) => [...row]);

    // 5) On joue
    newBoard[sub][cell] = currentPlayer;

    // 6) Détection de victoire locale
    const winner = checkWin(newBoard[sub]);
    const newSubWinners = [...subWinners];

    if (winner) {
      newSubWinners[sub] = winner;
    }

    // 7) Déterminer la prochaine sous-grille active
    let nextSub: number | null = cell;

    // Si la sous-grille ciblée est pleine ou gagnée → liberté totale
    const targetSub = newBoard[nextSub];
    const isFull = targetSub.every((c) => c !== null);

    if (isFull || newSubWinners[nextSub] !== null) {
      nextSub = null;
    }

    // 8) Mise à jour du store
    set({
      board: newBoard,
      subWinners: newSubWinners,
      currentPlayer: currentPlayer === "X" ? "O" : "X",
      activeSubBoard: nextSub,
    });
  },
}));

// --- Fonction utilitaire : détection de victoire locale --- ON POURRA LE METTRE DANS LE BACKEND PLUS TARD si besoin
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
