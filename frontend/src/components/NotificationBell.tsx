import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/notificationStore.ts";
import { api } from "../api/api.ts";
import { showToast } from "../utils/toast.ts";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate        = useNavigate();
  const ref             = useRef<HTMLDivElement>(null);

  const notifications  = useNotificationStore((s) => s.notifications);
  const readIds        = useNotificationStore((s) => s.readIds);
  const dismiss        = useNotificationStore((s) => s.dismiss);
  const dismissAll     = useNotificationStore((s) => s.dismissAll);
  const markAllAsRead  = useNotificationStore((s) => s.markAllAsRead);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  // Marquer toutes comme lues quand on ouvre la cloche
  // (et aussi si de nouvelles arrivent pendant qu'elle est ouverte)
  useEffect(() => {
    if (open) markAllAsRead();
  }, [open, notifications.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Click-outside pour fermer
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotifClick = (n: typeof notifications[0]) => {
    if (n.type === "invitation" && n.invitationId) {
      api.post(`/invitation/accept/${n.invitationId}`)
        .then((res) => {
          if (res.data.gameId) navigate(`/game/${res.data.gameId}`);
          dismiss(n.id);
          setOpen(false);
        })
        .catch(() => showToast("Erreur lors de l'acceptation."));
    } else if (n.gameId) {
      navigate(`/game/${n.gameId}`);
      dismiss(n.id);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 20, padding: "4px 8px", position: "relative", color: "#e5e5e5",
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 0, right: 0,
            background: "#e53935", color: "#fff",
            borderRadius: "50%", width: 17, height: 17,
            fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 300, background: "#1c1c1c", border: "1px solid #333",
          borderRadius: 10, zIndex: 2000, padding: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#e5e5e5" }}>Notifications</span>
            {notifications.length > 0 && (
              <button onClick={dismissAll} style={{
                background: "none", border: "none", color: "#888",
                cursor: "pointer", fontSize: 12,
              }}>
                Tout effacer
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ color: "#555", fontSize: 13, textAlign: "center", margin: "16px 0" }}>
              Aucune notification
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
              {notifications.map((n) => (
                <div key={n.id} style={{
                  background: "#242424", borderRadius: 8, padding: "10px 12px",
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8,
                  border: "1px solid #2e2e2e",
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#e5e5e5", lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    {(n.gameId || n.invitationId) && (
                      <button onClick={() => handleNotifClick(n)} style={{
                        marginTop: 6, background: "none", border: "none",
                        color: "#4da3ff", cursor: "pointer", fontSize: 12, padding: 0,
                      }}>
                        {n.type === "invitation" ? "Accepter et jouer →" : "Rejoindre la partie →"}
                      </button>
                    )}
                  </div>
                  <button onClick={() => dismiss(n.id)} style={{
                    background: "none", border: "none", color: "#666",
                    cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px", flexShrink: 0,
                  }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}