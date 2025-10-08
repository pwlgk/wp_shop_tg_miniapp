// src/pages/CheckoutPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, getDashboard } from '@/api/services/user.api';
import { createOrder } from '@/api/services/orders.api';
import { useBackButton } from '@/hooks/useBackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDescription } from "@/components/ui/alert";
import { User, Phone, Mail, MapPin, Edit, Loader2 } from 'lucide-react';
import type { CartResponse, OrderCreate, UserDashboard, UserProfile } from '@/types';
import { toast } from 'sonner';
import { CheckoutEditProfile } from '@/components/shared/CheckoutEditProfile';
import { TotalsCard } from '@/components/shared/TotalsCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { AxiosError } from 'axios';

// Компонент для отображения одного поля данных в блоке "Ваши данные"
const CheckoutProfileField = ({ icon, value }: { icon: React.ReactNode, value: string | null | undefined }) => (
    <div className="flex items-center gap-3 text-sm">
        <div className="text-muted-foreground">{icon}</div>
        <span className={!value ? 'italic text-muted-foreground' : ''}>{value || 'не указано'}</span>
    </div>
);

const CheckoutPageSkeleton = () => (
    <div className="p-4 space-y-6 animate-pulse">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
);

export const CheckoutPage = () => {
    useBackButton();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Получаем данные, переданные со страницы CartPage
    const { cart: cartData, pointsToSpend: initialPoints } = (location.state || {}) as { cart: CartResponse | undefined, pointsToSpend: number | undefined };
    
    // Загружаем актуальные данные пользователя и дашборда
    const { data: user, isLoading: isUserLoading } = useQuery<UserProfile>({ queryKey: ['me'], queryFn: getMe });
    const { data: dashboard, isLoading: isDashboardLoading } = useQuery<UserDashboard>({ queryKey: ['dashboard'], queryFn: getDashboard });
    
    const [pointsToSpend, setPointsToSpend] = useState(initialPoints || 0);
    const [isEditSheetOpen, setEditSheetOpen] = useState(false);

        const createOrderMutation = useMutation({
        mutationFn: (orderData: OrderCreate) => createOrder(orderData),
        onSuccess: (newOrder) => {
            toast.success(`Заказ №${newOrder.number} успешно создан!`);
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            navigate(`/order-success/${newOrder.id}`, { replace: true, state: { order: newOrder } });
        },
        onError: (error: AxiosError<{ detail: string }>) => {
            // Проверяем, является ли это ошибкой "Конфликт" (товара нет в наличии)
            if (error.response?.status === 409) {
                toast.warning("Состав корзины изменился", {
                    description: "Некоторые товары закончились. Пожалуйста, проверьте вашу корзину.",
                    duration: 5000,
                });
                
                // Автоматически инвалидируем кэш, чтобы корзина обновилась
                queryClient.invalidateQueries({ queryKey: ['cart'] });
                
                // Возвращаем пользователя в корзину, чтобы он увидел изменения
                navigate('/cart', { replace: true });

            } else {
                // Обрабатываем все остальные ошибки как обычно
                toast.error("Не удалось создать заказ", {
                    description: error.response?.data?.detail || "Произошла неизвестная ошибка.",
                });
            }
        }
    });

    useEffect(() => {
        // Если пользователь попал сюда без данных, возвращаем его в корзину
        if (!cartData) {
            navigate('/cart', { replace: true });
        }
    }, [cartData, navigate]);

    const handlePointsToggle = (apply: boolean) => {
      if (apply && cartData && dashboard) {
        const pointsToApply = Math.min(cartData.max_points_to_spend, dashboard.balance);
        setPointsToSpend(pointsToApply);
      } else {
        setPointsToSpend(0);
      }
    };

    const finalTotal = useMemo(() => {
        if (!cartData) return 0;
        const price = (cartData.final_price ?? cartData.total_items_price) - pointsToSpend;
        return price > 0 ? price : 0;
    }, [cartData, pointsToSpend]);
    
    const handlePlaceOrder = () => {
        if (!user?.first_name || !user?.billing.phone) {
            toast.warning("Пожалуйста, заполните ваши данные", {
                description: "Для оформления заказа необходимо указать имя и номер телефона.",
                action: { label: "Заполнить", onClick: () => setEditSheetOpen(true) },
            });
            return;
        }
        createOrderMutation.mutate({
            payment_method_id: 'cod',
            points_to_spend: pointsToSpend,
            coupon_code: cartData?.applied_coupon_code,
        });
    };

    const isLoading = isUserLoading || isDashboardLoading;
    if (isLoading) return <CheckoutPageSkeleton />;
    if (!cartData || !user || !dashboard) return <div className="p-4 text-center">Ошибка загрузки данных.</div>;

    const displayEmail = user.email.endsWith('@telegram.user') ? null : user.email;

    return (
        <>
            <div className="p-4 space-y-6 pb-24">
                <h1 className="text-3xl font-bold">Оформление заказа</h1>

                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Ваши данные</CardTitle>
                        <Button variant="ghost" size="icon" className="-mr-2" onClick={() => setEditSheetOpen(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <CheckoutProfileField icon={<User className="h-4 w-4" />} value={`${user.first_name || ''} ${user.last_name || ''}`.trim() || null} />
                        <CheckoutProfileField icon={<Phone className="h-4 w-4" />} value={user.billing.phone} />
                        <CheckoutProfileField icon={<MapPin className="h-4 w-4" />} value={user.billing.city} />
                        <CheckoutProfileField icon={<Mail className="h-4 w-4" />} value={displayEmail} />
                        {!user.first_name || !user.billing.phone ? <AlertDescription className="pt-2 !mt-4 text-destructive">Имя и телефон обязательны для заказа.</AlertDescription> : null}
                    </CardContent>
                </Card>
                
                <Card className="rounded-2xl">
                    <CardHeader><CardTitle>Состав заказа</CardTitle></CardHeader>
                    <CardContent className="divide-y">
                        {cartData.items.map(item => (
                            <div key={item.product.id} className="flex gap-4 py-2 text-sm items-center">
                                <img src={item.product.images[0]?.src || '/placeholder.svg'} alt={item.product.name} className="h-12 w-12 rounded-lg object-cover border" />
                                <p className="flex-grow pr-2 line-clamp-1">{item.product.name} <span className="text-muted-foreground">x{item.quantity}</span></p>
                                <p className="font-medium shrink-0">{(parseFloat(item.product.price) * item.quantity).toFixed(0)} ₽</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <TotalsCard 
                    cart={cartData}
                    dashboard={dashboard}
                    // Купон нельзя менять на этой странице, поэтому передаем null/пустые функции
                    appliedCouponCode={cartData.applied_coupon_code}
                    onApplyCoupon={() => toast.info("Промокод можно применить только в корзине.")}
                    onRemoveCoupon={() => toast.info("Промокод можно изменить только в корзине.")}
                    isCartLoading={false}
                    // А баллами управлять можно
                    pointsToSpend={pointsToSpend}
                    onPointsToggle={handlePointsToggle}
                    finalTotal={finalTotal}
                />
            </div>
            
            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
                <Button 
                    size="lg" className="w-full h-control-md text-base rounded-2xl"
                    onClick={handlePlaceOrder}
                    disabled={createOrderMutation.isPending}
                >
                    {createOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Подтвердить заказ
                </Button>
            </footer>

            <CheckoutEditProfile
                user={user}
                open={isEditSheetOpen}
                onOpenChange={setEditSheetOpen}
            />
        </>
    );
};