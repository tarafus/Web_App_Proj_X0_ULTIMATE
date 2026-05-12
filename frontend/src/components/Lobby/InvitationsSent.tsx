import { useLobbyStore } from "../../store/lobbyStore.ts";

export default function InvitationsSent() {
  const invitations = useLobbyStore((s) => s.sentInvitations);

  return (
    <div className="lobby-card">
      <h2>Invitations envoyées</h2>
      <ul>
        {invitations.map((inv) => (
          <li key={inv.id}>
            À {inv.to.username} — en attente...
          </li>
        ))}
      </ul>
    </div>
  );
}
