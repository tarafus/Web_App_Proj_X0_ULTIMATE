import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore.ts";
import { api } from "../api/api.ts";
import "../styles/profile.css";

interface GameHistoryEntry {
    gameId: number;
    opponentUsername: string;
    result: "WIN" | "LOSS" | "DRAW";
    eloChange: number;
    eloAfter: number;
    playedAt: string;
}

export default function Profile() {
    const user  = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const login = useAuthStore((s) => s.login);

    const [history, setHistory] = useState<GameHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // 1) Rafraîchir l'user au montage (sinon l'ELO peut être obsolète)
    useEffect(() => {
        if (!token) return;
        api.get("/auth/me")
            .then((res) => login(token, res.data))
            .catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // 2) Charger l'historique
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        api.get<GameHistoryEntry[]>("/auth/me/history")
            .then((res) => setHistory(res.data))
            .catch(() => setHistory([]))
            .finally(() => setLoading(false));
    }, [user?.id]); // recharge si l'user change

    if (!user) return null;

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleString("fr-FR", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            });
        } catch {
            return iso;
        }
    };

    const resultStyle = (r: string): React.CSSProperties => {
        if (r === "WIN")  return { color: "#66bb6a", fontWeight: 600 };
        if (r === "LOSS") return { color: "#e57373", fontWeight: 600 };
        return { color: "#999", fontWeight: 600 };
    };

    const eloStyle = (change: number): React.CSSProperties => ({
        color: change > 0 ? "#66bb6a" : change < 0 ? "#e57373" : "#999",
        fontWeight: 600,
    });

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

            {loading ? (
                <p style={{ textAlign: "center", color: "#888" }}>Chargement...</p>
            ) : history.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
                    Aucune partie terminée pour le moment.
                </p>
            ) : (
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Adversaire</th>
                            <th>Résultat</th>
                            <th>Variation ELO</th>
                            <th>ELO après</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((h) => (
                            <tr key={h.gameId}>
                                <td>{formatDate(h.playedAt)}</td>
                                <td>{h.opponentUsername}</td>
                                <td style={resultStyle(h.result)}>
                                    {h.result === "WIN" ? "Victoire" :
                                     h.result === "LOSS" ? "Défaite" : "Match nul"}
                                </td>
                                <td style={eloStyle(h.eloChange)}>
                                    {h.eloChange > 0 ? `+${h.eloChange}` : h.eloChange}
                                </td>
                                <td>{h.eloAfter}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}