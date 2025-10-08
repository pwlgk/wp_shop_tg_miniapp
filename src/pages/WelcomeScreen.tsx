// src/pages/WelcomeScreen.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PartyPopper, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/api/services/user.api";

// Принимаем onDismiss в props
export const WelcomeScreen = ({ onDismiss }: { onDismiss: () => void }) => {
    const { data: dashboard } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-6 bg-background">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
            >
                <PartyPopper className="h-20 w-20 text-primary mb-4" />
            </motion.div>
            
            <h1 className="text-3xl font-bold">Добро пожаловать, {dashboard?.first_name || 'Гость'}!</h1>
            <p className="mt-2 max-w-sm text-muted-foreground">
                Давайте познакомимся! Заполните, пожалуйста, ваше имя и телефон, чтобы мы могли правильно оформить ваш первый заказ.
            </p>

            <div className="mt-8 w-full max-w-sm space-y-3">
                {/* При клике на "Заполнить", мы тоже вызываем onDismiss */}
                <Button asChild size="lg" className="w-full h-control-md text-base rounded-2xl" onClick={onDismiss}>
                    <Link to="/profile/edit">
                        <UserCheck className="mr-2 h-5 w-5" />
                        Заполнить профиль
                    </Link>
                </Button>
                <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full h-control-md text-base rounded-2xl"
                    onClick={onDismiss} // Вызываем onDismiss при пропуске
                >
                    Пропустить
                </Button>
            </div>
        </div>
    );
};