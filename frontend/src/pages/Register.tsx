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
      const response = await authApi.register({ username, password });
      const token = response.data;
      useAuthStore.getState().login(token, null);

      const userResponse = await authApi.me(token);
      useAuthStore.getState().login(token, userResponse.data);

      navigate("/");
    } catch (err: any) {
      console.error("Register error:", err);
      if (err.response?.status === 400) {
        showToast(err.response.data);
      } else {
        showToast("Sign up failed");
      }
    }
  }

  return (
    <div className="auth-container">
      <h1>Sign up</h1>

      <form className="auth-form" onSubmit={handleRegister}>
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
          Create account
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}