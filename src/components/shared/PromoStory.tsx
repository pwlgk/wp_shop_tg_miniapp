// src/components/shared/PromoStory.tsx
import type { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export const PromoStory = ({ notification, onClose }: { notification: Notification; onClose: () => void; }) => {
    const navigate = useNavigate();

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
        <>
            {/* Блок с изображением, занимает все доступное место */}
            <div className="flex-grow flex items-center justify-center min-h-0 pt-6">
                {notification.image_url && (
                    <img
                        src={notification.image_url}
                        alt={notification.title}
                        className="max-w-full max-h-full object-contain rounded-2xl"
                        loading="lazy"
                    />
                )}
            </div>

            {/* Блок с контентом, прижат к низу */}
            <div className="shrink-0 pt-4 space-y-4">
                <div className="px-4 space-y-1 text-center">
                    <h2 className="text-2xl font-bold">{notification.title}</h2>
                    {notification.message && (
                        <p className="text-muted-foreground text-sm">
                            {notification.message}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {notification.action_url && (
                        <Button
                            size="lg"
                            className="flex-grow h-control-md text-base rounded-2xl"
                            onClick={handleActionClick}
                        >
                            {notification.action_text || 'Подробнее'}
                        </Button>
                    )}
                    {notification.promo_code && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-control-md w-control-md rounded-2xl shrink-0"
                            onClick={() => copyPromoCode(notification.promo_code!)}
                        >
                            <Copy className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
};