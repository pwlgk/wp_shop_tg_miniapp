// src/components/shared/BirthdayStory.tsx
import type { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";

export const BirthdayStory = ({ notification, onClose }: { notification: Notification; onClose: () => void; }) => {
    // Ищем число баллов в сообщении
    const pointsMatch = notification.message?.match(/\d+/);
    const points = pointsMatch ? pointsMatch[0] : '';
    const messageParts = notification.message?.split(points) || [notification.message];

    // --- Варианты анимаций, аналогичные OrderSuccessPage ---
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
    
    // Анимация "рисования" подарка
    const giftVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.8, ease: "easeInOut" }
        }
    };
    
    return (
        // Используем motion.div как корневой элемент для каскадной анимации
        <motion.div 
            className="relative flex flex-col items-center justify-center w-full h-full p-6 text-center text-foreground overflow-hidden bg-background"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Анимированная иконка и текст */}
            <div className="flex-grow flex flex-col items-center justify-center">
                <motion.div variants={itemVariants}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="88"
                        height="88"
                        viewBox="0 0 24 24"
                        className="text-primary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {/* Анимируем контуры подарка */}
                        <motion.path d="M20 12v10H4V12" variants={giftVariants} />
                        <motion.path d="M2 7h20v5H2z" variants={giftVariants} />
                        <motion.path d="M12 22V7" variants={giftVariants} />
                        <motion.path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" variants={giftVariants} />
                        <motion.path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" variants={giftVariants} />
                    </svg>
                </motion.div>
                
                <motion.h2 variants={itemVariants} className="text-3xl font-bold mt-6">
                    {notification.title}
                </motion.h2>

                {notification.message && (
                    <motion.p variants={itemVariants} className="mt-2 text-lg text-muted-foreground max-w-sm">
                        {messageParts[0]}
                        {points && <span className="font-bold text-primary text-2xl mx-1">{points}</span>}
                        {messageParts[1]}
                    </motion.p>
                )}
            </div>
            
            <motion.div variants={itemVariants} className="w-full max-w-sm pb-4">
                <Button size="lg" className="w-full h-12 text-base rounded-2xl" onClick={onClose}>
                    Отлично!
                </Button>
            </motion.div>
        </motion.div>
    );
};