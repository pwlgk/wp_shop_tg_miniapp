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
import { useTheme } from 'next-themes'; // <-- 1. Импортируем хук для темы

// --- ОБНОВЛЕННЫЙ КОМПОНЕНТ ЗАГРУЗЧИКА ---
const AppLoader = () => {
    const { resolvedTheme } = useTheme(); // 2. Получаем "решенную" тему (light или dark)

    // 3. Определяем, какой логотип показывать
    const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';
    
    return (
        <div className="flex items-center justify-center h-screen w-screen bg-background">
            <motion.div
                // 4. Новая, более сложная анимация
                initial={{ scale: 0.95, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse", // Анимация будет проигрываться вперед-назад
                    ease: "easeInOut"
                }}
            >
                <img src={logoSrc} alt="Загрузка..." className="w-60 h-60" />
            </motion.div>
        </div>
    );
};
// --- КОНЕЦ КОМПОНЕНТА ЗАГРУЗЧИКА ---

export const AppInitializer = () => {
    const navigate = useNavigate();
    const [isNavigationDone, setIsNavigationDone] = useState(false);

    const isHydrated = useIsHydrated();
    const { isLoading: isAuthLoading, error, isAuthenticated } = useAuth(isHydrated);
    const { path: deepLinkPath, isFirstInSession } = useDeepLink();
    
    // Переносим запрос дашборда сюда для правильного порядка хуков
    const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getDashboard,
        enabled: isAuthenticated, // Запускаем, только если пользователь аутентифицирован
        retry: 1,
    });

    useEffect(() => {
        if (!isNavigationDone) {
            if (deepLinkPath) {
                navigate(deepLinkPath, { replace: isFirstInSession });
            }
            setIsNavigationDone(true);
        }
    }, [deepLinkPath, isFirstInSession, isNavigationDone, navigate]);

    // Обновленная проверка isLoading
    const isLoading = !isHydrated || isAuthLoading || !isNavigationDone || (isAuthenticated && isDashboardLoading);

    if (isLoading) {
        return <AppLoader />;
    }

    // Проверка на блокировку должна идти до проверки на общую ошибку
    if (dashboard?.is_blocked) {
        return <ErrorPage statusCode={403} message="Ваш аккаунт заблокирован. Пожалуйста, свяжитесь с поддержкой." />;
    }
    
    if (error) {
        return <ErrorPage statusCode={503} message="Не удалось связаться с сервером. Пожалуйста, проверьте ваше интернет-соединение." />;
    }
    
    if (!isAuthenticated) {
        return <ErrorPage statusCode={401} message="Не удалось аутентифицировать пользователя. Попробуйте перезапустить приложение." />;
    }
    
    return <App />;
}