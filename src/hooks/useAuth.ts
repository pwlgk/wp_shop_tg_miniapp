// src/hooks/useAuth.ts

import { useEffect, useState } from 'react';
import { useRawInitData } from '@telegram-apps/sdk-react';
import { useAuthStore } from '@/store/authStore';
import { loginViaTelegram } from '@/api/services/auth.api';
import axios from 'axios';

export const useAuth = (isHydrated: boolean, sdkReady: boolean) => {
  const { accessToken, setTokens } = useAuthStore();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);

  const initDataRaw = useRawInitData();

  useEffect(() => {
    if (status !== 'pending' || !isHydrated || !sdkReady || accessToken) {
      return;
    }

    const authenticate = async () => {
      console.groupCollapsed('[useAuth] Starting Authentication Process');
      try {
        let authData: string | undefined = initDataRaw;
        console.log("Initial raw initData from SDK:", authData);
        
        if (!authData && import.meta.env.DEV) {
          console.warn("Using mock data for development.");
          authData = import.meta.env.VITE_MOCK_INIT_DATA;
          if (!authData) throw new Error('DEV MODE: VITE_MOCK_INIT_DATA is not defined.');
        }

        if (!authData) {
          throw new Error('Критическая ошибка: не найдены данные для инициализации (initData).');
        }
        
        const tokens = await loginViaTelegram(authData);
        console.log("Tokens received, passing to AuthStore...");
        setTokens(tokens);
        setStatus('success');
        console.log("Authentication successful.");

      } catch (err: unknown) {
        console.error("Authentication failed with error:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 429) {
            setError("Слишком много попыток входа. Пожалуйста, подождите минуту и перезапустите приложение.");
          } else {
            setError(err.response?.data?.detail || err.message || 'Произошла ошибка при аутентификации.');
          }
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Произошла неизвестная ошибка при аутентификации.');
        }
        setStatus('error');
      } finally {
        console.groupEnd();
      }
    };

    authenticate();
    
  }, [isHydrated, sdkReady, accessToken, initDataRaw, status, setTokens]);

  return {
    isLoading: status === 'pending',
    error,
    isAuthenticated: status === 'success' && !!accessToken,
  };
};