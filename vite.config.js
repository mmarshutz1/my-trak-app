import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      // 1. Tells the app to check for updates automatically
      registerType: "autoUpdate",

      // 2. Injects the service worker registration code for you
      injectRegister: "auto",

      // 3. Forces the new update to instantly take over the old one
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        // Caches your local assets for instant offline loading
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },

      // 4. Tells Vite to use the physical manifest.json we created in the public folder
      manifest: false,
    }),
  ],
  // Note: We removed the optimizeDeps for "recharts" since we
  // built our own custom hardware-accelerated SVG charts!
});
