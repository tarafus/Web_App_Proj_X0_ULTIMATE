import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.ts";
import "../styles/navbar.css";
import NotificationBell from "./NotificationBell.tsx";

export default function Navbar() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link to="/" className="nav-logo">Morpion Ultimate</Link>
            </div>

            <div className="nav-right">
                <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
                <Link to="/lobby" className="nav-link">Lobby</Link>

                {user && (
                    <Link to="/profile" className="nav-link">Profile</Link>
                )}

                {!user && (
                    <Link to="/login">
                        <button className="nav-btn">Sign in</button>
                    </Link>
                )}

                {user && (
                    <button className="nav-btn" onClick={handleLogout}>
                        Sign out
                    </button>
                )}
                <NotificationBell />
            </div>
        </nav>
    );
}