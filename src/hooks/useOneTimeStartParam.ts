// src/hooks/useOneTimeStartParam.ts
import { useLaunchParams } from '@tma.js/sdk-react';
import { useMemo } from 'react';

// Этот хук считывает startParam и сразу "сжигает" его, чтобы он не сработал снова
export const useOneTimeStartParam = (): string | null => {
    const launchParams = useLaunchParams();

    return useMemo(() => {
        const startParam = launchParams.startParam;
        
        console.log(`[useOneTimeStartParam] Raw launch param:`, startParam);

        if (!startParam) {
            return null;
        }

        const handledKey = `deep_link_handled_${startParam}`;
        if (sessionStorage.getItem(handledKey)) {
            console.log(`[useOneTimeStartParam] Deep link "${startParam}" was already handled in this session.`);
            return null;
        }
        
        console.log(`[useOneTimeStartParam] Processing NEW deep link: "${startParam}"`);
        sessionStorage.setItem(handledKey, 'true'); // "Сжигаем"
        
        return startParam; // Возвращаем параметр для обработки
        
    }, [launchParams.startParam]);
};