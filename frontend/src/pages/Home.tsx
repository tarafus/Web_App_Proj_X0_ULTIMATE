import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Home() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1>Accueil</h1>

      {user ? (
        <>
          <p>Connecté en tant que <strong>{user.username}</strong></p>
          <Link to="/game/123">
            <button>Rejoindre une partie</button>
          </Link>
        </>
      ) : (
        <>
          <p>Vous n'êtes pas connecté.</p>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Link to="/login">
              <button>Se connecter</button>
            </Link>

            <Link to="/register">
              <button>S'inscrire</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}