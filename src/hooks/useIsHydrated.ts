// src/hooks/useIsHydrated.ts
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useIsHydrated = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Эта функция из zustand/persist позволяет нам подписаться на событие
    // окончания гидратации.
    const unsubHydrate = useAuthStore.persist.onHydrate(() => setIsHydrated(false));
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));

    // Устанавливаем начальное состояние
    setIsHydrated(useAuthStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return isHydrated;
};