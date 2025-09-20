// src/components/shared/NotificationCard.tsx
import type { Notification } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Bell, ShoppingCart, Gift, Cake, Sparkles, X } from "lucide-react";
import { Button } from "../ui/button";

// --- Вложенные Компоненты для Разных Видов Уведомлений ---

// Компонент для стандартного, списочного уведомления
const StandardNotification = ({ notification, icon, children }: { notification: Notification, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className={cn("flex gap-4 p-4 border-l-4", !notification.is_read ? 'border-primary bg-primary/5' : 'border-transparent')}>
        <div className="mt-1">{icon}</div>
        <div className="flex-grow">
            <p className="font-semibold">{notification.title}</p>
            {children}
            <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(notification.created_at), "d MMMM yyyy, HH:mm", { locale: ru })}
            </p>
        </div>
    </div>
);

// Компонент для большого промо-уведомления (используется и в списке, и в модальном окне)
const PromoNotification = ({ notification, children }: { notification: Notification, children: React.ReactNode }) => (
    <div className={cn(
        "relative flex flex-col justify-end w-full p-6 text-white overflow-hidden",
        // В модальном окне скругляем, в списке - нет
        notification.image_url ? 'min-h-[60vh]' : 'min-h-[40vh] bg-gradient-to-br from-primary to-primary/70',
        !notification.is_read && 'border-2 border-primary'
    )}>
        {notification.image_url && <img src={notification.image_url} alt={notification.title} className="absolute inset-0 w-full h-full object-cover -z-10" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent -z-10" />
        <h2 className="text-3xl font-bold">{notification.title}</h2>
        {children}
    </div>
);


// --- Основной "Умный" Компонент ---

interface NotificationCardProps {
    notification: Notification;
    isModal?: boolean; // Флаг, указывающий, что рендер идет в модальном окне
    onCloseModal?: () => void; // Функция для закрытия модального окна
}

export const NotificationCard = ({ notification, isModal = false, onCloseModal }: NotificationCardProps) => {
    const navigate = useNavigate();
    
    // Определяем тип уведомления и его параметры
    let cardType: 'standard' | 'promo' | 'birthday' = 'standard';
    let icon = <Bell className="h-5 w-5 text-muted-foreground" />;
    let linkTo: string | null = null;
    
    if (notification.title.toLowerCase().includes('днем рождения') || notification.message?.toLowerCase().includes('день рождения')) {
        cardType = 'birthday';
    } else {
        switch (notification.type) {
            case 'order_status_update':
            case 'points_earned':
                icon = <ShoppingCart className="h-5 w-5 text-blue-500" />;
                if (notification.related_entity_id) {
                    linkTo = `/orders/${notification.related_entity_id}`;
                }
                break;
            case 'points_update':
                icon = <Sparkles className="h-5 w-5 text-amber-500" />;
                break;
            case 'promo':
                cardType = 'promo';
                break;
        }
    }
    
    // Определяем действие по клику для стандартных уведомлений
    const handleClick = () => {
        // Кликабельно только в списке, не в модальном окне
        if (isModal) return;
        if (linkTo) {
            navigate(linkTo);
        }
    };
    
    // Рендеринг в зависимости от типа
    if (cardType === 'promo' || cardType === 'birthday') {
        const PromoIcon = cardType === 'birthday' ? Cake : Gift;
        return (
            <div className={cn(isModal && "rounded-3xl overflow-hidden")}>
                {/* Если это модальное окно, добавляем кнопку "Закрыть" */}
                {isModal && (
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full" onClick={onCloseModal}>
                        <X />
                    </Button>
                )}
                <PromoNotification notification={notification}>
                    {notification.message && <p className="mt-2 text-lg opacity-90">{notification.message}</p>}
                    {notification.action_url && (
                        <Button asChild size="lg" className="mt-6 w-full h-12 text-base" onClick={onCloseModal}>
                            <Link to={notification.action_url}>
                                <PromoIcon className="mr-2 h-5 w-5" />
                                {cardType === 'birthday' ? 'Получить подарок' : 'Подробнее'}
                            </Link>
                        </Button>
                    )}
                </PromoNotification>
            </div>
        );
    }
    
    // Рендеринг стандартного, списочного уведомления
    return (
        <div onClick={handleClick} className={cn(linkTo && 'cursor-pointer')}>
            <StandardNotification notification={notification} icon={icon}>
                {notification.message && <p className="text-sm text-muted-foreground">{notification.message}</p>}
            </StandardNotification>
        </div>
    );
};