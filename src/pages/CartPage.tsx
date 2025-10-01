// src/pages/CartPage.tsx
import { useMemo } from 'react';
import { useCart } from '@/hooks/useCart';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { CartItem as CartItemType } from '@/types';
import { CartItem } from '@/components/shared/CartItem';
import { getDashboard } from '@/api/services/user.api';
import { useBackButton } from '@/hooks/useBackButton';
import { TotalsCard } from '@/components/shared/TotalsCard';

export const CartPage = () => {
  useBackButton();
  const navigate = useNavigate();

  const { cart, isLoading: isCartLoading, isError: isCartError, removeItem, updateItem, isRemoving, isUpdating, setPointsToSpend, pointsToSpend, setAppliedCouponCode, appliedCouponCode } = useCart();
  
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({ 
      queryKey: ['dashboard'], 
      queryFn: getDashboard 
  });
  
  const handleApplyCoupon = (code: string) => {
    setAppliedCouponCode(code);
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
  };

  const handlePointsToggle = (apply: boolean) => {
    if (apply && cart && dashboardData) {
      const pointsToApply = Math.min(cart.max_points_to_spend, dashboardData.balance);
      setPointsToSpend(pointsToApply);
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
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="space-y-4"> <Skeleton className="h-28 w-full rounded-2xl" /> <Skeleton className="h-28 w-full rounded-2xl" /> </div>
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
        <h2 className="text-2xl font-bold">Ваша корзина пуста</h2>
        <p className="text-muted-foreground mt-2">Самое время добавить что-нибудь!</p>
        <Button asChild className="mt-6 rounded-2xl h-12">
            <Link to="/">Перейти к покупкам</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="p-4 ">
        <h1 className="text-3xl font-bold">Корзина</h1>
      </div>

      <div className="divide-y p-4">
        {cart.items.map((item: CartItemType) => (
          <CartItem 
            key={item.product.id} 
            item={item} 
            onRemove={() => removeItem(item.product.id)}
            onUpdate={(quantity) => updateItem({ productId: item.product.id, quantity })}
            isUpdating={isRemoving || isUpdating}
          />
        ))}
      </div>

      {/* --- ИСПОЛЬЗУЕМ НАШ НОВЫЙ КОМПОНЕНТ --- */}
      <div className="px-4">
        <TotalsCard
            cart={cart}
            dashboard={dashboardData}
            appliedCouponCode={cart.applied_coupon_code}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            isCartLoading={isCartLoading && !!appliedCouponCode}
            pointsToSpend={pointsToSpend}
            onPointsToggle={handlePointsToggle}
            finalTotal={finalTotal}
        />
      </div>
      
      {/* --- ОБНОВЛЕННЫЙ МИНИМАЛИСТИЧНЫЙ ФУТЕР --- */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Итого к оплате</span>
            <span className="text-2xl font-bold">{finalTotal.toFixed(0)} ₽</span>
          </div>
          <Button 
            size="lg" 
            className="w-full h-12 text-base rounded-2xl"
            disabled={!cart.is_min_amount_reached}
            onClick={() => navigate('/checkout', { state: { cart, pointsToSpend, finalTotal } })}
          >
            К оформлению
          </Button>
      </footer>
    </div>
  );
};