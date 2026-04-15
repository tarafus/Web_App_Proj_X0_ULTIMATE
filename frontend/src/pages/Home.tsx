import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import "../styles/home.css";

export default function Home() {

  // TEMPORAIRE TANT QU'ON A PAS DE BACKEND POUR GÉNÉRER DE VRAIS ID DE PARTIE
  const navigate = useNavigate();

  function createGame() {
    // MOCK pour l'instant
    const fakeId = Math.floor(Math.random() * 100000);
    navigate(`/game/${fakeId}`);
  }


  return (
    <div className="home-container">

      {/* HERO */}
      <section className="hero">
        <h1 className="hero-title">Morpion Ultimate</h1>
        <p className="hero-subtitle">
          Le Tic‑Tac‑Toe réinventé. 9 grilles. 81 cases. Une stratégie infinie.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={createGame}>
            Créer une partie
          </button>
        </div>

      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Fonctionnalités</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Parties en ligne</h3>
            <p>Affrontez vos amis en temps réel grâce au WebSocket STOMP.</p>
          </div>

          <div className="feature-card">
            <h3>IA Minimax</h3>
            <p>Un mode solo avec une intelligence artificielle redoutable.</p>
          </div>

          <div className="feature-card">
            <h3>Classement ELO</h3>
            <p>Progressez, grimpez les rangs et devenez le meilleur.</p>
          </div>

          <div className="feature-card">
            <h3>Chat intégré</h3>
            <p>Discutez avec vos adversaires pendant la partie.</p>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES */}
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
