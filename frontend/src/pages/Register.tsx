import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { authApi } from "../api/authApi.ts";
import { useAuthStore } from "../store/authStore.ts";
import { showToast } from "../utils/toast.ts";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    try {
      // 1) Register → récupère le token
      const response = await authApi.register({ username, password });
      const token = response.data;

      // 2) Stocker le token immédiatement
      useAuthStore.getState().login(token, null);

      // 3) Appeler /auth/me AVEC le token
      const userResponse = await authApi.me(token);
      const user = userResponse.data;

      // 4) Stocker le user
      useAuthStore.getState().login(token, user);

      navigate("/");
    } catch (err: any) {
      console.error("Erreur register:", err);
      if (err.response?.status === 400) {
        // Le backend renvoie "Username already taken"
        showToast(err.response.data);
      } else {
        showToast("Erreur lors de l'inscription");
      }
    }
  }

  return (
    <div className="auth-container">
      <h1>Créer un compte</h1>

      <form className="auth-form" onSubmit={handleRegister}>
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
          S'inscrire
        </button>
      </form>

      <p className="auth-switch">
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}
