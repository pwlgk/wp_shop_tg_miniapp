// src/components/shared/BirthdayStory.tsx
import type { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { Gift, X } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const BirthdayStory = ({ notification, onClose }: { notification: Notification; onClose: () => void; }) => {
    const navigate = useNavigate();
    const controls = useAnimation();
    const [isPaused, setIsPaused] = useState(false);
    
    const pointsMatch = notification.message?.match(/\d+/);
    const points = pointsMatch ? pointsMatch[0] : '';
    const messageParts = notification.message?.split(points) || [notification.message];

    const DURATION = notification.duration || 10;

    useEffect(() => {
        const sequence = async () => {
            await controls.start({
                width: "100%",
                transition: { duration: DURATION, ease: "linear" }
            });
            onClose();
        };
        sequence();
    }, [controls, DURATION, onClose]);

    useEffect(() => {
        if (isPaused) controls.stop();
        else controls.start({ width: "100%", transition: { duration: DURATION, ease: "linear" } });
    }, [isPaused, controls, DURATION]);

    const handleActionClick = () => {
        onClose();
        if (notification.action_url) navigate(notification.action_url);
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ease: "easeOut", duration: 0.2 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_event, info) => { if (info.offset.y > 100) onClose(); }}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="relative flex flex-col w-full h-full max-w-md max-h-[90vh] bg-gradient-to-br from-primary to-rose-500 rounded-2xl text-white overflow-hidden"
        >
            <div className="relative z-20 flex flex-col h-full p-5">
                <div className="absolute top-0 left-0 right-0 p-3">
                    <div className="relative h-1 w-full bg-white/30 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-white" initial={{ width: '0%' }} animate={controls} />
                    </div>
                    <div className="flex justify-end items-center mt-3">
                        <Button variant="ghost" size="icon" className="h-control-xs w-control-xs rounded-full bg-black/20 hover:bg-black/30 text-white" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <Gift className="h-20 w-20" />
                    <h2 className="text-3xl font-bold mt-4">{notification.title}</h2>
                    {notification.message && (
                        <p className="mt-2 text-lg opacity-90 max-w-sm">
                            {messageParts[0]}
                            {points && <span className="font-bold text-2xl mx-1">{points}</span>}
                            {messageParts[1]}
                        </p>
                    )}
                </div>
                
                <div className="w-full">
                    <Button size="lg" className="w-full h-control-md text-base rounded-2xl bg-white text-primary hover:bg-white/90" onClick={handleActionClick}>
                        {notification.action_text || 'Получить подарок'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};