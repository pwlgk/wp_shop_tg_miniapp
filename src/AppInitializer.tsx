// src/AppInitializer.tsx
import { useEffect, useState } from 'react';
import { useIsHydrated } from './hooks/useIsHydrated';
import { useAuth } from './hooks/useAuth';
import { useDeepLink } from './hooks/useDeepLink';
import { useNavigate } from 'react-router-dom';
import App from './App';
import { motion } from 'framer-motion';
import { ErrorPage } from './pages/ErrorPage';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from './api/services/user.api';

const AppLoader = () => (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
        <motion.div
            // Анимация: бесконечное изменение прозрачности от 0.5 до 1
            animate={{ opacity: [0.5, 1, 0.5] }}
            // Настройки анимации: длительность 2 секунды, повторяется бесконечно
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            <img src="/vite.svg" alt="Загрузка..." className="w-40 h-40" />
        </motion.div>
    </div>
);
export const AppInitializer = () => {
    const navigate = useNavigate();
    const [isNavigationDone, setIsNavigationDone] = useState(false);

    const isHydrated = useIsHydrated();
    const { isLoading: isAuthLoading, error, isAuthenticated } = useAuth(isHydrated);
    const { path: deepLinkPath, isFirstInSession } = useDeepLink();
    const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getDashboard,
        enabled: isAuthenticated,
        retry: false, // Не повторяем запрос, если он упал (например, из-за 401)
    });
    useEffect(() => {
        if (!isNavigationDone) {
            if (deepLinkPath) {
                navigate(deepLinkPath, { replace: isFirstInSession });
            }
            setIsNavigationDone(true);
        }
    }, [deepLinkPath, isFirstInSession, isNavigationDone, navigate]);

    // Убрали isDashboardLoading из проверки
    const isLoading = !isHydrated || isAuthLoading || (isAuthenticated && isDashboardLoading);
    if (isLoading) {
        return <AppLoader />;
    }
    if (dashboard?.is_blocked) {
        return <ErrorPage statusCode={403} message="Ваш аккаунт заблокирован. Пожалуйста, свяжитесь с поддержкой." />;
    }
    if (error) {
        // Показываем универсальную страницу ошибки, если аутентификация не удалась
        return <ErrorPage statusCode={503} message="Не удалось связаться с сервером. Пожалуйста, проверьте ваше интернет-соединение." />;
    }
    if (!isAuthenticated) {
        return <ErrorPage statusCode={403} message="Не удалось аутентифицировать пользователя. Попробуйте перезапустить приложение." />;
    }
    return <App />;
}