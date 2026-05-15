/**
 * Petit toast pour remplacer alert() sans le bandeau "localhost:5173 dit:".
 *
 * Usage :
 *   import { showToast } from "../utils/toast.ts";
 *   showToast("Identifiants invalides");
 *
 * Tout est en JS pur (pas de React, pas de CSS externe), donc il suffit
 * d'importer la fonction où tu en as besoin.
 */

let container: HTMLDivElement | null = null;

function getContainer(): HTMLDivElement {
  if (container && document.body.contains(container)) return container;

  container = document.createElement("div");
  container.style.cssText = [
    "position: fixed",
    "bottom: 20px",
    "right: 20px",
    "display: flex",
    "flex-direction: column",
    "gap: 10px",
    "z-index: 9999",
    "pointer-events: none",
  ].join(";");
  document.body.appendChild(container);
  return container;
}

export function showToast(message: string) {
  const c = getContainer();

  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = [
    "pointer-events: auto",
    "min-width: 240px",
    "max-width: 380px",
    "padding: 12px 16px",
    "border-radius: 8px",
    "background: #1c1c1c",
    "border: 1px solid #333",
    "border-left: 4px solid #4da3ff",
    "color: #e5e5e5",
    "font-family: Inter, system-ui, sans-serif",
    "font-size: 14px",
    "line-height: 1.4",
    "cursor: pointer",
    "box-shadow: 0 8px 24px rgba(0,0,0,0.5)",
    "opacity: 0",
    "transform: translateX(20px)",
    "transition: opacity 0.25s ease, transform 0.25s ease",
  ].join(";");

  const remove = () => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    setTimeout(() => toast.remove(), 250);
  };

  toast.onclick = remove;
  c.appendChild(toast);

  // Force un reflow puis anime l'entrée
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });

  // Auto-dismiss après 3.5s
  setTimeout(remove, 3500);
}