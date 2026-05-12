import OnlinePlayers from "../components/Lobby/OnlinePlayers.tsx";
import InvitationsReceived from "../components/Lobby/InvitationsReceived.tsx";
import InvitationsSent from "../components/Lobby/InvitationsSent.tsx";
import "../styles/lobby.css";

export default function Lobby() {
  return (
    <div className="lobby-container">
      <h1>Lobby</h1>

      <div className="lobby-sections">
        <OnlinePlayers />
        <InvitationsReceived />
        <InvitationsSent />
      </div>
    </div>
  );
}
