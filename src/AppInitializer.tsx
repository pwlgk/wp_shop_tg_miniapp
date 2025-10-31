// src/AppInitializer.tsx

import { useEffect, useState } from 'react';
import { init } from '@telegram-apps/sdk-react';
import { useIsHydrated } from './hooks/useIsHydrated';
import { useAuth } from './hooks/useAuth';
import { useDeepLink } from './hooks/useDeepLink';
import { useNavigate } from 'react-router-dom';
import App from './App';
import { motion } from 'framer-motion';
import { ErrorPage } from './pages/ErrorPage';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from './api/services/user.api';
import { useTheme } from 'next-themes';

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
    const [isNavigationDone, setIsNavigationDone] = useState(false);
    const [sdkReady, setSdkReady] = useState(false);

    useEffect(() => {
        try {
            console.log('AppInitializer: Initializing SDK...');
            init();
            console.log('AppInitializer: SDK init() called successfully.');
            setSdkReady(true);
        } catch (error) {
            console.error('AppInitializer: CRITICAL - Failed to initialize SDK!', error);
        }
    }, []);

    const isHydrated = useIsHydrated();
    const { path: deepLinkPath, isFirstInSession } = useDeepLink();
    
    // Теперь этот вызов корректен, так как useAuth принимает 2 аргумента
    const { isLoading: isAuthLoading, error: authError, isAuthenticated } = useAuth(isHydrated, sdkReady);
    
    const { data: dashboard, isLoading: isDashboardLoading, isError: isDashboardError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getDashboard,
        enabled: isAuthenticated,
        retry: 1,
    });

    useEffect(() => {
        if (!isNavigationDone && sdkReady) {
            if (deepLinkPath) {
                console.log(`AppInitializer: Navigating to deep link path: ${deepLinkPath}`);
                navigate(deepLinkPath, { replace: isFirstInSession });
            }
            setIsNavigationDone(true);
        }
    }, [deepLinkPath, isFirstInSession, isNavigationDone, navigate, sdkReady]);

    const isLoading = 
        !isHydrated || 
        !sdkReady ||
        isAuthLoading || 
        !isNavigationDone || 
        (isAuthenticated && isDashboardLoading);

    if (isLoading) {
        return <AppLoader />;
    }

    if (authError) {
        return <ErrorPage statusCode={401} message={authError} />;
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