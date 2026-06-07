import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST || "127.0.0.1";

export default defineConfig({
  clearScreen: false,
  plugins: [react()],
  server: {
    host,
    port: 1420,
    strictPort: true,
    hmr: {
      host,
      port: 1421,
      protocol: "ws",
    },
  },
});
