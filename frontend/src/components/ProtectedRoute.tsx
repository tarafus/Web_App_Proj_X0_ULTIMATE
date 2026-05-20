import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.ts";
import type { JSX } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return <div style={{ padding: 20 }}>Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}