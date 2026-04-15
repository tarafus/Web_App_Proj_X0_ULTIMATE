import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const loginStore = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await authApi.register({ username, password });
      loginStore.login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError("Nom d'utilisateur déjà pris");
    }
  }

  return (
    <div>
      <h1>Créer un compte</h1>

      <form onSubmit={handleRegister}>
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

        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}