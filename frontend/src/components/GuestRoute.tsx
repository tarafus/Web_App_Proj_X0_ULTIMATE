import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.ts";
import type { JSX } from "react";

export default function GuestRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);

  if (user) return <Navigate to="/" replace />;

  return children;
}
