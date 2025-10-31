// src/hooks/useAuth.ts

import { useEffect, useState } from 'react';
import { useRawInitData } from '@telegram-apps/sdk-react';
import { useAuthStore } from '@/store/authStore';
import { loginViaTelegram } from '@/api/services/auth.api';

// --- ИЗМЕНЕНИЕ 1: Добавляем sdkReady в параметры хука ---
export const useAuth = (isHydrated: boolean, sdkReady: boolean) => {
  const { accessToken, setToken } = useAuthStore();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);

  const initDataRaw = useRawInitData();

  useEffect(() => {
    // Детальное логирование для отладки
    console.log('[useAuth Hook]', {
      isHydrated,
      sdkReady,
      hasAccessToken: !!accessToken,
      initDataRaw: initDataRaw ? `present (${initDataRaw.length} chars)` : 'missing',
      status
    });

    // --- ИЗМЕНЕНИЕ 2: Ждем, пока и гидрация, и SDK будут готовы ---
    if (!isHydrated || !sdkReady) {
      // Если одно из условий не выполнено, мы просто выходим и ждем следующего ре-рендера.
      // Не меняем статус, чтобы хук оставался в состоянии 'pending'.
      return;
    }

    if (accessToken) {
      // Если токен уже есть, аутентификация не нужна.
      if (status !== 'success') {
        setStatus('success');
      }
      return;
    }

    // Если все готово, но initData нет - это критическая ошибка.
    if (!initDataRaw) {
      console.error('[useAuth Hook] CRITICAL: SDK is ready, but initDataRaw is missing. Cannot authenticate.');
      setError('Критическая ошибка: не найдены данные для инициализации (initData).');
      setStatus('error');
      return;
    }
    
    // Предотвращаем повторный запуск аутентификации, если она уже идет или завершилась
    if (status !== 'pending') {
        return;
    }

    const authenticate = async () => {
      try {
        console.log('[useAuth Hook] Authenticating with initData...');
        const response = await loginViaTelegram(initDataRaw);
        setToken(response.access_token);
        setStatus('success');
        console.log('[useAuth Hook] Authentication successful.');
      } catch (err: any) {
        console.error('[useAuth Hook] Authentication failed.', err);
        setError(err.message || 'Произошла ошибка при аутентификации.');
        setStatus('error');
      }
    };

    authenticate();
    
  }, [isHydrated, sdkReady, accessToken, setToken, initDataRaw, status]); // Добавлен status в зависимости

  return {
    isLoading: status === 'pending',
    error,
    isAuthenticated: status === 'success' && !!accessToken,
  };
};