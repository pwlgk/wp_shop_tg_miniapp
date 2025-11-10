import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppRoutes } from './routes';
import { BotBlockedScreen } from './pages/BotBlockedScreen';
import { NotificationToasts } from './components/shared/NotificationToasts';
import { PromoNotificationModal } from './components/shared/PromoNotificationModal';
import { getDashboard } from './api/services/user.api';
import { getNotifications, readNotification } from './api/services/notifications.api';
import type { Notification } from './types';

// 📦 Telegram Apps SDK
import { init, isTMA, viewport } from '@telegram-apps/sdk';

// Локальный ключ для экрана блокировки
const BOT_BLOCKED_SHOWN_KEY = 'botBlockedScreenLastShown';

function App() {
  const queryClient = useQueryClient();

  const [screenToShow, setScreenToShow] = useState<'app' | 'bot_blocked' | 'loading'>('loading');
  const [promoToShow, setPromoToShow] = useState<Notification | null>(null);

  // --- Инициализация Telegram Mini App и fullscreen ---
  useEffect(() => {
    async function initTg() {
      if (await isTMA()) {
        init();

        // Монтируем viewport и разворачиваем
        if (viewport.mount.isAvailable()) {
          await viewport.mount();
          viewport.expand(); // пробуем fullscreen
        }

        // На некоторых iOS устройствах нужен requestFullscreen
        if (viewport.requestFullscreen.isAvailable()) {
          await viewport.requestFullscreen();
        }
      }
    }

    initTg();
  }, []);
  // --------------------------------------------------------

  // --- Dashboard ---
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  // --- Notifications ---
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

  // --- Управление экранами ---
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

    setScreenToShow('app');
  }, [dashboard, isDashboardLoading]);

  // --- Промо / уведомления ---
  useEffect(() => {
    if (unreadData?.items) {
      const firstPromo = unreadData.items.find(n =>
        n.type === 'promo' || n.title.toLowerCase().includes('днем рождения')
      );
      if (firstPromo) setPromoToShow(firstPromo);
    }
  }, [unreadData]);

  const handleBotBlockedDismiss = () => {
    localStorage.setItem(BOT_BLOCKED_SHOWN_KEY, Date.now().toString());
    setScreenToShow('app');
  };

  const handleClosePromo = () => {
    if (promoToShow) readMutation.mutate(promoToShow.id);
    setPromoToShow(null);
  };

  // --- UI ---
  if (screenToShow === 'loading') return null;
  if (screenToShow === 'bot_blocked') return <BotBlockedScreen onDismiss={handleBotBlockedDismiss} />;

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
