// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk';
import { useAuthStore } from '@/store/authStore';
import { loginViaTelegram } from '@/api/services/auth.api.ts';

// Принимаем isHydrated как аргумент-сигнал
export const useAuth = (isHydrated: boolean) => {
  const { accessToken, setToken } = useAuthStore();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Не начинаем работу, пока zustand не закончил гидратацию
    if (!isHydrated) {
      return;
    }

    // 2. Если после гидратации токен уже есть, работа завершена
    if (accessToken) {
      setStatus('success');
      return;
    }

    // 3. Если токена нет, запускаем процесс получения
    const authenticate = async () => {
      try {
        const launchParams = retrieveLaunchParams();
        const initDataRaw = launchParams.initDataRaw;

        if (initDataRaw) {
          const response = await loginViaTelegram(initDataRaw);
          setToken(response.access_token);
          setStatus('success');
        } else if (import.meta.env.DEV) {
          const mockInitData = "user=...&hash=..."; // ВАШ МОКОВЫЙ initData
          if (!mockInitData.includes('user')) {
             throw new Error('Please, provide mock initData string in useAuth.ts');
          }
          const response = await loginViaTelegram(mockInitData);
          setToken(response.access_token);
          setStatus('success');
        } else {
          throw new Error('Telegram initData not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Authentication failed.');
        setStatus('error');
      }
    };

    authenticate();
  }, [isHydrated, accessToken, setToken]); // Запускаемся, когда isHydrated станет true

  return { 
    // Загрузка идет, пока не завершена гидратация ИЛИ пока статус в ожидании
    isLoading: !isHydrated || status === 'pending', 
    error, 
    isAuthenticated: status === 'success' && !!accessToken
  };
};