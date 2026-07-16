import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
  react(),
  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'GlowTrack',
      short_name: 'GlowTrack',
      description: 'Smart Skincare & Medicine Routine Tracker',
      theme_color: '#fff5f6',
      background_color: '#fff5f6',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  })
],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
