import Board from "../components/Board.tsx";
import Chat from "../components/Chat.tsx";
import { useGameStore } from "../store/gameStore.ts";
import { useUIStore } from "../store/uiStore.ts";
import { useAuthStore } from "../store/authStore.ts";
import { useChatStore, ChatMessage } from "../store/chatStore.ts";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import { useGameWebSocket } from "../hooks/useGameWebSocket.ts";
import "../styles/game.css";

interface GameInfo {
  id: number;
  player1Id: number | null;
  player2Id: number | null;
  player1Username: string | null;
  player2Username: string | null;
  status: string;
}

type RematchState = "idle" | "sent" | "received";
type FriendStatus = "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "FRIENDS" | "SELF";

export default function Game() {
  const { id } = useParams();
  const gameId = Number(id);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [mySymbol, setMySymbol] = useState<"X" | "O" | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const [rematchState, setRematchState]         = useState<RematchState>("idle");
  const [rematchRequester, setRematchRequester] = useState<string | null>(null);
  const rematchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [opponentLeft, setOpponentLeft] = useState(false);
  const [pingDone, setPingDone]         = useState(false);
  const [abandonedBy, setAbandonedBy]   = useState<string | null>(null);
  const [confirmAbandon, setConfirmAbandon] = useState(false);

  const [friendStatus, setFriendStatus] = useState<FriendStatus>("NONE");

  const joinSentRef     = useRef(false);
  const globalWinnerRef = useRef<string | null>(null);

  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const globalWinner  = useGameStore((s) => s.globalWinner);

  const setBoard          = useGameStore((s) => s.setState);
  const setSubWinners     = useGameStore((s) => s.setSubWinners);
  const setCurrentPlayer  = useGameStore((s) => s.setCurrentPlayer);
  const setGlobalWinner   = useGameStore((s) => s.setGlobalWinner);
  const setActiveSubBoard = useGameStore((s) => s.setActiveSubBoard);
  const resetGameStore    = useGameStore((s) => s.reset);

  const setChatMessages = useChatStore((s) => s.setMessages);
  const addChatMessage  = useChatStore((s) => s.addMessage);
  const clearChat       = useChatStore((s) => s.clear);

  const chatOpen   = useUIStore((s) => s.chatOpen);
  const toggleChat = useUIStore((s) => s.toggleChat);

  useEffect(() => { globalWinnerRef.current = globalWinner; }, [globalWinner]);

  useEffect(() => {
    setGameInfo(null);
    setMySymbol(null);
    setError(null);
    setRematchState("idle");
    setRematchRequester(null);
    setOpponentLeft(false);
    setPingDone(false);
    setAbandonedBy(null);
    setConfirmAbandon(false);
    setFriendStatus("NONE");
    if (rematchTimeoutRef.current) {
      clearTimeout(rematchTimeoutRef.current);
      rematchTimeoutRef.current = null;
    }
    joinSentRef.current = false;
    resetGameStore();
    clearChat();
  }, [gameId]);

  const {
    sendJoin, sendState, sendLeave, sendAbandon, sendChatMessage,
    sendRematchRequest, sendRematchAccept, sendRematchDecline,
  } = useGameWebSocket(
    gameId,
    (state) => {
      if (state.board)                       setBoard(state.board);
      if (state.subWinners)                  setSubWinners(state.subWinners);
      if (state.currentPlayer !== undefined) setCurrentPlayer(state.currentPlayer);
      if (state.globalWinner  !== undefined) setGlobalWinner(state.globalWinner);
      if (state.activeSubBoard !== undefined) setActiveSubBoard(state.activeSubBoard);
    },
    (msg) => {
      if (msg.startsWith("[JOIN]")) {
        api.get(`/game/${gameId}`).then((res) => setGameInfo(res.data)).catch(() => {});
      } else if (msg.startsWith("[PLAYER_LEFT]")) {
        const who = msg.substring("[PLAYER_LEFT] ".length).trim();
        const me  = useAuthStore.getState().user?.username;
        if (who && me && who !== me) setOpponentLeft(true);
      } else if (msg.startsWith("[ABANDON]")) {
        setAbandonedBy(msg.substring("[ABANDON] ".length).trim());
      } else if (msg.startsWith("[REMATCH_REQUEST]")) {
        const other = msg.substring("[REMATCH_REQUEST] ".length).trim();
        const me    = useAuthStore.getState().user?.username;
        if (other && me && other !== me) {
          setRematchState("received");
          setRematchRequester(other);
        }
      } else if (msg.startsWith("[REMATCH_ACCEPTED]")) {
        const newGameId = msg.substring("[REMATCH_ACCEPTED] ".length).trim();
        if (rematchTimeoutRef.current) {
          clearTimeout(rematchTimeoutRef.current);
          rematchTimeoutRef.current = null;
        }
        navigate(`/game/${newGameId}`);
      } else if (msg.startsWith("[REMATCH_DECLINED]")) {
        if (rematchTimeoutRef.current) {
          clearTimeout(rematchTimeoutRef.current);
          rematchTimeoutRef.current = null;
        }
        setRematchState("idle");
        navigate("/");
      }
    },
    (chatMsg) => addChatMessage(chatMsg)
  );

  useEffect(() => {
    return () => {
      if (!globalWinnerRef.current) {
        const username = useAuthStore.getState().user?.username ?? "";
        sendLeave(username);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return;
    api.post(`/game/join/${gameId}`)
      .then((res) => {
        const info: GameInfo = res.data;
        setGameInfo(info);
        if      (info.player1Id === user.id) setMySymbol("X");
        else if (info.player2Id === user.id) setMySymbol("O");
      })
      .catch((err) => {
        if (err.response?.status === 400) setError("Cette partie est déjà complète.");
        else setError("Impossible de rejoindre la partie.");
      });
  }, [gameId, user]);

  useEffect(() => {
    if (!gameInfo) return;
    api.get(`/game/${gameId}/state`)
      .then((res) => {
        const s = res.data;
        if (s.board)                       setBoard(s.board);
        if (s.subWinners)                  setSubWinners(s.subWinners);
        if (s.currentPlayer !== undefined) setCurrentPlayer(s.currentPlayer);
        if (s.globalWinner  !== undefined) setGlobalWinner(s.globalWinner);
        if (s.activeSubBoard !== undefined) setActiveSubBoard(s.activeSubBoard);
      })
      .catch((e) => console.error("Erreur GET state:", e));
  }, [gameInfo, gameId]);

  useEffect(() => {
    if (!gameInfo) return;
    api.get<ChatMessage[]>(`/game/${gameId}/messages`)
      .then((res) => setChatMessages(res.data))
      .catch(() => {});
  }, [gameInfo, gameId]);

  useEffect(() => {
    if (!gameInfo || !user) return;
    if (joinSentRef.current) return;
    joinSentRef.current = true;
    const t = setTimeout(() => sendJoin(user.username), 300);
    return () => clearTimeout(t);
  }, [gameInfo, user]);

  // Charger le statut d'amitié avec l'adversaire
  useEffect(() => {
    if (!gameInfo || !user) return;
    const opponent = gameInfo.player1Id === user.id
      ? gameInfo.player2Username
      : gameInfo.player1Username;
    if (!opponent) return;

    api.get<{ status: FriendStatus }>(`/friends/status/${encodeURIComponent(opponent)}`)
      .then((res) => setFriendStatus(res.data.status))
      .catch(() => {});
  }, [gameInfo, user]);

  const handleMove = (move: { sub: number; cell: number }) => {
    if (!mySymbol || globalWinner) return;
    if (currentPlayer !== mySymbol) return;
    if (!gameInfo?.player2Id) return;

    useGameStore.getState().play(move.sub, move.cell);
    const s = useGameStore.getState();
    sendState({
      sub: move.sub, cell: move.cell,
      board: s.board, subWinners: s.subWinners,
      currentPlayer: s.currentPlayer, globalWinner: s.globalWinner,
      activeSubBoard: s.activeSubBoard,
    });
  };

  const handleChatSend = (content: string) => {
    if (!user) return;
    sendChatMessage(user.username, content);
  };

  const handleAddFriend = async () => {
    if (!gameInfo || !user) return;
    const opponent = gameInfo.player1Id === user.id
      ? gameInfo.player2Username
      : gameInfo.player1Username;
    if (!opponent) return;

    try {
      if (friendStatus === "PENDING_RECEIVED") {
        // Trouver l'id de la demande et l'accepter
        const reqs = await api.get<Array<{ id: number; requester: string }>>("/friends/requests");
        const req = reqs.data.find((r) => r.requester === opponent);
        if (req) {
          await api.post(`/friends/accept/${req.id}`);
          setFriendStatus("FRIENDS");
        }
      } else if (friendStatus === "NONE") {
        await api.post(`/friends/request?addressee=${encodeURIComponent(opponent)}`);
        setFriendStatus("PENDING_SENT");
      }
    } catch {
      alert("Erreur lors de l'ajout en ami.");
    }
  };

  const handleAbandonClick = () => setConfirmAbandon(true);
  const confirmAbandonAction = () => {
    if (!user) return;
    sendAbandon(user.username);
    setConfirmAbandon(false);
  };

  const handleRematchRequest = () => {
    if (!user) return;
    sendRematchRequest(user.username);
    setRematchState("sent");
    rematchTimeoutRef.current = setTimeout(() => {
      setRematchState("idle");
      alert("L'adversaire n'a pas répondu.");
    }, 15000);
  };

  const handleRematchAccept = () => {
    if (!user) return;
    sendRematchAccept(user.username);
    setRematchState("idle");
    setRematchRequester(null);
  };

  const handleRematchDecline = () => {
    if (!user) return;
    sendRematchDecline(user.username);
    setRematchState("idle");
    setRematchRequester(null);
    navigate("/");
  };

  const handlePing = async () => {
    await api.post(`/game/${gameId}/ping`).catch(() => {});
    setPingDone(true);
  };

  if (error) {
    return (
      <div className="game-page">
        <div className="game-left">
          <h1>Erreur</h1><p>{error}</p>
          <button className="btn-primary" onClick={() => navigate("/")}>Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  if (!gameInfo || !mySymbol) {
    return (
      <div className="game-page">
        <div className="game-left"><h1>Chargement de la partie...</h1></div>
      </div>
    );
  }

  const isMyTurn = currentPlayer === mySymbol;
  const waitingForOpponent = gameInfo.player2Id === null;
  const canPlay = !waitingForOpponent && isMyTurn && !globalWinner;
  const gameActive = !waitingForOpponent && !globalWinner;

  const opponentUsername = gameInfo.player1Id === user?.id
    ? gameInfo.player2Username
    : gameInfo.player1Username;

  // Texte du bouton d'amitié
  const friendBtnLabel =
    friendStatus === "FRIENDS"          ? "Déjà amis ✓"
    : friendStatus === "PENDING_SENT"   ? "Demande envoyée"
    : friendStatus === "PENDING_RECEIVED" ? "Accepter sa demande d'ami"
    : "Ajouter en ami";

  const friendBtnDisabled =
    friendStatus === "FRIENDS" || friendStatus === "PENDING_SENT" || friendStatus === "SELF";

  return (
    <div className="game-page">
      <div className="game-left">
        <h1>Partie</h1>
        <p>
          Vous êtes : <strong>{mySymbol}</strong>
          {gameInfo.player1Username && gameInfo.player2Username && (
            <> — {gameInfo.player1Username} (X) vs {gameInfo.player2Username} (O)</>
          )}
        </p>

        {/* Bouton ajouter en ami (visible dès qu'on a un adversaire) */}
        {opponentUsername && (
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={handleAddFriend}
              disabled={friendBtnDisabled}
              style={{
                padding: "6px 14px", borderRadius: 7,
                border: "1px solid #4da3ff", background: "transparent",
                color: friendBtnDisabled ? "#666" : "#4da3ff",
                fontSize: 13, cursor: friendBtnDisabled ? "default" : "pointer",
                fontFamily: "inherit", transition: "0.2s",
              }}
            >
              {friendBtnLabel}
            </button>
          </div>
        )}

        {waitingForOpponent ? (
          <p style={{ color: "#888" }}>En attente d'un second joueur...</p>
        ) : globalWinner ? (
          <>
            <h2 className="winner-banner">Le joueur {globalWinner} a gagné la partie !</h2>
            {abandonedBy && (
              <p style={{ color: "#888", textAlign: "center", marginTop: 4, fontSize: 14 }}>
                ({abandonedBy} a abandonné)
              </p>
            )}
          </>
        ) : (
          <p style={{ fontWeight: "bold", color: isMyTurn ? "#2e7d32" : "#999" }}>
            {isMyTurn ? "À vous de jouer" : "Tour de l'adversaire"}
          </p>
        )}

        {opponentLeft && !globalWinner && (
          <div style={{
            marginTop: 12, padding: "12px 16px", background: "#1c1c1c",
            border: "1px solid #555", borderRadius: 8, display: "flex",
            alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <span style={{ fontSize: 14 }}>Votre adversaire a quitté la partie.</span>
            <button
              onClick={handlePing} disabled={pingDone}
              style={{
                padding: "6px 14px", borderRadius: 7, border: "none",
                background: pingDone ? "#2a2a2a" : "#4da3ff",
                color: pingDone ? "#666" : "#fff",
                cursor: pingDone ? "default" : "pointer", fontSize: 13,
              }}
            >
              {pingDone ? "Rappel envoyé ✓" : "Rappeler l'adversaire"}
            </button>
          </div>
        )}

        <div style={{
          opacity: canPlay ? 1 : 0.6,
          pointerEvents: canPlay ? "auto" : "none",
          transition: "opacity 0.2s",
        }}>
          <Board onMove={handleMove} />
        </div>

        {gameActive && (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button
              onClick={handleAbandonClick}
              style={{
                padding: "8px 20px", borderRadius: 8,
                border: "1px solid #5a2a2a", background: "transparent",
                color: "#e57373", fontSize: 14, cursor: "pointer",
                transition: "0.2s", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#2a1a1a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Abandonner la partie
            </button>
          </div>
        )}

        {globalWinner && rematchState === "idle" && (
          <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center" }}>
            <button className="reset-btn" onClick={handleRematchRequest}>Rejouer</button>
            <button className="btn-secondary" onClick={() => navigate("/")}>Accueil</button>
          </div>
        )}
      </div>

      <div className={`game-right fixed-chat ${chatOpen ? "open" : "closed"}`}>
        <button className="chat-toggle-btn" onClick={toggleChat}>
          {chatOpen ? "→" : "←"}
        </button>
        {chatOpen && <Chat onSend={handleChatSend} />}
      </div>

      {confirmAbandon && (
        <div className="rematch-overlay">
          <div className="rematch-modal">
            <h2>Abandonner la partie ?</h2>
            <p>Votre adversaire remportera la victoire et votre ELO en sera affecté.</p>
            <div className="rematch-modal-buttons">
              <button className="rematch-btn-decline" onClick={() => setConfirmAbandon(false)}>Annuler</button>
              <button className="rematch-btn-accept" style={{ background: "#e57373" }} onClick={confirmAbandonAction}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {rematchState === "sent" && (
        <div className="rematch-overlay">
          <div className="rematch-modal">
            <h2><span className="rematch-spinner" /> En attente de l'adversaire</h2>
            <p>Votre demande de revanche a été envoyée.</p>
            <div className="rematch-modal-buttons">
              <button
                className="rematch-btn-decline"
                onClick={() => {
                  if (rematchTimeoutRef.current) {
                    clearTimeout(rematchTimeoutRef.current);
                    rematchTimeoutRef.current = null;
                  }
                  setRematchState("idle");
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {rematchState === "received" && (
        <div className="rematch-overlay">
          <div className="rematch-modal">
            <h2>Demande de revanche</h2>
            <p><strong>{rematchRequester}</strong> veut rejouer une partie.</p>
            <div className="rematch-modal-buttons">
              <button className="rematch-btn-accept" onClick={handleRematchAccept}>Accepter</button>
              <button className="rematch-btn-decline" onClick={handleRematchDecline}>Refuser</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}