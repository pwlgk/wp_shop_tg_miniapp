// src/components/shared/PromoStory.tsx
import type { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBackButton } from "@/hooks/useBackButton";

export const PromoStory = ({ notification, onClose }: { notification: Notification; onClose: () => void; }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const hasLongMessage = (notification.message?.length || 0) > 100;
    useBackButton(true);
    const handleActionClick = () => {
        onClose();
        if (notification.action_url) {
            navigate(notification.action_url);
        }
    };

    return (
        <div className="relative flex flex-col justify-center w-full h-full p-6 text-white overflow-hidden">
            {notification.image_url && <img src={notification.image_url} alt={notification.title} className="absolute inset-0 w-full h-full object-cover -z-10" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent -z-10" />

            <div className="flex items-end gap-4">
                {/* Основной текстовый контент */}
                <div className="flex-grow space-y-3">
                    <h2 className="text-3xl font-bold text-shadow">{notification.title}</h2>
                    {notification.message && (
                        <div
                            onClick={() => hasLongMessage && setIsExpanded(!isExpanded)}
                            className={cn("text-lg opacity-90 transition-all duration-300", hasLongMessage && 'cursor-pointer')}
                        >
                            <p className={cn(!isExpanded && hasLongMessage && 'line-clamp-3')}>
                                {notification.message}
                            </p>
                            {hasLongMessage && (
                                <div className="flex items-center gap-1 mt-2 text-sm font-medium">
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    <span>{isExpanded ? 'Свернуть' : 'Читать далее'}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- ОБНОВЛЕННАЯ КНОПКА --- */}
                {notification.action_url && (
                    <div className="shrink-0">
                        <Button
                            size="icon"
                            className="h-14 w-14  rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                            onClick={handleActionClick}
                        >
                            <ArrowRight className="h-7 w-7" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};