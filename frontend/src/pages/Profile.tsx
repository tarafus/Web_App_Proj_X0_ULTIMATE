import "../styles/profile.css";

export default function Profile() {
    // MOCK temporaire
    const user = {
        username: "Yui",
        elo: 1520,
        wins: 32,
        losses: 10,
        games: [
            { id: 1, opponent: "Alex", result: "Victoire", eloChange: "+12" },
            { id: 2, opponent: "Sam", result: "Défaite", eloChange: "-8" },
            { id: 3, opponent: "Lina", result: "Victoire", eloChange: "+10" },
        ],
    };

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
                    {user.games.map((g) => (
                        <tr key={g.id}>
                            <td>{g.id}</td>
                            <td>{g.opponent}</td>
                            <td>{g.result}</td>
                            <td>{g.eloChange}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
