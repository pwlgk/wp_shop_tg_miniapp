// src/components/shared/PromoStory.tsx
import { useState, useEffect } from "react";
import type { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { toast } from "sonner";

export const PromoStory = ({ notification, onClose }: { notification: Notification; onClose: () => void; }) => {
    const navigate = useNavigate();
    const controls = useAnimation();
    const [isPaused, setIsPaused] = useState(false);
    
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
        if (isPaused) {
            controls.stop();
        } else {
            controls.start({
                width: "100%",
                transition: { duration: DURATION, ease: "linear" }
            });
        }
    }, [isPaused, controls, DURATION]);

    const handleActionClick = () => {
        onClose();
        if (notification.action_url) {
            navigate(notification.action_url);
        }
    };

    const copyPromoCode = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            toast.success("Промокод скопирован!");
        });
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
            className="relative flex flex-col w-full h-full max-w-md max-h-[90vh] bg-muted rounded-2xl text-white overflow-hidden"
        >
            {/* ИСПРАВЛЕНИЕ ФОТО: Добавляем z-10 */}
            <div className="absolute inset-0 z-10">
                {notification.image_url && (
                    <img src={notification.image_url} alt={notification.title} className="w-full h-full object-cover" loading="lazy" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            {/* z-20 для всего контента, чтобы он был поверх фото */}
            <div className="relative z-20 flex flex-col h-full">
                <div className="p-3">
                    <div className="relative h-1 w-full bg-white/30 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-white" initial={{ width: '0%' }} animate={controls} />
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        {/* <p className="font-bold text-white text-shadow text-sm">Название Магазина</p> */}
                        {/* <Button variant="ghost" size="icon" className="h-control-xs w-control-xs rounded-full bg-black/30 hover:bg-black/50 text-white" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button> */}
                    </div>
                </div>

                <div className="w-full mt-auto p-5 space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-shadow">{notification.title}</h2>
                        {notification.message && (
                            <p className="text-lg opacity-90 text-shadow line-clamp-4">{notification.message}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {notification.action_url && (
                            <Button size="lg" className="flex-grow h-control-md text-base rounded-2xl" onClick={handleActionClick}>
                                {notification.action_text || 'Подробнее'}
                            </Button>
                        )}
                        {notification.promo_code && (
                            <Button variant="outline" size="icon" className="h-control-md w-control-md rounded-2xl shrink-0 bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => copyPromoCode(notification.promo_code!)}>
                                <Copy className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};