// src/components/shared/BirthdayStory.tsx
import type { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useBackButton } from "@/hooks/useBackButton";

export const BirthdayStory = ({ notification, onClose }: { notification: Notification; onClose: () => void; }) => {
    const pointsMatch = notification.message?.match(/\d+/);
    const points = pointsMatch ? pointsMatch[0] : '';
    const messageParts = notification.message?.split(points) || [notification.message];
    useBackButton(true);
    return (
        <div className="relative flex flex-col justify-center items-center w-full h-full p-6 text-center text-foreground overflow-hidden bg-gradient-to-br from-amber-100 via-rose-100 to-violet-200">
            {/* Анимированная иконка и текст */}
            <div className="flex-grow flex flex-col items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Gift className="h-24 w-24 text-primary" strokeWidth={1.5} />
                </motion.div>

                <h2 className="text-3xl font-bold mt-6">{notification.title}</h2>

                {notification.message && (
                    <p className="mt-2 text-lg text-muted-foreground">
                        {messageParts[0]}
                        {points && <span className="font-bold text-primary text-2xl mx-1">{points}</span>}
                        {messageParts[1]}
                    </p>
                )}
            </div>

            {/* --- НОВАЯ КНОПКА "ЗАКРЫТЬ" --- */}
            <div className="w-full pb-4">
                <Button size="lg" className="w-full h-12 text-base" onClick={onClose}>
                    Закрыть
                </Button>
            </div>
        </div>
    );
};