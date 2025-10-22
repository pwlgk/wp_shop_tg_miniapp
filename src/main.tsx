// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { SDKProvider } from '@tma.js/sdk-react';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { AppInitializer } from './AppInitializer'; // <-- Импортируем
import { Toaster } from "@/components/ui/sonner";
import './index.css';
import { ScrollToTop } from './components/shared/ScrollToTop';
import { toast } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Повторять запрос 1 раз при ошибке
    },
    mutations: {
      onError: (error: any) => {
        // Глобальный обработчик для всех мутаций
        const message = error.response?.data?.detail || "Произошла ошибка. Попробуйте снова.";
        toast.error("Ошибка", { description: message });
      }
    }
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SDKProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange> {/*theme system */}
        <BrowserRouter>
        <ScrollToTop />
          <QueryClientProvider client={queryClient}>

            <AppInitializer /> {/* <-- Рендерим AppInitializer вместо App */}
            <Toaster />
          </QueryClientProvider>
        </BrowserRouter>
      </ThemeProvider>
    </SDKProvider>
  </React.StrictMode>
);