// src/App.tsx
import { AppRoutes } from './routes';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { BotBlockedScreen } from './pages/BotBlockedScreen';
import { NotificationToasts } from './components/shared/NotificationToasts';
import { PromoNotificationModal } from './components/shared/PromoNotificationModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboard } from './api/services/user.api';
import { getNotifications, readNotification } from './api/services/notifications.api';
import { useState, useEffect } from 'react';
import type { Notification } from './types';

const WELCOME_SCREEN_SHOWN_KEY = 'welcomeScreenLastShown';
const BOT_BLOCKED_SHOWN_KEY = 'botBlockedScreenLastShown';

function App() {
  const queryClient = useQueryClient();

  // --- ИСПРАВЛЕНИЕ: ВСЕ ХУКИ ВЫЗЫВАЮТСЯ НАВЕРХУ ---
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });
  
  const [screenToShow, setScreenToShow] = useState<'app' | 'welcome' | 'bot_blocked' | 'loading'>('loading');
  const [promoToShow, setPromoToShow] = useState<Notification | null>(null);

  const { data: unreadData } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => getNotifications({ size: 5, unread_only: true }),
    enabled: !!dashboard, // Запускаем только когда дашборд загружен
  });
  
  const readMutation = useMutation({
      mutationFn: (id: number) => readNotification(id),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
  });

  // --- Логика определения экрана для показа ---
  useEffect(() => {
    // Ждем, пока дашборд загрузится
    if (isDashboardLoading || !dashboard) {
        setScreenToShow('loading');
        return;
    }

    // 1. Проверка на блокировку бота
    if (dashboard.is_bot_accessible === false) {
        const lastShown = localStorage.getItem(BOT_BLOCKED_SHOWN_KEY);
        if (!lastShown || (Date.now() - parseInt(lastShown, 10)) > 12 * 60 * 60 * 1000) {
            setScreenToShow('bot_blocked');
            return;
        }
    }
    
    // 2. Проверка на онбординг
    if (dashboard.profile_completion_status === 'new_user_prompt') {
        const lastShown = localStorage.getItem(WELCOME_SCREEN_SHOWN_KEY);
        if (!lastShown || (Date.now() - parseInt(lastShown, 10)) > 24 * 60 * 60 * 1000) {
            setScreenToShow('welcome');
            return;
        }
    }
    
    // Если никакие экраны не нужны, показываем основное приложение
    setScreenToShow('app');
    
  }, [dashboard, isDashboardLoading]);

  // --- Логика для промо-уведомлений ---
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

  // --- Обработчики ---
  const handleWelcomeDismiss = () => {
    localStorage.setItem(WELCOME_SCREEN_SHOWN_KEY, Date.now().toString());
    setScreenToShow('app');
  };
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

  // --- Рендеринг ---
  
  // AppInitializer уже показывает лоадер, так что здесь можно ничего не показывать
  if (screenToShow === 'loading') {
    return null;
  }

  if (screenToShow === 'welcome') {
    return <WelcomeScreen onDismiss={handleWelcomeDismiss} />;
  }

  if (screenToShow === 'bot_blocked') {
    return <BotBlockedScreen onDismiss={handleBotBlockedDismiss} />;
  }
  
  // По умолчанию рендерим основное приложение
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