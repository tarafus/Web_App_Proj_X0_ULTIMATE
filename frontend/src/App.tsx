import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.tsx";
import Game from "./pages/Game.tsx";
import SoloGame from "./pages/SoloGame.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import Profile from "./pages/Profile.tsx";
import Lobby from "./pages/Lobby.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import GuestRoute from "./components/GuestRoute.tsx";
import { useAuthStore } from "./store/authStore.ts";
import { authApi } from "./api/authApi.ts";
import { usePersonalWebSocket } from "./hooks/usePersonalWebSocket.ts";
import { useNotificationStore } from "./store/notificationStore.ts";

function AppContent() {
  const user       = useAuthStore((s) => s.user);
  const navigate   = useNavigate();
  const loadAll    = useNotificationStore((s) => s.loadAll);
  const addNotif   = useNotificationStore((s) => s.add);
  const clearStore = useNotificationStore((s) => s.clear);

  useEffect(() => {
    if (user) loadAll();
    else      clearStore();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  usePersonalWebSocket(user?.username ?? "", {
    onNotification:       (notif)  => addNotif(notif),
    onInvitationAccepted: (gameId) => navigate(`/game/${gameId}`),
    onMatched:            (gameId) => navigate(`/game/${gameId}`),
  });

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                  element={<Home />} />
        <Route path="/login"             element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register"          element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/profile"           element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/lobby"             element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/game/:id"          element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/solo/:difficulty"  element={<ProtectedRoute><SoloGame /></ProtectedRoute>} />
        <Route path="/leaderboard"       element={<Leaderboard />} />
      </Routes>
    </>
  );
}

export default function App() {
  const token      = useAuthStore((s) => s.token);
  const loginStore = useAuthStore((s) => s.login);
  const logout     = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!token) return;
    authApi.me(token)
      .then((res) => loginStore(token, res.data))
      .catch(() => logout());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}