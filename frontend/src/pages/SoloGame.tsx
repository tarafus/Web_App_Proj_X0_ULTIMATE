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
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export default function SoloGame() {
  const { difficulty } = useParams<{ difficulty: Difficulty }>();
  const navigate = useNavigate();

  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const globalWinner = useGameStore((s) => s.globalWinner);
  const resetGame = useGameStore((s) => s.reset);

  const [aiThinking, setAiThinking] = useState(false);
  const aiThinkingRef = useRef(false);

  const validDifficulty: Difficulty =
    difficulty && ["EASY", "MEDIUM", "HARD"].includes(difficulty) ? difficulty : "MEDIUM";

  // Reset on mount / when difficulty changes
  useEffect(() => {
    resetGame();
    setAiThinking(false);
    aiThinkingRef.current = false;
  }, [validDifficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  // AI turn
  useEffect(() => {
    if (currentPlayer !== AI_SYMBOL) return;
    if (globalWinner) return;
    if (aiThinkingRef.current) return;

    aiThinkingRef.current = true;

    // Small delay so the human's move shows before the AI plays
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
        showToast("AI error");
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

  // Winner text
  let winnerText = "";
  if (globalWinner === HUMAN_SYMBOL) {
    winnerText = "You won! 🎉";
  } else if (globalWinner === AI_SYMBOL) {
    winnerText = `AI (${DIFFICULTY_LABEL[validDifficulty]}) won!`;
  }

  return (
    <div className="game-page">
      <div className="game-left">
        <h1>Solo vs AI</h1>
        <p style={{ marginBottom: 8 }}>
          Difficulty: <strong>{DIFFICULTY_LABEL[validDifficulty]}</strong> — You (<strong>X</strong>) vs AI (<strong>O</strong>)
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
            AI is thinking...
          </p>
        ) : (
          <p style={{ fontWeight: "bold", color: isHumanTurn ? "#2e7d32" : "#999" }}>
            {isHumanTurn ? "Your turn" : "AI's turn"}
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
              Play again
            </button>
            <button className="btn-secondary" onClick={() => navigate("/")}>
              Home
            </button>
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 12, color: "#666", textAlign: "center" }}>
          Solo matches don't count toward the ELO ranking.
        </p>
      </div>
    </div>
  );
}