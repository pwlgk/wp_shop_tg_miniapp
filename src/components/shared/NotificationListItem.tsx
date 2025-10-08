// src/components/shared/NotificationListItem.tsx
import type { Notification } from "@/types";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Bell, ShoppingCart, Gift, Cake, Sparkles, ChevronRight, Users, AlertTriangle } from "lucide-react";

interface NotificationListItemProps {
  notification: Notification;
}

// Helper-функция для определения иконки и ссылки
const getNotificationDetails = (notification: Notification) => {
    let icon: React.ReactNode;
    let linkTo: string | null = null;

    const baseIconClass = "h-5 w-5 text-muted-foreground";

    // Определяем иконку на основе типа
    if (notification.title.toLowerCase().includes('днем рождения')) {
        icon = <Cake className={baseIconClass} />;
    } else {
        switch (notification.type) {
            case 'order_status_update':
            case 'points_earned':
            case 'order_spend':
                icon = <ShoppingCart className={baseIconClass} />;
                break;
            case 'referral_earn':
            case 'promo_referral_welcome':
                icon = <Users className={baseIconClass} />;
                break;
            case 'promo':
                icon = <Gift className={baseIconClass} />;
                break;
            case 'points_update':
            case 'admin_adjust_add':
            case 'admin_adjust_sub':
                icon = <Sparkles className={baseIconClass} />;
                break;
            case 'expired':
                icon = <AlertTriangle className={baseIconClass} />;
                break;
            default:
                icon = <Bell className={baseIconClass} />;
                break;
        }
    }

    // Определяем ссылку
    if (notification.action_url) {
        linkTo = notification.action_url;
    } else if (notification.related_entity_id && ['order_status_update', 'points_earned', 'order_spend'].includes(notification.type)) {
        linkTo = `/orders/${notification.related_entity_id}`;
    }

    return { icon, linkTo };
};


export const NotificationListItem = ({ notification }: NotificationListItemProps) => {
    const { icon, linkTo } = getNotificationDetails(notification);

    const content = (
        <div className={cn(
            "flex gap-4 p-4 items-center transition-colors", 
            // Индикатор непрочитанного
            !notification.is_read ? 'bg-primary/5' : '',
            // Эффект при наведении, если есть ссылка
            linkTo ? 'hover:bg-muted' : ''
        )}>
            {/* Индикатор-точка для непрочитанных */}
            <div className="flex-shrink-0">
                <div className={cn("h-2 w-2 rounded-full", !notification.is_read ? 'bg-primary' : 'bg-transparent')} />
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                {icon}
            </div>
            <div className="flex-grow min-w-0"> {/* min-w-0 предотвращает выход текста за рамки */}
                <p className="font-semibold truncate">{notification.title}</p>
                {notification.message && <p className="text-sm text-muted-foreground truncate">{notification.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(notification.created_at), "d MMMM yyyy, HH:mm", { locale: ru })}
                </p>
            </div>
            {linkTo && <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
        </div>
    );

    if (linkTo) {
        return <Link to={linkTo}>{content}</Link>;
    }
    
    return <div>{content}</div>;
};