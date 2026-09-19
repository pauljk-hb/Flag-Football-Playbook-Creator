import type { VitePWAOptions } from "vite-plugin-pwa";

export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: "prompt",
  devOptions: {
    enabled: true, // Erlaubt Service Worker im lokalen Dev-Server
    type: "module",
  },
  includeAssets: ["favicon.ico", "apple-touch-icon.png"],
  manifest: {
    name: "Playbook Designer",
    short_name: "Playbook",
    description: "Taktik-Board und Playbook-Management",
    theme_color: "#2D2D31",
    background_color: "#ffffff",
    display: "standalone",
    display_override: ["window-controls-overlay"],
    orientation: "portrait",
    icons: [
      {
        src: "pwa-desktop-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any", // Desktop (Windows/Mac) greift hier zu
      },
      {
        src: "pwa-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable", // Android nutzt ausschließlich dieses
      },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    navigateFallbackDenylist: [/^\/api\/auth/],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/deine-backend-api\.de\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 1 Tag
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "image-cache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Tage
          },
        },
      },
    ],
  },
};
