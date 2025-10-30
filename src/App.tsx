// src/App.tsx
import { AppRoutes } from './routes';
import { BotBlockedScreen } from './pages/BotBlockedScreen';
import { NotificationToasts } from './components/shared/NotificationToasts';
import { PromoNotificationModal } from './components/shared/PromoNotificationModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboard } from './api/services/user.api';
import { getNotifications, readNotification } from './api/services/notifications.api';
import { useState, useEffect } from 'react';
import type { Notification } from './types';

// Оставляем только ключ для экрана блокировки бота
const BOT_BLOCKED_SHOWN_KEY = 'botBlockedScreenLastShown';

function App() {
   useEffect(() => {
    try {
      const tgWebApp = (window as any).Telegram?.WebApp;
      if (tgWebApp) {
        // 1. Немедленный вызов. Сработает в большинстве случаев (deep link, inline-кнопки).
        tgWebApp.expand();

        // 2. "Страховочный" вызов с небольшой задержкой.
        // Это нужно именно для запуска через Menu Button, когда WebView может инициализироваться медленнее.
        const timer = setTimeout(() => {
          tgWebApp.expand();
        }, 150); // 150 мс - оптимальное время, незаметное для пользователя

        // Очищаем таймер при размонтировании компонента
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Failed to expand Telegram Web App:", error);
    }
  }, []);
  
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });
  
  const [screenToShow, setScreenToShow] = useState<'app' | 'bot_blocked' | 'loading'>('loading');
  const [promoToShow, setPromoToShow] = useState<Notification | null>(null);

  const { data: unreadData } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => getNotifications({ size: 5, unread_only: true }),
    enabled: !!dashboard,
  });
  
  const readMutation = useMutation({
      mutationFn: (id: number) => readNotification(id),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
  });

  useEffect(() => {
    if (isDashboardLoading || !dashboard) {
        setScreenToShow('loading');
        return;
    }

    if (dashboard.is_bot_accessible === false) {
        const lastShown = localStorage.getItem(BOT_BLOCKED_SHOWN_KEY);
        if (!lastShown || (Date.now() - parseInt(lastShown, 10)) > 12 * 60 * 60 * 1000) {
            setScreenToShow('bot_blocked');
            return;
        }
    }
    
    // Если никакие специальные экраны не нужны, показываем приложение
    setScreenToShow('app');
    
  }, [dashboard, isDashboardLoading]);

  useEffect(() => {
    if (unreadData?.items) {
      const firstPromo = unreadData.items.find(n => 
          n.type === 'promo' || n.title.toLowerCase().includes('днем рождения')
      );
      if (firstPromo) {
        setPromoToShow(firstPromo);
      }
    }
  }, [unreadData]);

  const handleBotBlockedDismiss = () => {
    localStorage.setItem(BOT_BLOCKED_SHOWN_KEY, Date.now().toString());
    setScreenToShow('app');
  };
  
  const handleClosePromo = () => {
    if (promoToShow) {
      readMutation.mutate(promoToShow.id);
    }
    setPromoToShow(null);
  };  

  if (screenToShow === 'loading') {
    return null;
  }

  if (screenToShow === 'bot_blocked') {
    return <BotBlockedScreen onDismiss={handleBotBlockedDismiss} />;
  }
  
  return (
    <>
      <AppRoutes />
      <NotificationToasts />
      <PromoNotificationModal 
        notification={promoToShow}
        onClose={handleClosePromo}
      />
    </>
  );
}

export default App;