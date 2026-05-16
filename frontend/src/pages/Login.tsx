import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { authApi } from "../api/authApi.ts";
import { useAuthStore } from "../store/authStore.ts";
import { showToast } from "../utils/toast.ts";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await authApi.login({ username, password });
      const token = response.data;
      useAuthStore.getState().login(token, null);

      const userResponse = await authApi.me(token);
      useAuthStore.getState().login(token, userResponse.data);

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      showToast("Invalid credentials");
    }
  }

  return (
    <div className="auth-container">
      <h1>Sign in</h1>

      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn-primary" type="submit">
          Sign in
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}