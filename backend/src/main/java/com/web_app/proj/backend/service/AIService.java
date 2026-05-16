package com.web_app.proj.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Service;

/**
 * Service stateless qui calcule le meilleur coup de l'IA pour Morpion Ultimate.
 *
 * Algorithme : Minimax avec élagage Alpha-Bêta.
 * La fonction d'évaluation considère :
 *   - Sous-grilles gagnées (+/- 100)
 *   - Menaces dans les sous-grilles (alignements de 2 avec case libre, +/- 5)
 *   - Alignements sur la méta-grille (×10)
 *   - Bonus centre méta-grille
 *   - Bonus centres des sous-grilles
 *
 * Profondeurs par difficulté :
 *   EASY   = 1   (regarde seulement le coup immédiat)
 *   MEDIUM = 3
 *   HARD   = 5
 */
@Service
public class AIService {

    private static final int WIN_SCORE  = 100_000;
    private static final int LOSS_SCORE = -100_000;
    private static final Random RANDOM  = new Random();

    /** Les 8 alignements possibles sur une grille 3x3 (lignes, colonnes, diagonales). */
    private static final int[][] LINES = {
            {0, 1, 2}, {3, 4, 5}, {6, 7, 8},   // lignes
            {0, 3, 6}, {1, 4, 7}, {2, 5, 8},   // colonnes
            {0, 4, 8}, {2, 4, 6}               // diagonales
    };

    /** Représente un coup : (sub-grille, cellule). */
    public static class Move {
        public final int sub;
        public final int cell;
        public Move(int sub, int cell) {
            this.sub = sub;
            this.cell = cell;
        }
    }

    /** Point d'entrée : calcule le meilleur coup pour l'IA. */
    public Move computeMove(String[][] board, String[] subWinners,
                            String aiPlayer, Integer activeSub, String difficulty) {

        int depth = depthFor(difficulty);
        String opponent = opponentOf(aiPlayer);

        List<Move> legalMoves = getLegalMoves(board, subWinners, activeSub);
        if (legalMoves.isEmpty()) return null;

        // On collecte tous les coups optimaux (même score max) pour tie-break aléatoire
        List<Move> bestMoves = new ArrayList<>();
        int bestScore = Integer.MIN_VALUE;
        int alpha = Integer.MIN_VALUE;
        int beta  = Integer.MAX_VALUE;

        for (Move m : legalMoves) {
            String[][] newBoard      = deepCopy(board);
            String[]   newSubWinners = subWinners.clone();

            newBoard[m.sub][m.cell] = aiPlayer;
            String subWin = checkWinner(newBoard[m.sub]);
            if (subWin != null) newSubWinners[m.sub] = subWin;

            Integer nextActive = computeNextActive(newBoard, newSubWinners, m.cell);

            int score = minimax(newBoard, newSubWinners, nextActive,
                                depth - 1, alpha, beta,
                                false, aiPlayer, opponent);

            if (score > bestScore) {
                bestScore = score;
                bestMoves.clear();
                bestMoves.add(m);
            } else if (score == bestScore) {
                bestMoves.add(m);
            }
            alpha = Math.max(alpha, bestScore);
        }

        return bestMoves.get(RANDOM.nextInt(bestMoves.size()));
    }

    private int depthFor(String difficulty) {
        if (difficulty == null) return 3;
        switch (difficulty.toUpperCase()) {
            case "EASY":   return 1;
            case "MEDIUM": return 3;
            case "HARD":   return 5;
            default:       return 3;
        }
    }

    /** Minimax récursif avec alpha-beta. */
    private int minimax(String[][] board, String[] subWinners, Integer activeSub,
                        int depth, int alpha, int beta, boolean maximizing,
                        String aiPlayer, String opponent) {

        // Terminal : un joueur a gagné globalement
        String globalWinner = checkWinner(subWinners);
        if (globalWinner != null) {
            if (globalWinner.equals(aiPlayer))  return WIN_SCORE  + depth;  // gagner vite > gagner tard
            if (globalWinner.equals(opponent))  return LOSS_SCORE - depth;  // perdre tard > perdre vite
        }

        // Profondeur atteinte → on évalue la position
        if (depth <= 0) {
            return evaluate(board, subWinners, aiPlayer, opponent);
        }

        String currentPlayer = maximizing ? aiPlayer : opponent;
        List<Move> legalMoves = getLegalMoves(board, subWinners, activeSub);

        // Plus de coups possibles (cas rare) → on évalue
        if (legalMoves.isEmpty()) {
            return evaluate(board, subWinners, aiPlayer, opponent);
        }

        if (maximizing) {
            int max = Integer.MIN_VALUE;
            for (Move m : legalMoves) {
                String[][] newBoard      = deepCopy(board);
                String[]   newSubWinners = subWinners.clone();
                newBoard[m.sub][m.cell] = currentPlayer;
                String subWin = checkWinner(newBoard[m.sub]);
                if (subWin != null) newSubWinners[m.sub] = subWin;
                Integer nextActive = computeNextActive(newBoard, newSubWinners, m.cell);

                int score = minimax(newBoard, newSubWinners, nextActive,
                                    depth - 1, alpha, beta,
                                    false, aiPlayer, opponent);
                max = Math.max(max, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;  // coupure beta
            }
            return max;
        } else {
            int min = Integer.MAX_VALUE;
            for (Move m : legalMoves) {
                String[][] newBoard      = deepCopy(board);
                String[]   newSubWinners = subWinners.clone();
                newBoard[m.sub][m.cell] = currentPlayer;
                String subWin = checkWinner(newBoard[m.sub]);
                if (subWin != null) newSubWinners[m.sub] = subWin;
                Integer nextActive = computeNextActive(newBoard, newSubWinners, m.cell);

                int score = minimax(newBoard, newSubWinners, nextActive,
                                    depth - 1, alpha, beta,
                                    true, aiPlayer, opponent);
                min = Math.min(min, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;  // coupure alpha
            }
            return min;
        }
    }

    /**
     * Évalue la position. Positif = avantage IA, négatif = avantage adversaire.
     */
    private int evaluate(String[][] board, String[] subWinners,
                         String aiPlayer, String opponent) {
        int score = 0;

        // 1. Sous-grilles gagnées : +/- 100 chacune
        for (int i = 0; i < 9; i++) {
            if (aiPlayer.equals(subWinners[i]))      score += 100;
            else if (opponent.equals(subWinners[i])) score -= 100;
        }

        // 2. État interne des sous-grilles encore en jeu : alignements partiels
        for (int sub = 0; sub < 9; sub++) {
            if (subWinners[sub] == null) {
                score += scoreLines(board[sub], aiPlayer, opponent);
            }
        }

        // 3. Alignements sur la méta-grille : ×10 (plus important que les sous-grilles)
        score += scoreLines(subWinners, aiPlayer, opponent) * 10;

        // 4. Bonus centre méta : sous-grille 4 contrôle 4 alignements potentiels
        if (aiPlayer.equals(subWinners[4]))      score += 50;
        else if (opponent.equals(subWinners[4])) score -= 50;

        // 5. Bonus centres des sous-grilles (la case 4 de chaque sub)
        for (int sub = 0; sub < 9; sub++) {
            if (subWinners[sub] == null) {
                if (aiPlayer.equals(board[sub][4]))      score += 3;
                else if (opponent.equals(board[sub][4])) score -= 3;
            }
        }

        return score;
    }

    /**
     * Score les 8 alignements possibles sur un tableau 3x3.
     *   2 marques + 1 case libre  →  ±5
     *   1 marque  + 2 cases libres → ±1
     *   alignement mixte          →   0
     */
    private int scoreLines(String[] cells, String aiPlayer, String opponent) {
        int total = 0;
        for (int[] line : LINES) {
            int ai = 0, op = 0;
            for (int idx : line) {
                if (aiPlayer.equals(cells[idx]))      ai++;
                else if (opponent.equals(cells[idx])) op++;
            }
            if (ai > 0 && op == 0) {
                total += (ai == 2) ? 5 : 1;
            } else if (op > 0 && ai == 0) {
                total -= (op == 2) ? 5 : 1;
            }
        }
        return total;
    }

    /** Liste tous les coups légaux dans la position actuelle. */
    private List<Move> getLegalMoves(String[][] board, String[] subWinners, Integer activeSub) {
        List<Move> moves = new ArrayList<>();

        // Coup forcé : la sub-grille active est jouable
        boolean forced = activeSub != null
                && subWinners[activeSub] == null
                && !isSubFull(board[activeSub]);

        if (forced) {
            for (int cell = 0; cell < 9; cell++) {
                if (board[activeSub][cell] == null) {
                    moves.add(new Move(activeSub, cell));
                }
            }
        } else {
            // Coup libre : toute case libre dans une sub-grille non décidée et non pleine
            for (int sub = 0; sub < 9; sub++) {
                if (subWinners[sub] != null) continue;
                if (isSubFull(board[sub]))   continue;
                for (int cell = 0; cell < 9; cell++) {
                    if (board[sub][cell] == null) {
                        moves.add(new Move(sub, cell));
                    }
                }
            }
        }
        return moves;
    }

    /** Détermine la sub-grille active après qu'un coup a été joué dans la cellule c. */
    private Integer computeNextActive(String[][] board, String[] subWinners, int cellPlayed) {
        if (subWinners[cellPlayed] != null)  return null;  // sub gagnée → coup libre
        if (isSubFull(board[cellPlayed]))    return null;  // sub pleine → coup libre
        return cellPlayed;
    }

    private boolean isSubFull(String[] cells) {
        for (String c : cells) if (c == null) return false;
        return true;
    }

    /** Cherche un alignement gagnant sur un tableau 3x3 (sub-grille ou méta-grille). */
    private String checkWinner(String[] cells) {
        for (int[] line : LINES) {
            String a = cells[line[0]];
            if (a != null && a.equals(cells[line[1]]) && a.equals(cells[line[2]])) {
                return a;
            }
        }
        return null;
    }

    private String opponentOf(String player) {
        return "X".equals(player) ? "O" : "X";
    }

    private String[][] deepCopy(String[][] board) {
        String[][] copy = new String[board.length][];
        for (int i = 0; i < board.length; i++) {
            copy[i] = board[i].clone();
        }
        return copy;
    }
}