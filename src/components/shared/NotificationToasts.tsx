// src/components/shared/NotificationToasts.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, readNotification } from '@/api/services/notifications.api';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

export const NotificationToasts = () => {
  const queryClient = useQueryClient();
  const [shownIds, setShownIds] = useState(new Set<number>());

  const { data } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => getNotifications({ size: 5, unread_only: true }),
    refetchInterval: 60000,
  });
  
  const readMutation = useMutation({
      mutationFn: (id: number) => readNotification(id),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
  });

  useEffect(() => {
    const unread = data?.items.filter(n => !shownIds.has(n.id)) ?? [];
    
    // Показываем ТОЛЬКО стандартные уведомления
    const standardNotifications = unread.filter(n => 
        n.type !== 'promo' && 
        !n.title.toLowerCase().includes('днем рождения')
    );

    if (standardNotifications.length > 0) {
      const timer = setTimeout(() => {
        standardNotifications.forEach((notification, index) => {
          setShownIds(prev => new Set(prev).add(notification.id));
          setTimeout(() => {
            toast(notification.title, {
              description: notification.message,
              icon: <Bell className="h-4 w-4" />,
              id: `notification-${notification.id}`,
              onDismiss: () => readMutation.mutate(notification.id),
              onAutoClose: () => readMutation.mutate(notification.id),
            });
          }, index * 400);
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [data, shownIds, readMutation]);

  return null;
};