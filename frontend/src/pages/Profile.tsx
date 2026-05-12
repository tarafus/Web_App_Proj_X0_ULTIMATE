import { useAuthStore } from "../store/authStore.ts";
import "../styles/profile.css";

export default function Profile() {
    const user = useAuthStore((s) => s.user);

    // Sécurité (normalement inutile grâce à ProtectedRoute)
    if (!user) return null;

    return (
        <div className="profile-container">
            <h1>Profil</h1>

            <div className="profile-card">
                <h2>{user.username}</h2>
                <p className="elo">ELO : {user.elo}</p>

                <div className="stats">
                    <div>
                        <span className="stat-number">{user.wins}</span>
                        <span className="stat-label">Victoires</span>
                    </div>
                    <div>
                        <span className="stat-number">{user.losses}</span>
                        <span className="stat-label">Défaites</span>
                    </div>
                </div>
            </div>

            <h2 className="history-title">Historique des parties</h2>

            <table className="history-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Adversaire</th>
                        <th>Résultat</th>
                        <th>Variation ELO</th>
                    </tr>
                </thead>

                <tbody>
                    {/* En attendant la vraie table games */}
                    <tr>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
