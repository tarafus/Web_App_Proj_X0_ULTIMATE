import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../api/api.ts";
import { useAuthStore } from "../store/authStore.ts";
import { showToast } from "../utils/toast.ts";
import "../styles/home.css";

type MatchmakingState = "idle" | "waiting";
type Difficulty = "EASY" | "MEDIUM" | "HARD";

const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  { value: "EASY",   label: "Facile",    description: "L'IA voit le coup immédiat" },
  { value: "MEDIUM", label: "Moyen",     description: "L'IA anticipe 2-3 coups" },
  { value: "HARD",   label: "Difficile", description: "L'IA anticipe 5 coups" },
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
      showToast("Impossible de rejoindre la file d'attente.");
    }
  };

  const handleCancel = async () => {
    await api.post("/matchmaking/leave").catch(() => {});
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
          Le Tic-Tac-Toe réinventé. 9 grilles. 81 cases. Une stratégie infinie.
        </p>

        <div className="hero-buttons">
          {mmState === "idle" && (
            <>
              <button className="btn-primary" onClick={handlePlay}>
                Jouer en ligne
              </button>
              <button className="btn-secondary" onClick={handlePlayAI} style={{ marginLeft: 12 }}>
                Jouer contre l'IA
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
                  Recherche d'un adversaire...
                </span>
              </div>
              <button className="btn-secondary" onClick={handleCancel}>
                Annuler
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <h2>Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Parties en ligne</h3>
            <p>Affrontez vos adversaires en temps réel via WebSocket.</p>
          </div>
          <div className="feature-card">
            <h3>Matchmaking ELO</h3>
            <p>Trouvez automatiquement un adversaire de niveau équivalent.</p>
          </div>
          <div className="feature-card">
            <h3>IA avec Minimax</h3>
            <p>Jouez en solo contre une IA à 3 niveaux de difficulté.</p>
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

      {/* Modal de sélection de difficulté */}
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
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Choisir la difficulté</h2>
            <p style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>
              Hors classement ELO. Vous jouez les X.
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
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}