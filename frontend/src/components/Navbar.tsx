import { Link } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link to="/" className="nav-logo">Morpion Ultimate</Link>
            </div>

            <div className="nav-right">
                <Link to="/leaderboard" className="nav-link">Classement</Link>
                <Link to="/lobby" className="nav-link">Lobby</Link>
                <Link to="/profile" className="nav-link"> Profil</Link>
                <Link to="/login"><button className="nav-btn">Connexion</button></Link>
            </div>
        </nav>
    );
}
