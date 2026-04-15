import "../styles/leaderboard.css";

export default function Leaderboard() {
    // MOCK temporaire
    const players = [
        { rank: 1, username: "Yui", elo: 1520, wins: 32, losses: 10 },
        { rank: 2, username: "Alex", elo: 1480, wins: 28, losses: 14 },
        { rank: 3, username: "Sam", elo: 1420, wins: 20, losses: 18 },
        { rank: 4, username: "Lina", elo: 1390, wins: 18, losses: 20 },
    ];

    return (
        <div className="leaderboard-container">
            <h1>Classement ELO</h1>

            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rang</th>
                        <th>Joueur</th>
                        <th>ELO</th>
                        <th>Victoires</th>
                        <th>Défaites</th>
                    </tr>
                </thead>

                <tbody>
                    {players.map((p) => (
                        <tr key={p.rank}>
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
