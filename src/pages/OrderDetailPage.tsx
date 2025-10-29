// src/pages/OrderDetailPage.tsx
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import type { Order, OrderLineItem } from "@/types";
import { useBackButton } from "@/hooks/useBackButton";
import { useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrderById, cancelOrder } from "@/api/services/orders.api"; // <-- `cancelOrder` теперь используется
import { Skeleton } from "@/components/ui/skeleton"; // <-- `Skeleton` теперь используется
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // <-- `toast` теперь используется
import { Loader2, ChevronRight, User, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Функция для перевода статусов
const getStatusInfo = (status: string): { text: string; className: string } => {
    switch (status) {
        case 'processing': return { text: 'В обработке', className: 'bg-blue-100 text-blue-800' };
        case 'on-hold': return { text: 'На удержании', className: 'bg-amber-100 text-amber-800' };
        case 'completed': return { text: 'Выполнен', className: 'bg-green-100 text-green-800' };
        case 'cancelled': return { text: 'Отменен', className: 'bg-gray-100 text-gray-800' };
        default: return { text: status, className: 'bg-muted text-muted-foreground' };
    }
};

// Компонент для одной позиции в заказе
const OrderItemRow = ({ item }: { item: OrderLineItem }) => {
    const nameParts = item.name.split(' - ');
    const mainName = nameParts[0];
    const attributesString = nameParts.length > 1 ? nameParts.slice(1).join(', ') : null;

    return (
        <Link 
            to={`/product/${item.product_id}`} 
            className="flex gap-4 py-3 items-center hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
        >
            <img src={item.image_url || '/placeholder.svg'} alt={item.name} className="h-16 w-16 rounded-lg border object-cover shrink-0" />
            <div className="flex-grow min-w-0">
                <p className="font-medium line-clamp-2 leading-tight truncate">{mainName}</p>
                {attributesString && <p className="text-sm text-muted-foreground">{attributesString}</p>}
                <p className="text-sm text-muted-foreground">Кол-во: {item.quantity}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <p className="font-bold">{parseFloat(item.total as string).toFixed(0)} ₽</p>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
        </Link>
    );
};

// Скелетон для состояния загрузки
const OrderDetailSkeleton = () => (
    <div className="p-4 space-y-6 animate-pulse">
        <div className="space-y-1">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
        <div className="border-t pt-4 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
        </div>
    </div>
);

export const OrderDetailPage = () => {
    useBackButton();
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();
    const queryClient = useQueryClient();
    const initialData = location.state?.order as Order | undefined;

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['order', Number(orderId)],
        queryFn: () => getOrderById(Number(orderId)),
        placeholderData: initialData,
    });

    const cancelMutation = useMutation({
        mutationFn: () => cancelOrder(Number(orderId)),
        onSuccess: () => {
            toast.success("Заказ успешно отменен");
            queryClient.invalidateQueries({ queryKey: ['order', Number(orderId)] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
        onError: () => {
            toast.error("Не удалось отменить заказ");
        }
    });

    useEffect(() => {
        if (!isLoading && !order) {
            navigate('/orders', { replace: true });
        }
    }, [isLoading, order, navigate]);

    if (isLoading && !initialData) {
        return <OrderDetailSkeleton />;
    }
    
    if (isError) return <div className="p-4 text-center">Ошибка загрузки заказа.</div>;
    if (!order) return null;

    const statusInfo = getStatusInfo(order.status);
    const billing = order.billing;

    return (
        <div className="p-4 space-y-6 pb-24">
            <div>
                <h1 className="text-2xl font-bold">Заказ №{order.number}</h1>
                <p className="text-muted-foreground">
                    от {format(new Date(order.date_created), "d MMMM yyyy, HH:mm", { locale: ru })}
                </p>
                <Badge className={cn("text-base mt-2", statusInfo.className)}>{statusInfo.text}</Badge>
            </div>

            <Card className="rounded-2xl">
                <CardHeader><CardTitle>Состав заказа</CardTitle></CardHeader>
                <CardContent className="divide-y -mx-4">
                    {order.line_items.map((item, index) => <OrderItemRow key={`${item.product_id}-${index}`} item={item} />)}
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader><CardTitle>Данные получателя</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm"><User className="h-4 w-4 text-muted-foreground" /> <span>{`${billing.first_name || ''} ${billing.last_name || ''}`.trim() || 'Не указано'}</span></div>
                    <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> <span>{billing.phone || 'Не указано'}</span></div>
                    <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /> <span>{billing.email || 'Не указано'}</span></div>
                    <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>{billing.city || 'Не указано'}</span></div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader><CardTitle>Детали оплаты</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Метод оплаты</span><span>{order.payment_method_title}</span></div>
                    <div className="flex justify-between pt-2 border-t font-bold text-xl"><span>Итого</span><span>{parseFloat(order.total).toFixed(0)} ₽</span></div>
                </CardContent>
            </Card>

            {order.can_be_cancelled && (
                <Button 
                    variant="destructive" 
                    className="w-full h-12 rounded-2xl"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                >
                    {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Отменить заказ
                </Button>
            )}
        </div>
    );
};