// src/hooks/useTelegramContactRequest.ts
import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useTelegramContactRefresh = () => {
  const queryClient = useQueryClient();
  const webApp = useMemo(() => (window as any).Telegram?.WebApp, []);

  useEffect(() => {
    if (!webApp) return;

    const refetchUserData = () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const onViewportChanged = (event: { isStateStable: boolean }) => {
      if (event.isStateStable) {
        refetchUserData();
      }
    };
    
    webApp.onEvent('viewportChanged', onViewportChanged);

    return () => {
      webApp.offEvent('viewportChanged', onViewportChanged);
    };
  }, [webApp, queryClient]);

  // Хук теперь ничего не возвращает, он просто работает в фоне
};