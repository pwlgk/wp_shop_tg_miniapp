// src/hooks/useAppCounters.ts
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/api/services/user.api';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAppCounters = () => {
  const { accessToken } = useAuthStore();
  const setCartTotal = useCartStore((state) => state.setTotal);
  const setFavoritesTotal = useFavoritesStore((state) => state.setTotal);
  
  const [hasActiveOrders, setHasActiveOrders] = useState(false);

  // Мы по-прежнему используем этот запрос, но теперь он будет получать
  // данные из кэша, который заполнит AppInitializer.
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 1,
  });

  useEffect(() => {
    // Добавляем проверку, что dashboardData существует
    if (dashboardData) {
      // Это условие предотвратит ошибку "Cannot read properties of undefined"
      if (dashboardData.counters) {
        setCartTotal(dashboardData.counters.cart_items_count);
        setFavoritesTotal(dashboardData.counters.favorite_items_count);
      }
      setHasActiveOrders(dashboardData.has_active_orders);
    }
  }, [dashboardData, setCartTotal, setFavoritesTotal]);
  
  return {
    hasActiveOrders,
  };
};