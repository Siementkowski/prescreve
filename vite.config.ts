import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt', // nunca atualiza sozinho — o usuário decide, via o aviso não intrusivo
      includeAssets: ['favicon-48.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Prescreve',
        short_name: 'Prescreve',
        description: 'Consultor de prescrições médicas',
        lang: 'pt-BR',
        theme_color: '#f5f2eb',
        background_color: '#f5f2eb',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // App-shell cacheado; os dados (base) são cacheados à parte, em IndexedDB, pelo core/sync.ts —
        // não pelo service worker. Aqui só garante que o app abre offline mesmo sem o SW ter
        // visto aquela rota antes.
        navigateFallback: '/index.html',
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
})
