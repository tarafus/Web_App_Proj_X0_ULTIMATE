import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../api/api.ts";
import { useAuthStore } from "../store/authStore.ts";
import { showToast } from "../utils/toast.ts";
import "../styles/home.css";

type MatchmakingState = "idle" | "waiting";
type Difficulty = "EASY" | "MEDIUM" | "HARD";

const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  { value: "EASY", label: "Easy", description: "AI sees the immediate move" },
  { value: "MEDIUM", label: "Medium", description: "AI thinks 2-3 moves ahead" },
  { value: "HARD", label: "Hard", description: "AI thinks 5 moves ahead" },
];

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [mmState, setMmState] = useState<MatchmakingState>("idle");
  const [showAIModal, setShowAIModal] = useState(false);

  const handlePlay = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      const res = await api.post<{ status: string }>("/matchmaking/join");
      if (res.data.status === "waiting") setMmState("waiting");
    } catch {
      showToast("Failed to join matchmaking queue.");
    }
  };

  const handleCancel = async () => {
    await api.post("/matchmaking/leave").catch(() => { });
    setMmState("idle");
  };

  const handlePlayAI = () => {
    if (!user) { navigate("/login"); return; }
    setShowAIModal(true);
  };

  const startSoloGame = (difficulty: Difficulty) => {
    setShowAIModal(false);
    navigate(`/solo/${difficulty}`);
  };

  return (
    <div className="home-container">
      <section className="hero">
        <h1 className="hero-title">Morpion Ultimate</h1>
        <p className="hero-subtitle">
          Tic-Tac-Toe reinvented. 9 grids. 81 cells. Infinite strategy.
        </p>

        <div className="hero-buttons">
          {mmState === "idle" && (
            <>
              <button className="btn-primary" onClick={handlePlay}>
                Play online
              </button>
              <button className="btn-secondary" onClick={handlePlayAI} style={{ marginLeft: 12 }}>
                Play vs AI
              </button>
            </>
          )}

          {mmState === "waiting" && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, marginBottom: 12,
              }}>
                <span style={{
                  display: "inline-block", width: 18, height: 18,
                  border: "2px solid #4da3ff", borderTopColor: "transparent",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                }} />
                <span style={{ fontSize: 16, opacity: 0.85 }}>
                  Searching for an opponent...
                </span>
              </div>
              <button className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Online matches</h3>
            <p>Play against opponents in real-time via WebSocket.</p>
          </div>
          <div className="feature-card">
            <h3>ELO Matchmaking</h3>
            <p>Automatically find an opponent at your skill level.</p>
          </div>
          <div className="feature-card">
            <h3>Minimax AI</h3>
            <p>Play solo against an AI with 3 difficulty levels.</p>
          </div>
        </div>
      </section>

      <section className="technos">
        <h2>Technologies</h2>
        <div className="tech-badges">
          <span>React</span>
          <span>Zustand</span>
          <span>Spring Boot</span>
          <span>PostgreSQL</span>
          <span>WebSocket</span>
          <span>Docker</span>
        </div>
      </section>

      {/* Difficulty selection modal */}
      {showAIModal && (
        <div
          onClick={() => setShowAIModal(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2000, animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1c1c1c",
              border: "1px solid #333",
              borderRadius: 12,
              padding: 28,
              minWidth: 360,
              maxWidth: 480,
              boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
              fontFamily: "Inter, sans-serif",
              color: "#e5e5e5",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Select difficulty</h2>
            <p style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>
              Not ranked. You play as X.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => startSoloGame(d.value)}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 8,
                    border: "1px solid #2e2e2e",
                    background: "#242424",
                    color: "#e5e5e5",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 14,
                    textAlign: "left",
                    transition: "0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#2e2e2e";
                    e.currentTarget.style.borderColor = "#4da3ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#242424";
                    e.currentTarget.style.borderColor = "#2e2e2e";
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>{d.description}</div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={() => setShowAIModal(false)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 7,
                  border: "1px solid #444",
                  background: "transparent",
                  color: "#ccc",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}