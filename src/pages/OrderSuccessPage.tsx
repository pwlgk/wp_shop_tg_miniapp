// src/pages/OrderSuccessPage.tsx
import { useLocation, Link, useParams, useNavigate } from "react-router-dom"; // <-- ИСПРАВЛЕНИЕ 1
import { Button } from "@/components/ui/button";
// import { Check } from "lucide-react"; // Убрали, так как используем кастомный SVG
import { motion, type Variants } from "framer-motion"; // <-- Импортируем Variants
import { useBackButton } from "@/hooks/useBackButton";
import { useEffect } from "react";

export const OrderSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId } = useParams();
    
    const orderFromState = location.state?.order;
    
    useBackButton();
    useEffect(() => {
        const handleBack = () => navigate('/', { replace: true });
        // Проверяем, что объект существует, перед подпиской
        if (window.Telegram?.WebApp?.BackButton) {
            window.Telegram.WebApp.BackButton.onClick(handleBack);
        }
        return () => {
            if (window.Telegram?.WebApp?.BackButton) {
                window.Telegram.WebApp.BackButton.offClick(handleBack);
            }
        }
    }, [navigate]);

    // --- ИСПРАВЛЕНИЕ 2: Явно типизируем варианты анимаций ---
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        },
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        },
    };

    const circleVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" } // "easeInOut" -> "easeOut" для лучшего вида
        }
    };
    
    const checkVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut", delay: 0.4 }
        }
    };

    return (
        <motion.div 
            className="flex flex-col items-center justify-center h-screen text-center p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="88"
                    height="88"
                    viewBox="0 0 24 24"
                    className="text-primary"
                >
                    <motion.path
                        d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={circleVariants}
                    />
                    <motion.path
                        d="M22 4 12 14.01l-3-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={checkVariants}
                    />
                </svg>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-2xl font-bold mt-6">
                Спасибо за ваш заказ!
            </motion.h1>

            {(orderFromState?.number || orderId) && (
                <motion.p variants={itemVariants} className="text-lg text-muted-foreground">
                    Номер вашего заказа: <span className="font-semibold text-foreground">#{orderFromState?.number || orderId}</span>
                </motion.p>
            )}

            <motion.p variants={itemVariants} className="mt-4 max-w-sm text-muted-foreground">
                Наш менеджер скоро свяжется с вами для подтверждения деталей.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 w-full max-w-sm space-y-3">
                <Button asChild size="lg"             className="w-full h-12 text-base rounded-2xl"
>
                    <Link to={`/orders/${orderId}`}>Посмотреть заказ</Link>
                </Button>
                <Button asChild variant="outline" size="lg"             className="w-full h-12 text-base rounded-2xl"
>
                    <Link to="/">Вернуться на главную</Link>
                </Button>
            </motion.div>
        </motion.div>
    );
};