import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const loginStore = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await authApi.login({ username, password });
      loginStore.login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError("Identifiants incorrects");
    }
  }

  return (
    <div>
      <h1>Connexion</h1>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}