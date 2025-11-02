// src/pages/CheckoutPage.tsx

import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, getDashboard } from '@/api/services/user.api';
import { createOrder } from '@/api/services/orders.api';
import { getCart } from '@/api/services/cart.api';
import { useBackButton } from '@/hooks/useBackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDescription } from "@/components/ui/alert";
// --- 1. Импортируем иконку Info ---
import { User, Phone, Mail, MapPin, Edit, Loader2, Info } from 'lucide-react';
import type { CartResponse, OrderCreate, UserDashboard, UserProfile } from '@/types';
import { toast } from 'sonner';
import { TotalsCard } from '@/components/shared/TotalsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AxiosError } from 'axios';
import { BrandHeader } from '@/components/shared/BrandHeader';

const CheckoutProfileField = ({ icon, value }: { icon: React.ReactNode, value: string | null | undefined }) => (
    <div className="flex items-center gap-3 text-sm">
        <div className="text-muted-foreground">{icon}</div>
        <span className={!value ? 'italic text-muted-foreground' : ''}>{value || 'не указано'}</span>
    </div>
);

const CheckoutPageSkeleton = () => (
    <>
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
        <div className="p-4 space-y-6 animate-pulse">
            <Skeleton className="h-8 w-3-4" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
    </>
);

export const CheckoutPage = () => {
    useBackButton();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const { 
        cart: initialCartData, 
        pointsToSpend: initialPoints, 
        appliedCouponCode: initialCouponCode 
    } = (location.state || {}) as { 
        cart?: CartResponse, 
        pointsToSpend?: number, 
        appliedCouponCode?: string | null 
    };

    const [pointsToSpend, setPointsToSpend] = useState(initialPoints || 0);
    const [appliedCouponCode, setAppliedCouponCode] = useState(initialCouponCode || null);

    const { data: liveCartData, isLoading: isCartLoading } = useQuery({
        queryKey: ['cart', { points: pointsToSpend, coupon: appliedCouponCode }],
        queryFn: () => getCart({ pointsToSpend, couponCode: appliedCouponCode ?? undefined }),
        placeholderData: initialCartData,
    });
    
    const cartData = liveCartData || initialCartData;

    const { data: user, isLoading: isUserLoading } = useQuery<UserProfile>({ queryKey: ['me'], queryFn: getMe });
    const { data: dashboard, isLoading: isDashboardLoading } = useQuery<UserDashboard>({ queryKey: ['dashboard'], queryFn: getDashboard });
    
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
            if (error.response?.status === 409) {
                toast.warning("Состав корзины изменился", {
                    description: "Некоторые товары закончились. Пожалуйста, проверьте вашу корзину.",
                    duration: 5000,
                });
                queryClient.invalidateQueries({ queryKey: ['cart'] });
                navigate('/cart', { replace: true });
            } else {
                toast.error("Не удалось создать заказ", {
                    description: error.response?.data?.detail || "Произошла неизвестная ошибка.",
                });
            }
        }
    });

    useEffect(() => {
        if (!isCartLoading && (!cartData || cartData.items.length === 0)) {
            navigate('/cart', { replace: true });
        }
    }, [cartData, isCartLoading, navigate]);

    const handleApplyCoupon = (code: string) => {
        setPointsToSpend(0);
        setAppliedCouponCode(code);
    };
    const handleRemoveCoupon = () => {
        setAppliedCouponCode(null);
    };
    const handlePointsToggle = (apply: boolean) => {
        if (apply && cartData && dashboard) {
            const pointsToApply = Math.min(cartData.max_points_to_spend, dashboard.balance);
            setPointsToSpend(pointsToApply);
            setAppliedCouponCode(null);
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
                action: { 
                    label: "Заполнить", 
                    onClick: () => navigate('/profile/edit', { 
                        state: { from: location.pathname }
                    }) 
                },
            });
            return;
        }
        createOrderMutation.mutate({
            payment_method_id: 'cod',
            points_to_spend: pointsToSpend,
            coupon_code: appliedCouponCode,
        });
    };

    const isLoading = isUserLoading || isDashboardLoading || (isCartLoading && !initialCartData);
    if (isLoading) return <CheckoutPageSkeleton />;
    if (!cartData || !user || !dashboard) {
        return (
            <>
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
                <div className="p-4 text-center">Ошибка загрузки данных.</div>
            </>
        );
    }

    const displayEmail = user.email.endsWith('@telegram.user') ? null : user.email;

    return (
        <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
            <div className="space-y-6 pb-24">
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold">Оформление заказа</h1>
                </div>

                <div className="px-4 space-y-4">
                    <Card className="rounded-2xl">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Ваши данные</CardTitle>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="-mr-2 rounded-full" 
                                onClick={() => navigate('/profile/edit', { 
                                    state: { from: location.pathname }
                                })}
                            >
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
                            {cartData.items.map(item => {
                                const imageUrl = item.variation?.image?.src || item.product.images[0]?.src;
                                const price = item.variation?.price || item.product.price;
                                const attributesString = item.variation?.attributes.map(attr => attr.option).join(', ');

                                return (
                                    <div key={`${item.product.id}-${item.variation?.id || ''}`} className="flex gap-4 py-3 text-sm items-center">
                                        <img src={imageUrl || '/placeholder.svg'} alt={item.product.name} className="h-12 w-12 rounded-lg object-cover border" />
                                        <div className="flex-grow">
                                            <p className="font-medium line-clamp-1">{item.product.name}</p>
                                            {attributesString && <p className="text-xs text-muted-foreground">{attributesString}</p>}
                                            <p className="text-xs text-muted-foreground">Кол-во: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold shrink-0">{(parseFloat(price) * item.quantity).toFixed(0)} ₽</p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <TotalsCard 
                        cart={cartData}
                        dashboard={dashboard}
                        appliedCouponCode={appliedCouponCode}
                        onApplyCoupon={handleApplyCoupon}
                        onRemoveCoupon={handleRemoveCoupon}
                        isCartLoading={isCartLoading && !!appliedCouponCode}
                        pointsToSpend={pointsToSpend}
                        onPointsToggle={handlePointsToggle}
                        finalTotal={finalTotal}
                    />

                    {/* --- 2. ДОБАВЛЕН НОВЫЙ БЛОК --- */}
                    <Card className="rounded-2xl bg-secondary/50 border-dashed">
                        <CardContent className="flex items-start gap-4 p-4 text-sm">
                            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-muted-foreground">
                                После заказа мы свяжемся с вами для согласования доставки и оплаты.
                            </p>
                        </CardContent>
                    </Card>
                    {/* ----------------------------- */}
                </div>
            </div>
            
            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
                <Button 
                    size="lg" className="w-full h-control-md text-base rounded-2xl"
                    onClick={handlePlaceOrder}
                    disabled={createOrderMutation.isPending}
                >
                    {createOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Подтвердить заказ
                </Button>
            </footer>
        </>
    );
};