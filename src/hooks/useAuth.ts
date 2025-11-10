// src/hooks/useAuth.ts

import { useEffect, useState } from 'react';
import { useRawInitData } from '@telegram-apps/sdk-react';
import { useAuthStore } from '@/store/authStore';
import { loginViaTelegram } from '@/api/services/auth.api';
import axios from 'axios';

interface AuthError {
  status: number;
  message: string;
}

export const useAuth = (isHydrated: boolean, sdkReady: boolean) => {
  const { accessToken, setTokens } = useAuthStore();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error] = useState<AuthError | null>(null);
  const initDataRaw = useRawInitData();

  useEffect(() => {
    console.log('[useAuth] Effect triggered. State:', { isHydrated, sdkReady, hasToken: !!accessToken });

    // --- Шаг 1: Ждем готовности окружения ---
    // Если гидрация не завершена или SDK не готов, ничего не делаем.
    if (!isHydrated || !sdkReady) {
        console.log('[useAuth] Waiting for hydration/SDK readiness.');
        return;
    }

    // --- Шаг 2: Проверяем, есть ли уже токен ---
    // Если токен есть, наша работа здесь закончена.
    // Сразу устанавливаем статус 'success' и выходим.
    if (accessToken) {
        console.log('[useAuth] Access token found in store. Setting status to success.');
        setStatus('success');
        return;
    }

    // --- Шаг 3: Если токена нет, запускаем аутентификацию ---
    // Этот блок выполнится только один раз, когда accessToken === null.
    const authenticate = async () => {
      console.groupCollapsed('[useAuth] No token found. Starting Authentication Process');
      try {
        let authData: string | undefined = initDataRaw;
        
        // Эта проверка нужна, так как initDataRaw может появиться не сразу
        if (!authData && !import.meta.env.DEV) {
            console.log('[useAuth] initData is not available yet. Waiting for it...');
            return; // Просто выйдем, эффект перезапустится, когда initDataRaw появится
        }
        
        if (!authData && import.meta.env.DEV) {
          console.warn("[useAuth] Using mock data for development.");
          authData = import.meta.env.VITE_MOCK_INIT_DATA;
          if (!authData) throw new Error('DEV MODE: VITE_MOCK_INIT_DATA is not defined.');
        }

        if (!authData) {
          throw new Error('Критическая ошибка: не найдены данные для инициализации (initData).');
        }
        
        const tokens = await loginViaTelegram(authData);
        setTokens(tokens);
        setStatus('success');
        console.log("Authentication successful.");

      } catch (err: unknown) {
        console.error("Authentication failed with error:", err);
        // ... (логика обработки ошибок остается такой же) ...
        if (axios.isAxiosError(err) && err.response) {
            // ...
        } else if (err instanceof Error) {
            // ...
        } else {
            // ...
        }
        setStatus('error');
      } finally {
        console.groupEnd();
      }
    };

    authenticate();
    
  // --- ИЗМЕНЕНИЕ: Убираем `status` из зависимостей! ---
  // Эффект должен зависеть только от внешних данных, а не от своего собственного состояния.
  }, [isHydrated, sdkReady, accessToken, initDataRaw, setTokens]);

  return {
    // isLoading теперь зависит не только от 'pending', но и от готовности окружения.
    // Это более честное состояние.
    isLoading: (!isHydrated || !sdkReady) || status === 'pending',
    error,
    isAuthenticated: status === 'success', // Проверяем только статус, т.к. при успехе токен уже точно есть
  };
};