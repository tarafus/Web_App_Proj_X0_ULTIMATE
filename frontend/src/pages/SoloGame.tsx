import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Board from "../components/Board.tsx";
import { useGameStore } from "../store/gameStore.ts";
import { api } from "../api/api.ts";
import { showToast } from "../utils/toast.ts";
import "../styles/game.css";

const AI_SYMBOL = "O";
const HUMAN_SYMBOL = "X";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  EASY: "Facile",
  MEDIUM: "Moyen",
  HARD: "Difficile",
};

export default function SoloGame() {
  const { difficulty } = useParams<{ difficulty: Difficulty }>();
  const navigate = useNavigate();

  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const globalWinner  = useGameStore((s) => s.globalWinner);
  const resetGame     = useGameStore((s) => s.reset);

  const [aiThinking, setAiThinking] = useState(false);
  const aiThinkingRef = useRef(false);

  const validDifficulty: Difficulty =
    difficulty && ["EASY", "MEDIUM", "HARD"].includes(difficulty) ? difficulty : "MEDIUM";

  // Reset au montage / quand on change de difficulté
  useEffect(() => {
    resetGame();
    setAiThinking(false);
    aiThinkingRef.current = false;
  }, [validDifficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tour de l'IA
  useEffect(() => {
    if (currentPlayer !== AI_SYMBOL) return;
    if (globalWinner) return;
    if (aiThinkingRef.current) return;

    aiThinkingRef.current = true;

    // Petit délai pour que le coup du joueur soit visible avant que l'IA joue
    const timer = setTimeout(async () => {
      setAiThinking(true);

      const state = useGameStore.getState();
      const requestBody = {
        board: state.board,
        subWinners: state.subWinners,
        currentPlayer: AI_SYMBOL,
        activeSubBoard: state.activeSubBoard,
        difficulty: validDifficulty,
      };

      try {
        const res = await api.post<{ sub: number; cell: number }>("/ai/move", requestBody);
        useGameStore.getState().play(res.data.sub, res.data.cell);
      } catch {
        showToast("Erreur côté IA");
      } finally {
        setAiThinking(false);
        aiThinkingRef.current = false;
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      aiThinkingRef.current = false;
    };
  }, [currentPlayer, globalWinner, validDifficulty]);

  const handleMove = (move: { sub: number; cell: number }) => {
    if (currentPlayer !== HUMAN_SYMBOL) return;
    if (globalWinner || aiThinking) return;
    useGameStore.getState().play(move.sub, move.cell);
  };

  const handleRestart = () => {
    resetGame();
    setAiThinking(false);
    aiThinkingRef.current = false;
  };

  const isHumanTurn = currentPlayer === HUMAN_SYMBOL && !globalWinner && !aiThinking;
  const canPlay = isHumanTurn;

  // Texte du gagnant
  let winnerText = "";
  if (globalWinner === HUMAN_SYMBOL) {
    winnerText = "Vous avez gagné ! 🎉";
  } else if (globalWinner === AI_SYMBOL) {
    winnerText = `IA (${DIFFICULTY_LABEL[validDifficulty]}) a gagné !`;
  }

  return (
    <div className="game-page">
      <div className="game-left">
        <h1>Solo vs IA</h1>
        <p style={{ marginBottom: 8 }}>
          Difficulté : <strong>{DIFFICULTY_LABEL[validDifficulty]}</strong> — Vous (<strong>X</strong>) vs IA (<strong>O</strong>)
        </p>

        {globalWinner ? (
          <h2 className="winner-banner">{winnerText}</h2>
        ) : aiThinking ? (
          <p style={{ color: "#4da3ff", fontWeight: 500 }}>
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                border: "2px solid #4da3ff",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                marginRight: 8,
                verticalAlign: "middle",
              }}
            />
            L'IA réfléchit...
          </p>
        ) : (
          <p style={{ fontWeight: "bold", color: isHumanTurn ? "#2e7d32" : "#999" }}>
            {isHumanTurn ? "À vous de jouer" : "Tour de l'IA"}
          </p>
        )}

        <div
          style={{
            opacity: canPlay ? 1 : 0.6,
            pointerEvents: canPlay ? "auto" : "none",
            transition: "opacity 0.2s",
          }}
        >
          <Board onMove={handleMove} />
        </div>

        {globalWinner && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
              justifyContent: "center",
            }}
          >
            <button className="reset-btn" onClick={handleRestart}>
              Rejouer
            </button>
            <button className="btn-secondary" onClick={() => navigate("/")}>
              Accueil
            </button>
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 12, color: "#666", textAlign: "center" }}>
          Les parties solo ne sont pas comptabilisées dans le classement ELO.
        </p>
      </div>
    </div>
  );
}