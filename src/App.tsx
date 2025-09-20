// src/App.tsx
import { AppRoutes } from './routes';
import { NotificationToasts } from './components/shared/NotificationToasts';
import { PromoNotificationModal } from './components/shared/PromoNotificationModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, readNotification } from './api/services/notifications.api';
import { useState, useEffect } from 'react';
import type { Notification } from './types';

function App() {
  const queryClient = useQueryClient();
  const [promoToShow, setPromoToShow] = useState<Notification | null>(null);

  const { data: unreadData } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => getNotifications({ size: 5, unread_only: true }),
    // Запускаем теперь всегда, т.к. App рендерится только для авторизованных
  });
  
  const readMutation = useMutation({
      mutationFn: (id: number) => readNotification(id),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
  });

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

  const handleClosePromo = () => {
    if (promoToShow) {
      readMutation.mutate(promoToShow.id);
    }
    setPromoToShow(null);
  };
  
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