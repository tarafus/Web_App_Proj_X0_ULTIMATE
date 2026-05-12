import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { authApi } from "../api/authApi.ts";
import { useAuthStore } from "../store/authStore.ts";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      // 1) Login → récupère le token
      const response = await authApi.login({ username, password });
      const token = response.data;

      // 2) Stocker le token immédiatement
      useAuthStore.getState().login(token, null);

      // 3) Appeler /auth/me AVEC le token
      const userResponse = await authApi.me(token);
      const user = userResponse.data;

      // 4) Stocker le user
      useAuthStore.getState().login(token, user);

      // 5) Redirection
      navigate("/");
    } catch (err) {
      console.error("Erreur login:", err);
      alert("Identifiants invalides");
    }
  }

  return (
    <div className="auth-container">
      <h1>Connexion</h1>

      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn-primary" type="submit">
          Se connecter
        </button>
      </form>

      <p className="auth-switch">
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </div>
  );
}
