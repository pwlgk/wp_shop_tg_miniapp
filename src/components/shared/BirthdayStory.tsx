// src/components/shared/BirthdayStory.tsx
import type { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BirthdayStory = ({ notification, onClose }: { notification: Notification; onClose: () => void; }) => {
    const navigate = useNavigate();
    
    const pointsMatch = notification.message?.match(/\d+/);
    const points = pointsMatch ? pointsMatch[0] : '';
    const messageParts = notification.message?.split(points) || [notification.message];

    const handleActionClick = () => {
        onClose();
        if (notification.action_url) navigate(notification.action_url);
    };
    
    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6 gap-4">
            <div className="h-20 w-20 flex items-center justify-center rounded-full bg-primary/10">
                <Gift className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold">{notification.title}</h2>
                {notification.message && (
                    <p className="text-lg text-muted-foreground max-w-sm">
                        {messageParts[0]}
                        {points && <span className="font-bold text-primary text-2xl mx-1">{points}</span>}
                        {messageParts[1]}
                    </p>
                )}
            </div>
            
            <div className="w-full max-w-sm pt-4">
                <Button 
                    size="lg" 
                    className="w-full h-control-md text-base rounded-2xl" 
                    onClick={handleActionClick}
                >
                    {notification.action_text || 'Получить подарок'}
                </Button>
            </div>
        </div>
    );
};