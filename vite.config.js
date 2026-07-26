import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['metronome1.mp3', 'metronome2.mp3', 'MWV Tabla Loop 1.wav'],
      manifest: {
        name: 'TaalForge',
        short_name: 'TaalForge',
        description: 'The Professional Riyaz Companion: World-Class Taal Metronome & Practice SaaS',
        theme_color: '#0E0F1A',
        background_color: '#0E0F1A',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})