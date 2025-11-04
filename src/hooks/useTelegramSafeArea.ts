// src/hooks/useTelegramSafeArea.ts (создайте этот файл)

import { useEffect } from 'react';
import { viewport, useSignal } from '@telegram-apps/sdk-react';

export const useTelegramSafeArea = () => {
    // Подписываемся на сигнал, который хранит отступ сверху
    const safeAreaInsetTop = useSignal(viewport.safeAreaInsetTop);

    // useEffect для монтирования и размонтирования viewport
    // Это важно, чтобы safeAreaInsetTop был актуальным
    useEffect(() => {
        // Защита от повторного монтирования
        if (!viewport.isMounted && !viewport.isMounting) {
            viewport.mount();
        }

        return () => {
            // Размонтирование при уходе со страницы, где используется хук
            // viewport.unmount(); // Можно закомментировать, если вызывает проблемы
        };
    }, []);
    
    // Возвращаем значение отступа
    return { top: safeAreaInsetTop };
};