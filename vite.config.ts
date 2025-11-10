// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// import fs from 'fs'

// Мы убрали импорты tailwindcss и autoprefixer отсюда
// Мы убрали секцию css: { postcss: { ... } }

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // server: {
  //   host: 'kosynka.local', // Убедитесь, что здесь ваше имя домена
  //   port: 443,
  //   https: {
  //     // Убедитесь, что пути к сертификатам верны
  //     key: fs.readFileSync(path.resolve(__dirname, '.certs/kosynka.local-key.pem')),
  //     cert: fs.readFileSync(path.resolve(__dirname, '.certs/kosynka.local.pem')),
  //   },
  // },
  server: {
    // Явно разрешаем домен, с которого приходит запрос
    allowedHosts: ['app.ttfg.ru'],
  },
})