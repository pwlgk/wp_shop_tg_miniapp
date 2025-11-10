// src/hooks/useWebAppReady.ts
import { useState, useEffect } from 'react';

/**
 * Простой и надежный хук, который возвращает true,
 * когда window.Telegram.WebApp полностью готово к использованию.
 */
export const useWebAppReady = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Получаем объект WebApp напрямую из window
    const webApp = (window as any).Telegram?.WebApp;

    if (webApp && webApp.ready) {
      // Используем официальный метод ready().
      // Callback-функция выполнится, когда API будет полностью готово.
      webApp.ready(() => {
        setIsReady(true);
      });
    } else {
        // Это может произойти, если скрипт Telegram еще не загрузился
        // или мы находимся не в Telegram.
        console.warn("Telegram WebApp script not found or ready method is not available.");
    }
  }, []); // Пустой массив зависимостей гарантирует, что эффект выполнится только один раз

  return isReady;
};