import { useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import { useAuthStore } from "../store/authStore.ts";
import { usePersonalWebSocket } from "../hooks/usePersonalWebSocket.ts";
import "../styles/home.css";
import React, { useState } from "react";
import { showToast } from "../utils/toast.ts";

type MatchmakingState = "idle" | "waiting";

export default function Home() {
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);
  const [mmState, setMmState] = React.useState<MatchmakingState>("idle");

  // Écoute le canal personnel pour le signal [MATCHED]
  usePersonalWebSocket(user?.username ?? "", {
    onMatched: (gameId) => {
      setMmState("idle");
      navigate(`/game/${gameId}`);
    },
  });

  const handlePlay = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      const res = await api.post<{ status: string }>("/matchmaking/join");
      // Si quelqu'un attendait déjà → [MATCHED] arrivera par WS, pas besoin de gérer ici
      if (res.data.status === "waiting") setMmState("waiting");
    } catch {
      showToast("Impossible de rejoindre la file d'attente.");
    }
  };

  const handleCancel = async () => {
    await api.post("/matchmaking/leave").catch(() => {});
    setMmState("idle");
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
            <button className="btn-primary" onClick={handlePlay}>
              Jouer
            </button>
          )}

          {mmState === "waiting" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
                <span style={{
                  display: "inline-block", width: 18, height: 18,
                  border: "2px solid #4da3ff", borderTopColor: "transparent",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite"
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
            <h3>Classement</h3>
            <p>Progressez et grimpez dans le classement ELO.</p>
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
    </div>
  );
}