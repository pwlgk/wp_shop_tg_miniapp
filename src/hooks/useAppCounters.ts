// src/hooks/useAppCounters.ts
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/api/services/user.api';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAppCounters = () => {
  const { accessToken } = useAuthStore();
  const setFavoritesTotal = useFavoritesStore((state) => state.setTotal);
  
  // Локальное состояние для флага активных заказов
  const [hasActiveOrders, setHasActiveOrders] = useState(false);

  // Запрашиваем дашборд, который содержит все нужные нам данные
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'], // Используем тот же ключ, что и на HomePage
    queryFn: getDashboard,
    enabled: !!accessToken, // Запускаем только если пользователь авторизован
    staleTime: 1000 * 60 * 5, // Кэшируем данные на 5 минут
  });

  // Синхронизируем сторы и локальное состояние, когда приходят данные с сервера
  useEffect(() => {
    if (dashboardData) {
      // Здесь мы не используем setCart, так как он ожидает массив CartItem,
      // а в дашборде только счетчик. Обновим счетчик напрямую.
      // Важно: нужно обновить cartStore, чтобы он умел обновлять только счетчик.
      // Пока что оставим это, так как useCart уже синхронизирует полный состав корзины.
      // Главное - обновить счетчик избранного и флаг заказов.
      
      setFavoritesTotal(dashboardData.counters.favorite_items_count);
      setHasActiveOrders(dashboardData.has_active_orders);
    }
  }, [dashboardData, setFavoritesTotal]);
  
  return {
    hasActiveOrders,
  };
};