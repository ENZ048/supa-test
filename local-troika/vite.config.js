import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // allow access from network
    port: 5173, // your port
    allowedHosts: [
      "92a161b07434.ngrok-free.app", // 👈 add your ngrok domain here
    ],
  },
});
