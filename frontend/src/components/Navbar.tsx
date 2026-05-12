import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.ts";
import "../styles/navbar.css";

export default function Navbar() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();
    console.log("NAVBAR USER:", user);

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
                <Link to="/leaderboard" className="nav-link">Classement</Link>
                <Link to="/lobby" className="nav-link">Lobby</Link>

                {user && (
                    <Link to="/profile" className="nav-link">Profil</Link>
                )}

                {!user && (
                    <Link to="/login">
                        <button className="nav-btn">Connexion</button>
                    </Link>
                )}

                {user && (
                    <button className="nav-btn" onClick={handleLogout}>
                        Déconnexion
                    </button>
                )}
            </div>
        </nav>
    );
}
