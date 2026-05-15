import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import { useNotificationStore } from "../store/notificationStore.ts";
import "../styles/lobby.css";
import { showToast } from "../utils/toast.ts";

interface FriendshipDTO {
  id: number;
  requester: string;
  addressee: string;
  status: string;
  friendUsername: string;
  friendElo: number;
  createdAt: string;
}

interface InvitationDTO {
  id: number;
  senderUsername: string;
  receiverUsername: string;
  status: string;
  gameId: number | null;
}

interface GameSummary {
  id: number;
  player1Username: string | null;
  player2Username: string | null;
  status: string;
}

// Helper pour extraire le message d'erreur du backend
const errorMsg = (err: any, fallback: string) =>
  err?.response?.data?.error || err?.response?.data?.message || fallback;

export default function Lobby() {
  const navigate = useNavigate();

  const [friends, setFriends]                 = useState<FriendshipDTO[]>([]);
  const [friendRequests, setFriendRequests]   = useState<FriendshipDTO[]>([]);
  const [sentRequests, setSentRequests]       = useState<FriendshipDTO[]>([]);
  const [invitations, setInvitations]         = useState<InvitationDTO[]>([]);
  const [ongoingGames, setOngoingGames]       = useState<GameSummary[]>([]);
  const [searchPseudo, setSearchPseudo]       = useState("");
  const [sentTo, setSentTo]                   = useState<Set<string>>(new Set());

  const notifications = useNotificationStore((s) => s.notifications);

  const loadFriends = () =>
    api.get<FriendshipDTO[]>("/friends").then((r) => setFriends(r.data)).catch(() => {});
  const loadFriendRequests = () =>
    api.get<FriendshipDTO[]>("/friends/requests").then((r) => setFriendRequests(r.data)).catch(() => {});
  const loadSentRequests = () =>
    api.get<FriendshipDTO[]>("/friends/requests/sent").then((r) => setSentRequests(r.data)).catch(() => {});
  const loadInvitations = () =>
    api.get<InvitationDTO[]>("/invitation/pending").then((r) => setInvitations(r.data)).catch(() => {});
  const loadOngoing = () =>
    api.get<GameSummary[]>("/game/ongoing").then((r) => setOngoingGames(r.data)).catch(() => {});

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    loadSentRequests();
    loadInvitations();
    loadOngoing();
  }, []);

  const friendNotifCount = notifications.filter(
    (n) => n.type === "friend_request"
        || n.type === "friend_accepted"
        || n.type === "friend_declined"
  ).length;
  const invNotifCount = notifications.filter(
    (n) => n.type === "invitation" || n.type === "declined"
  ).length;

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    loadSentRequests();
  }, [friendNotifCount]);

  useEffect(() => {
    loadInvitations();
  }, [invNotifCount]);

  const handleSendFriendRequest = async () => {
    const pseudo = searchPseudo.trim();
    if (!pseudo) return;
    try {
      await api.post(`/friends/request?addressee=${encodeURIComponent(pseudo)}`);
      setSearchPseudo("");
      loadSentRequests();
      showToast(`Demande envoyée à ${pseudo}`);
    } catch (err) {
      showToast(errorMsg(err, "Impossible d'envoyer la demande"));
    }
  };

  const handleAcceptFriend = async (id: number) => {
    try {
      await api.post(`/friends/accept/${id}`);
      loadFriends();
      loadFriendRequests();
    } catch (err) {
      showToast(errorMsg(err, "Erreur lors de l'acceptation"));
      loadFriendRequests();
    }
  };

  const handleDeclineFriend = async (id: number) => {
    try {
      await api.post(`/friends/decline/${id}`);
      loadFriendRequests();
    } catch (err) {
      showToast(errorMsg(err, "Erreur lors du refus"));
      loadFriendRequests();
    }
  };

  const handleCancelSentRequest = async (id: number) => {
    if (!confirm("Annuler cette demande d'ami ?")) return;
    try {
      await api.delete(`/friends/requests/${id}`);
      loadSentRequests();
    } catch (err) {
      showToast(errorMsg(err, "Erreur lors de l'annulation"));
    }
  };

  const handleRemoveFriend = async (username: string) => {
    if (!confirm(`Retirer ${username} de vos amis ?`)) return;
    try {
      await api.delete(`/friends/${encodeURIComponent(username)}`);
      loadFriends();
    } catch (err) {
      showToast(errorMsg(err, "Erreur lors de la suppression"));
    }
  };

  const handleInviteFriend = async (username: string) => {
    try {
      const res = await api.post<InvitationDTO>(
        `/invitation/send?receiverUsername=${encodeURIComponent(username)}`
      );
      if (res.data.gameId) {
        navigate(`/game/${res.data.gameId}`);
        return;
      }
      setSentTo((prev) => new Set(prev).add(username));
    } catch (err) {
      showToast(errorMsg(err, "Impossible d'envoyer l'invitation"));
    }
  };

  const handleAcceptInvitation = async (inv: InvitationDTO) => {
    try {
      const res = await api.post<InvitationDTO>(`/invitation/accept/${inv.id}`);
      if (res.data.gameId) navigate(`/game/${res.data.gameId}`);
    } catch (err) {
      showToast(errorMsg(err, "Erreur lors de l'acceptation"));
      loadInvitations(); // resync au cas où l'invitation n'existe plus
    }
  };

  const handleDeclineInvitation = async (id: number) => {
    try {
      await api.post(`/invitation/decline/${id}`);
      loadInvitations();
    } catch (err) {
      showToast(errorMsg(err, "Erreur lors du refus"));
      loadInvitations();
    }
  };

  const pendingReceivedCount = friendRequests.length + invitations.length;

  return (
    <div className="lobby-page">
      <header className="lobby-header">
        <h1>Lobby</h1>
        <p className="lobby-subtitle">Retrouvez vos amis et lancez une partie</p>
      </header>

      <div className="lobby-grid">
        <main className="lobby-main">
          <section className="lobby-card">
            <h2 className="lobby-card-title">
              Mes amis
              <span className="lobby-card-count">{friends.length}</span>
            </h2>

            {friends.length === 0 ? (
              <div className="lobby-empty">
                Pas encore d'amis. Ajoutez-en avec le formulaire à droite,
                ou directement depuis une partie en cours.
              </div>
            ) : (
              <ul className="lobby-items">
                {friends.map((f) => (
                  <li key={f.id} className="lobby-row">
                    <div className="lobby-row-info">
                      <span className="lobby-row-name">{f.friendUsername}</span>
                      <span className="lobby-row-meta">ELO {f.friendElo}</span>
                    </div>
                    <div className="lobby-row-actions">
                      <button
                        className="btn-pill"
                        onClick={() => handleInviteFriend(f.friendUsername)}
                        disabled={sentTo.has(f.friendUsername)}
                      >
                        {sentTo.has(f.friendUsername) ? "Invité ✓" : "Inviter"}
                      </button>
                      <button
                        className="btn-square danger"
                        onClick={() => handleRemoveFriend(f.friendUsername)}
                        title="Retirer des amis"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {ongoingGames.length > 0 && (
            <section className="lobby-card">
              <h2 className="lobby-card-title">
                Parties en cours
                <span className="lobby-card-count">{ongoingGames.length}</span>
              </h2>
              <ul className="lobby-items">
                {ongoingGames.map((g) => (
                  <li key={g.id} className="lobby-row">
                    <div className="lobby-row-info">
                      <span className="lobby-row-name">
                        {g.player1Username} <span className="lobby-vs">vs</span> {g.player2Username ?? "?"}
                      </span>
                      <span className="lobby-row-meta">En cours</span>
                    </div>
                    <button className="btn-pill" onClick={() => navigate(`/game/${g.id}`)}>
                      Reprendre
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>

        <aside className="lobby-sidebar">
          <section className="lobby-card">
            <h2 className="lobby-card-title">Ajouter un ami</h2>
            <div className="lobby-form">
              <input
                className="lobby-input"
                type="text"
                value={searchPseudo}
                onChange={(e) => setSearchPseudo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendFriendRequest()}
                placeholder="Pseudo..."
              />
              <button
                className="btn-block"
                onClick={handleSendFriendRequest}
                disabled={!searchPseudo.trim()}
              >
                Envoyer la demande
              </button>
            </div>
          </section>

          {pendingReceivedCount > 0 && (
            <section className="lobby-card">
              <h2 className="lobby-card-title">
                En attente
                <span className="lobby-card-count">{pendingReceivedCount}</span>
              </h2>
              <ul className="lobby-items">
                {invitations.map((inv) => (
                  <li key={`inv-${inv.id}`} className="lobby-row pending pending-game">
                    <div className="lobby-row-info">
                      <span className="lobby-row-name">{inv.senderUsername}</span>
                      <span className="lobby-row-meta">Invitation à jouer</span>
                    </div>
                    <div className="lobby-row-actions">
                      <button className="btn-square accept" title="Accepter" onClick={() => handleAcceptInvitation(inv)}>✓</button>
                      <button className="btn-square danger" title="Refuser" onClick={() => handleDeclineInvitation(inv.id)}>✕</button>
                    </div>
                  </li>
                ))}

                {friendRequests.map((f) => (
                  <li key={`fr-${f.id}`} className="lobby-row pending pending-friend">
                    <div className="lobby-row-info">
                      <span className="lobby-row-name">{f.requester}</span>
                      <span className="lobby-row-meta">Demande d'ami</span>
                    </div>
                    <div className="lobby-row-actions">
                      <button className="btn-square accept" title="Accepter" onClick={() => handleAcceptFriend(f.id)}>✓</button>
                      <button className="btn-square danger" title="Refuser" onClick={() => handleDeclineFriend(f.id)}>✕</button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {sentRequests.length > 0 && (
            <section className="lobby-card">
              <h2 className="lobby-card-title">
                Demandes envoyées
                <span className="lobby-card-count">{sentRequests.length}</span>
              </h2>
              <ul className="lobby-items">
                {sentRequests.map((f) => (
                  <li key={`sent-${f.id}`} className="lobby-row sent">
                    <div className="lobby-row-info">
                      <span className="lobby-row-name">{f.addressee}</span>
                      <span className="lobby-row-meta">En attente de réponse</span>
                    </div>
                    <button
                      className="btn-square danger"
                      title="Annuler la demande"
                      onClick={() => handleCancelSentRequest(f.id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}