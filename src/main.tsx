// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
// --- ИЗМЕНЕНИЕ 1: Импортируем 'MutationCache' и 'QueryCache' ---
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { AppInitializer } from './AppInitializer';
import { Toaster } from "@/components/ui/sonner";
import './index.css';
import { ScrollToTop } from './components/shared/ScrollToTop';
// --- ИЗМЕНЕНИЕ 2: Импортируем наш универсальный обработчик ---
import { handleApiError } from './api/errorHandler';

// --- ИЗМЕНЕНИЕ 3: Создаем QueryClient с новой, более мощной конфигурацией ---
const queryClient = new QueryClient({
  // --- Глобальный обработчик для ВСЕХ МУТАЦИЙ (useMutation) ---
  mutationCache: new MutationCache({
    onError: (error) => {
      // Передаем ошибку в наш централизованный хелпер, который покажет toast
      handleApiError(error);
    },
  }),

  // --- Глобальный обработчик для ВСЕХ ЗАПРОСОВ (useQuery) ---
  queryCache: new QueryCache({
    onError: (error) => {
      // Исключаем ошибки аутентификации (401) и авторизации (403),
      // так как они обрабатываются в AppInitializer и должны показывать ErrorPage, а не toast.
      const status = (error as any)?.response?.status;
      if (status !== 401 && status !== 403) {
        handleApiError(error);
      }
    },
  }),

  // Опции по умолчанию для всех запросов
  defaultOptions: {
    queries: {
      retry: 1, // Повторять запрос 1 раз при ошибке
      staleTime: 1000 * 60 * 5, // Считать данные "свежими" в течение 5 минут
    },
    // `mutations` блок больше не нужен здесь, так как мы используем `mutationCache`
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <BrowserRouter>
        <ScrollToTop />
        <QueryClientProvider client={queryClient}>
          <AppInitializer />
          {/* Toaster для показа уведомлений */}
          <Toaster richColors position="top-center" />
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);