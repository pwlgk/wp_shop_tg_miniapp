// src/hooks/useDeepLink.ts
import { useLaunchParams } from '@tma.js/sdk-react';
import { useMemo } from 'react';

// Хук теперь возвращает объект с путем и флагом, был ли он "первым"
export interface DeepLinkResult {
    path: string | null;
    isFirstInSession: boolean;
}

export const useDeepLink = (): DeepLinkResult => {
    const launchParams = useLaunchParams();

    return useMemo(() => {
        const startParam = launchParams.startParam;
        if (!startParam) {
            return { path: null, isFirstInSession: false };
        }

        // Ключ для отслеживания, был ли ХОТЬ КАКОЙ-ТО deep link в этой сессии
        const sessionHandledKey = `session_deep_link_handled`;
        const isFirst = !sessionStorage.getItem(sessionHandledKey);
        
        if (isFirst) {
            sessionStorage.setItem(sessionHandledKey, 'true');
        }

        const [type, id] = startParam.split('-');
        let path: string | null = null;

        if (type === 'product' && id) path = `/product/${id}`;
        if (type === 'catalog' && id) path = `/catalog/${id}`;

        return { path, isFirstInSession: isFirst };
        
    }, [launchParams.startParam]);
};