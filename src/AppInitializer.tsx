// src/AppInitializer.tsx

import { useEffect, useState } from 'react';
// --- ИЗМЕНЕНИЕ: `useIsFetching` больше не нужен ---
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { init } from '@telegram-apps/sdk-react';

import { useIsHydrated } from './hooks/useIsHydrated';
import { useAuth } from './hooks/useAuth';
import { useDeepLink } from './hooks/useDeepLink';
import { getDashboard } from './api/services/user.api';
import { ErrorPage } from './pages/ErrorPage';
import App from './App';

const AppLoader = () => {
    const { resolvedTheme } = useTheme();
    const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';
    
    return (
        <div className="flex items-center justify-center h-screen w-screen bg-background">
            <motion.div
                initial={{ scale: 0.95, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
            >
                <img src={logoSrc} alt="Загрузка..." className="w-60 h-60" />
            </motion.div>
        </div>
    );
};

export const AppInitializer = () => {
    const navigate = useNavigate();
    const [sdkReady, setSdkReady] = useState(false);
    const [isNavigationDone, setIsNavigationDone] = useState(false);

    useEffect(() => {
        try {
            console.log('[AppInitializer] Initializing SDK...');
            init();
            setSdkReady(true);
            console.log('[AppInitializer] SDK init() called successfully.');
        } catch (error) {
            console.error('[AppInitializer] CRITICAL: Failed to initialize SDK!', error);
            setSdkReady(true);
        }
    }, []);

    const isHydrated = useIsHydrated();
    const { path: deepLinkPath, isFirstInSession } = useDeepLink();
    
    const { isLoading: isAuthLoading, error: authError, isAuthenticated } = useAuth(isHydrated, sdkReady);
    
    const { 
        data: dashboard, 
        isLoading: isDashboardLoading,
        isError: isDashboardError 
    } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getDashboard,
        enabled: isAuthenticated,
        retry: 1,
    });

    // --- ИЗМЕНЕНИЕ: Хук `useIsFetching` удален, так как он больше не используется ---

    useEffect(() => {
        // Логика диплинков теперь зависит только от isAuthenticated,
        // так как isDashboardLoading не должен ее блокировать.
        if (isAuthenticated && !isNavigationDone) {
            if (deepLinkPath) {
                navigate(deepLinkPath, { replace: isFirstInSession });
            }
            setIsNavigationDone(true);
        }
    }, [isAuthenticated, isNavigationDone, deepLinkPath, isFirstInSession, navigate]);

    // Логика состояния загрузки теперь зависит только от критических,
    // блокирующих операций.
    const isLoading = isAuthLoading || isDashboardLoading;

    if (isLoading) {
        return <AppLoader />;
    }

    if (authError) {
        return <ErrorPage statusCode={authError.status} message={authError.message} />;
    }
    
    if (!isAuthenticated) {
        return <ErrorPage statusCode={401} message="Не удалось аутентифицировать пользователя. Попробуйте перезапустить приложение." />;
    }

    if (isDashboardError) {
        return <ErrorPage statusCode={503} message="Не удалось загрузить данные пользователя." />;
    }
    
    if (dashboard?.is_blocked) {
        return <ErrorPage statusCode={403} message="Ваш аккаунт заблокирован. Пожалуйста, свяжитесь с поддержкой." />;
    }
    
    return <App />;
}