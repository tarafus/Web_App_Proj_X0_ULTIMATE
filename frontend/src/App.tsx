import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Game from "./pages/Game.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import Profile from "./pages/Profile.tsx";
import Lobby from "./pages/Lobby.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import GuestRoute from "./components/GuestRoute.tsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Routes accessibles uniquement si NON connecté */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* Routes protégées */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lobby"
          element={
            <ProtectedRoute>
              <Lobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:id"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />

        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
