import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "assets",
  server: {
    strictPort: true,
  },
  worker: {
    format: "es",
  },
});
