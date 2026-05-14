import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import { useAuthStore } from "../store/authStore.ts";
import { useNotificationStore } from "../store/notificationStore.ts";
import "../styles/lobby.css";

interface Player {
  id: number;
  username: string;
  elo: number;
  wins: number;
  losses: number;
}

interface InvitationDTO {
  id: number;
  senderUsername: string;
  receiverUsername: string;
  status: string;
  gameId: number | null;
}

interface GameDTO {
  id: number;
  player1Username: string | null;
  player2Username: string | null;
  status: string;
}

export default function Lobby() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Notifications globales (depuis App.tsx via usePersonalWebSocket)
  const notifications = useNotificationStore((s) => s.notifications);

  const [players, setPlayers] = useState<Player[]>([]);
  const [invitations, setInvitations] = useState<InvitationDTO[]>([]);
  const [ongoingGames, setOngoingGames] = useState<GameDTO[]>([]);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // ─── Chargement initial ────────────────────────────────────────────────────

  const loadInvitations = () =>
    api.get<InvitationDTO[]>("/invitation/pending")
      .then((res) => setInvitations(res.data))
      .catch(() => { });

  const loadOngoing = () =>
    api.get<GameDTO[]>("/game/ongoing")
      .then((res) => setOngoingGames(res.data))
      .catch(() => { });

  useEffect(() => {
    Promise.all([
      api.get<Player[]>("/auth/all"),
      api.get<InvitationDTO[]>("/invitation/pending"),
      api.get<GameDTO[]>("/game/ongoing"),
    ])
      .then(([playersRes, invRes, ongoingRes]) => {
        setPlayers(playersRes.data);
        setInvitations(invRes.data);
        setOngoingGames(ongoingRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── Refresh quand une nouvelle notification "invitation" arrive ───────────
  // (App.tsx reçoit les WS et alimente le notificationStore)

  const invNotifCount = notifications.filter((n) => n.type === "invitation").length;

  useEffect(() => {
    if (invNotifCount > 0) loadInvitations();
  }, [invNotifCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleInvite = async (receiverUsername: string) => {
    try {
      const res = await api.post<InvitationDTO>(
        `/invitation/send?receiverUsername=${receiverUsername}`
      );

      // Cross-invitation : si l'autre nous avait déjà invité, le backend a auto-accepté
      // et nous renvoie l'invitation avec le gameId → on file directement à la partie
      if (res.data.gameId) {
        navigate(`/game/${res.data.gameId}`);
        return;
      }

      // Sinon flux normal : on a juste envoyé l'invitation
      setSentTo((prev) => new Set(prev).add(receiverUsername));
    } catch {
      alert("Impossible d'envoyer l'invitation.");
    }
  };

  const handleAccept = async (inv: InvitationDTO) => {
    try {
      const res = await api.post<InvitationDTO>(`/invitation/${inv.id}/accept`);
      if (res.data.gameId) navigate(`/game/${res.data.gameId}`);
    } catch {
      alert("Erreur lors de l'acceptation.");
    }
  };

  const handleDecline = async (inv: InvitationDTO) => {
    try {
      await api.post(`/invitation/${inv.id}/decline`);
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
    } catch {
      alert("Erreur lors du refus.");
    }
  };

  const otherPlayers = players.filter((p) => p.username !== user?.username);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="lobby-container">
        <p style={{ color: "#888" }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Lobby</h1>

      {/* ── Invitations reçues ── */}
      {invitations.length > 0 && (
        <section className="lobby-section">
          <h2>Invitations reçues</h2>
          <div className="invitation-list">
            {invitations.map((inv) => (
              <div key={inv.id} className="invitation-card">
                <span>
                  <strong>{inv.senderUsername}</strong> vous invite à jouer
                </span>
                <div className="invitation-actions">
                  <button className="btn-accept" onClick={() => handleAccept(inv)}>
                    Accepter
                  </button>
                  <button className="btn-decline" onClick={() => handleDecline(inv)}>
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Parties en cours (reprendre) ── */}
      {ongoingGames.length > 0 && (
        <section className="lobby-section">
          <h2>Parties en cours</h2>
          <div className="player-list">
            {ongoingGames.map((g) => (
              <div key={g.id} className="player-card">
                <div className="player-info">
                  <span className="player-name">
                    {g.player1Username ?? "?"} vs {g.player2Username ?? "?"}
                  </span>
                  <span className="player-stats">Partie #{g.id}</span>
                </div>
                <button
                  className="btn-invite"
                  onClick={() => navigate(`/game/${g.id}`)}
                >
                  Reprendre
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Liste des joueurs ── */}
      <section className="lobby-section">
        <h2>Joueurs ({otherPlayers.length})</h2>
        {otherPlayers.length === 0 ? (
          <p className="lobby-empty">Aucun autre joueur inscrit pour l'instant.</p>
        ) : (
          <div className="player-list">
            {otherPlayers.map((p) => (
              <div key={p.id} className="player-card">
                <div className="player-info">
                  <span className="player-name">{p.username}</span>
                  <span className="player-stats">
                    ELO {p.elo} · {p.wins}V {p.losses}D
                  </span>
                </div>
                <button
                  className={`btn-invite ${sentTo.has(p.username) ? "sent" : ""}`}
                  onClick={() => handleInvite(p.username)}
                  disabled={sentTo.has(p.username)}
                >
                  {sentTo.has(p.username) ? "Invitation envoyée" : "Inviter"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}