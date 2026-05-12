import { useLobbyStore } from "../../store/lobbyStore.ts";

export default function OnlinePlayers() {
  const players = useLobbyStore((s) => s.onlinePlayers);
  const sendInvitation = useLobbyStore((s) => s.sendInvitation);

  return (
    <div className="lobby-card">
      <h2>Amis en ligne</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.username}
            <button onClick={() => sendInvitation(p.id)}>Inviter</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
