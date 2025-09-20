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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SDKProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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