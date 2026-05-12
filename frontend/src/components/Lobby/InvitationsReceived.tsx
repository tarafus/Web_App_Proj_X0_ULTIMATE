import { useLobbyStore } from "../../store/lobbyStore.ts";

export default function InvitationsReceived() {
  const invitations = useLobbyStore((s) => s.receivedInvitations);
  const accept = useLobbyStore((s) => s.acceptInvitation);
  const decline = useLobbyStore((s) => s.declineInvitation);

  return (
    <div className="lobby-card">
      <h2>Invitations reçues</h2>
      <ul>
        {invitations.map((inv) => (
          <li key={inv.id}>
            {inv.from.username}
            <div className="inv-buttons">
              <button onClick={() => accept(inv.id)}>Accepter</button>
              <button onClick={() => decline(inv.id)}>Refuser</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
