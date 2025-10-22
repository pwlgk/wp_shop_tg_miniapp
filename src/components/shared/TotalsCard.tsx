// src/components/shared/TotalsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CouponInput } from "./CouponInput";
import { PointsToggle } from "./PointsInput";
import type { CartResponse, UserDashboard } from "@/types";
import { cn } from "@/lib/utils";

interface TotalsCardProps {
  cart: CartResponse;
  dashboard: UserDashboard;
  
  // Пропсы для управления купоном
  appliedCouponCode: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  isCartLoading: boolean;

  // Пропсы для управления баллами
  pointsToSpend: number;
  onPointsToggle: (apply: boolean) => void;
  
  // Рассчитанная на клиенте финальная сумма
  finalTotal: number;
}

export const TotalsCard = ({ 
    cart, 
    dashboard, 
    appliedCouponCode, 
    onApplyCoupon, 
    onRemoveCoupon,
    isCartLoading,
    pointsToSpend, 
    onPointsToggle, 
    finalTotal 
}: TotalsCardProps) => {

    // Определяем, какая скидка сейчас активна
    const isCouponApplied = !!appliedCouponCode;
    const isPointsApplied = pointsToSpend > 0;
    
    // Баллы НЕ начисляются, если применена любая скидка
    const showPointsToEarn = !isCouponApplied && !isPointsApplied && (cart.points_to_earn ?? 0) > 0;

    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle>Скидки и оплата</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Компонент для ввода промокода */}
                <div className={cn('transition-opacity', isPointsApplied && 'opacity-50 pointer-events-none')}>
                    <CouponInput
                        appliedCouponCode={appliedCouponCode}
                        onApply={onApplyCoupon}
                        onRemove={onRemoveCoupon}
                        isLoading={isCartLoading}
                    />
                    {isPointsApplied && <p className="text-xs text-muted-foreground mt-1">Нельзя применить вместе с баллами</p>}
                </div>
                
                {/* Компонент для списания баллов */}
                <div className={cn('transition-opacity', isCouponApplied && 'opacity-50 pointer-events-none')}>
                    <PointsToggle 
                        maxPointsToSpend={cart.max_points_to_spend ?? 0}
                        userBalance={dashboard.balance}
                        isApplied={isPointsApplied}
                        onToggle={onPointsToggle}
                    />
                    {isCouponApplied && <p className="text-xs text-muted-foreground mt-1">Нельзя применить вместе с промокодом</p>}
                </div>
                
                {/* Блок с расчетами */}
                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Товары</span>
                        <span>{(cart.total_items_price ?? 0).toFixed(0)} ₽</span>
                    </div>
                    {isCouponApplied && (cart.discount_amount ?? 0) > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Скидка ({cart.applied_coupon_code})</span>
                            <span className="font-medium text-destructive">-{(cart.discount_amount ?? 0).toFixed(0)} ₽</span>
                        </div>
                    )}
                    {isPointsApplied && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Скидка баллами</span>
                            <span className="font-medium text-destructive">-{pointsToSpend.toFixed(0)} ₽</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-xl pt-2 border-t">
                        <span>Итого</span>
                        <span>{finalTotal.toFixed(0)} ₽</span>
                    </div>
                    {/* Условное отображение кешбэка */}
                    {showPointsToEarn && (
                        <div className="text-center text-xs text-green-600 font-medium pt-1">
                            Будет начислено +{cart.points_to_earn} баллов
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};