// src/components/shared/OrderListItem.tsx
import type { Order } from "@/types";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

// Функция для перевода и стилизации статусов
const getStatusInfo = (status: string): { text: string; className: string } => {
    switch (status) {
        case 'processing': return { text: 'В обработке', className: 'bg-blue-100 text-blue-800' };
        case 'on-hold': return { text: 'На удержании', className: 'bg-amber-100 text-amber-800' };
        case 'completed': return { text: 'Выполнен', className: 'bg-green-100 text-green-800' };
        case 'cancelled': return { text: 'Отменен', className: 'bg-gray-100 text-gray-800' };
        default: return { text: status, className: 'bg-muted text-muted-foreground' };
    }
};

export const OrderListItem = ({ order }: { order: Order }) => {
    const statusInfo = getStatusInfo(order.status);

    return (
        <Link to={`/orders/${order.id}`} state={{ order }} className="block p-4 border rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">Заказ №{order.number}</h3>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(order.date_created), "d MMMM yyyy", { locale: ru })}
                    </p>
                </div>
                <Badge className={cn("capitalize", statusInfo.className)}>{statusInfo.text}</Badge>
            </div>
            <div className="flex justify-between items-end mt-4">
                <div className="relative flex items-center h-12">
                    {order.line_items.slice(0, 3).map((item, index) => (
                        <div key={index} className="absolute h-12 w-12 rounded-3xl border-2 border-background bg-muted overflow-hidden" style={{ left: `${index * 24}px`, zIndex: 3 - index }}>
                            {item.image_url && <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />}
                        </div>
                    ))}
                    {order.line_items.length > 3 && (
                        <div className="absolute h-12 w-12 rounded-3xl border-2 border-background bg-secondary flex items-center justify-center text-secondary-foreground font-bold" style={{ left: `${3 * 24}px`, zIndex: 0 }}>
                            +{order.line_items.length - 3}
                        </div>
                    )}
                </div>
                <p className="text-xl font-bold">{parseFloat(order.total).toFixed(0)} ₽</p>
            </div>
        </Link>
    );
};