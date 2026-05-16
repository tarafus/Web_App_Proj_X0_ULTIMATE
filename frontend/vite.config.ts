import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
  },
  server: {
    host: true,   // écoute sur 0.0.0.0 → accessible depuis le LAN
    port: 5173,
  },
});