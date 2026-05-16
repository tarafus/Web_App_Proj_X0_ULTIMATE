import { useEffect, useState } from "react";
import { api } from "../api/api.ts";
import "../styles/leaderboard.css";

interface Player {
    id: number;
    username: string;
    elo: number;
    wins: number;
    losses: number;
    rank?: number;
}

export default function Leaderboard() {
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        api.get<Player[]>("/auth/all")
            .then((res) => {
                const sorted = [...res.data].sort((a, b) => b.elo - a.elo);
                const ranked = sorted.map((p, index) => ({ ...p, rank: index + 1 }));
                setPlayers(ranked);
            })
            .catch(() => {
                console.error("Failed to load leaderboard");
            });
    }, []);

    return (
        <div className="leaderboard-container">
            <h1>ELO Leaderboard</h1>

            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>ELO</th>
                        <th>Wins</th>
                        <th>Losses</th>
                    </tr>
                </thead>

                <tbody>
                    {players.map((p) => (
                        <tr key={p.id}>
                            <td>{p.rank}</td>
                            <td>{p.username}</td>
                            <td>{p.elo}</td>
                            <td>{p.wins}</td>
                            <td>{p.losses}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}