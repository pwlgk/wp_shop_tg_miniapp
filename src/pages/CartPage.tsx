// src/pages/CartPage.tsx
import { useMemo } from 'react';
import { useCart } from '@/hooks/useCart';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import type { CartItem as CartItemType } from '@/types';
import { CartItem } from '@/components/shared/CartItem';
import { getDashboard } from '@/api/services/user.api';
import { useBackButton } from '@/hooks/useBackButton';
import { TotalsCard } from '@/components/shared/TotalsCard';

export const CartPage = () => {
  useBackButton();
  const navigate = useNavigate();

  const { cart, isLoading: isCartLoading, isError: isCartError, removeItem, updateQuantity, isUpdating, setPointsToSpend, pointsToSpend, setAppliedCouponCode, appliedCouponCode } = useCart();
  
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({ 
      queryKey: ['dashboard'], 
      queryFn: getDashboard 
  });
  
  const handleApplyCoupon = (code: string) => {
    setPointsToSpend(0);
    setAppliedCouponCode(code);
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
  };

  const handlePointsToggle = (apply: boolean) => {
    if (apply && cart && dashboardData) {
      const pointsToApply = Math.min(cart.max_points_to_spend, dashboardData.balance);
      setPointsToSpend(pointsToApply);
      setAppliedCouponCode(null);
    } else {
      setPointsToSpend(0);
    }
  };
  
  const finalTotal = useMemo(() => {
    if (!cart) return 0;
    const priceAfterPoints = (cart.final_price ?? cart.total_items_price) - pointsToSpend;
    return priceAfterPoints > 0 ? priceAfterPoints : 0;
  }, [cart, pointsToSpend]);

  const isLoading = isCartLoading || isDashboardLoading;
  
  if (isLoading) {
    return (
        <div className="p-4">
          <Skeleton className="h-9 w-1/3 mb-4" />
          <div className="space-y-4"> 
            <Skeleton className="h-32 w-full rounded-2xl" /> 
            <Skeleton className="h-32 w-full rounded-2xl" /> 
          </div>
        </div>
    );
  }
  
  if (isCartError || !cart || !dashboardData) {
    return <div className="p-4 text-center text-destructive">Ошибка загрузки данных корзины.</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-3xl font-bold">Ваша корзина пуста</h2>
        <p className="text-muted-foreground mt-2">Самое время добавить что-нибудь!</p>
        <Button asChild className="mt-6 rounded-2xl h-control-md">
            <Link to="/">Перейти к покупкам</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-40"> {/* Отступ снизу для футера */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Корзина</h1>
      </div>
      
      {!cart.is_min_amount_reached && (
        <div className="p-4">
            <Alert variant="default" className="rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Минимальная сумма заказа: {(cart.min_order_amount ?? 0).toFixed(0)} ₽</AlertTitle>
                <AlertDescription className="mt-2">
                    <p className="mb-2">
                        Добавьте товаров еще на <strong>{((cart.min_order_amount ?? 0) - (cart.total_items_price ?? 0)).toFixed(0)} ₽</strong> для оформления.
                    </p>
                    <Progress value={((cart.total_items_price ?? 0) / (cart.min_order_amount || 1)) * 100} className="h-2" />
                </AlertDescription>
            </Alert>
        </div>
      )}

      {/* --- ИСПРАВЛЕНИЕ ЗДЕСЬ --- */}
      <div className="space-y-4 p-4">
        {cart.items.map((item: CartItemType) => (
          // Оборачиваем CartItem в простой div, чтобы margin от space-y-4 применялся к нему, а не к элементу с overflow-hidden
          <div key={`${item.product.id}-${item.variation?.id || ''}`}>
            <CartItem 
              item={item} 
              onRemove={() => removeItem({ productId: item.product.id, variationId: item.variation?.id })}
              onUpdate={(quantity) => updateQuantity(item.product.id, quantity, item.variation?.id)}
              isUpdating={isUpdating}
            />
          </div>
        ))}
      </div>

      <div className="px-4">
        <TotalsCard
            cart={cart}
            dashboard={dashboardData}
            appliedCouponCode={appliedCouponCode}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            isCartLoading={isCartLoading && !!appliedCouponCode} // isCartLoading используется здесь, а не isUpdating
            pointsToSpend={pointsToSpend}
            onPointsToggle={handlePointsToggle}
            finalTotal={finalTotal}
        />
      </div>
      
      <footer className="fixed bottom-16 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4 z-40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Итого к оплате</span>
            <span className="text-2xl font-bold">{finalTotal.toFixed(0)} ₽</span>
          </div>
          <Button 
            size="lg" 
            className="w-full h-control-md text-base rounded-2xl"
            disabled={!cart.is_min_amount_reached}
            // --- ИСПРАВЛЕНИЕ: Убираем передачу state ---
            onClick={() => navigate('/checkout', { 
                state: { 
                    cart, // Передаем текущий объект корзины
                    pointsToSpend, // Передаем текущее количество баллов
                    appliedCouponCode // Передаем текущий код купона
                } 
            })}
          >
            К оформлению
          </Button>
      </footer>
    </div>
  );
};