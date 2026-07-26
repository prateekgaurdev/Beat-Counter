import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'sitar-hero.webp'],
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
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/mojhivqchmrifaalrmsq\.supabase\.co\/storage\/v1\/object\/public\/.*$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-audio-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^http:\/\/localhost:3001\/api\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60 // 1 day fallback
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})