import "../styles/lobby.css";

export default function Lobby() {
    // MOCK temporaire
    const onlinePlayers = [
        { id: 1, username: "Alex" },
        { id: 2, username: "Sam" },
        { id: 3, username: "Lina" },
    ];

    const invitations = [
        { id: 1, from: "Alex" },
        { id: 2, from: "Sam" },
    ];

    return (
        <div className="lobby-container">
            <h1>Lobby</h1>

            <div className="lobby-sections">

                <div className="lobby-card">
                    <h2>Joueurs en ligne</h2>
                    <ul>
                        {onlinePlayers.map((p) => (
                            <li key={p.id}>
                                {p.username}
                                <button className="invite-btn">Inviter</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lobby-card">
                    <h2>Invitations reçues</h2>
                    <ul>
                        {invitations.map((inv) => (
                            <li key={inv.id}>
                                {inv.from}
                                <div className="inv-buttons">
                                    <button className="accept-btn">Accepter</button>
                                    <button className="decline-btn">Refuser</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
}
