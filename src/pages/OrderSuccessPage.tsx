// src/pages/OrderSuccessPage.tsx
import { useLocation, Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";
import { useBackButton } from "@/hooks/useBackButton";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/api/services/orders.api";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandHeader } from "@/components/shared/BrandHeader";

const OrderSuccessSkeleton = () => (
    <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-6 animate-pulse">
            <Skeleton className="h-22 w-22 rounded-full mb-6" />
            <Skeleton className="h-8 w-3/4 max-w-sm mb-2" /> {/* h-8 для text-2xl */}
            <Skeleton className="h-6 w-1/2 max-w-xs mb-4" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="mt-8 w-full max-w-sm space-y-3">
                <Skeleton className="h-control-md w-full rounded-2xl" />
                <Skeleton className="h-control-md w-full rounded-2xl" />
            </div>
        </div>
    </>
);

export const OrderSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();
    const numericOrderId = Number(orderId);
    
    const initialData = location.state?.order;
    
    useBackButton();
    useEffect(() => {
        const handleBack = () => navigate('/', { replace: true });
        if (window.Telegram?.WebApp?.BackButton) {
            window.Telegram.WebApp.BackButton.onClick(handleBack);
        }
        return () => {
            if (window.Telegram?.WebApp?.BackButton) {
                window.Telegram.WebApp.BackButton.offClick(handleBack);
            }
        }
    }, [navigate]);

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['order', numericOrderId],
        queryFn: () => getOrderById(numericOrderId),
        enabled: !isNaN(numericOrderId),
        placeholderData: initialData,
    });

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
        visible: { pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };
    
    const checkVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: { pathLength: 1, opacity: 1, transition: { duration: 0.3, ease: "easeOut", delay: 0.4 } }
    };

    if (isLoading && !order) {
        return <OrderSuccessSkeleton />;
    }

    if (isError) {
        return (
            <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
                <div className="p-4 text-center">Не удалось загрузить данные о заказе.</div>
            </>
        );
    }

    return (
        <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
            <motion.div 
                className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <svg width="88" height="88" viewBox="0 0 24 24" className="text-primary">
                        <motion.path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" variants={circleVariants} />
                        <motion.path d="M22 4 12 14.01l-3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" variants={checkVariants} />
                    </svg>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-2xl font-bold mt-6">
                    Спасибо за ваш заказ!
                </motion.h1>

                {order?.number && (
                    <motion.p variants={itemVariants} className="text-lg text-muted-foreground">
                        Номер вашего заказа: <span className="font-semibold text-foreground">#{order.number}</span>
                    </motion.p>
                )}

                <motion.p variants={itemVariants} className="mt-4 max-w-sm text-muted-foreground text-sm">
                    Наш менеджер скоро свяжется с вами для подтверждения деталей.
                </motion.p>

                <motion.div variants={itemVariants} className="mt-8 w-full max-w-sm space-y-3">
                    <Button asChild size="lg" className="w-full h-control-md text-base rounded-2xl">
                        <Link to={`/orders/${orderId}`}>Посмотреть заказ</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full h-control-md text-base rounded-2xl">
                        <Link to="/">Вернуться на главную</Link>
                    </Button>
                </motion.div>
            </motion.div>
        </>
    );
};