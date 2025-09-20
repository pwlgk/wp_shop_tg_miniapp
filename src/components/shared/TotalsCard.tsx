// src/components/shared/TotalsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CouponInput } from "./CouponInput";
import { PointsToggle } from "./PointsInput";
import type { CartResponse, UserDashboard } from "@/types";

interface TotalsCardProps {
  // Данные
  cart: CartResponse;
  dashboard: UserDashboard;
  
  // Состояния и обработчики для купона
  appliedCouponCode: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  isCartLoading: boolean; // Для состояния загрузки кнопки купона

  // Состояния и обработчики для баллов
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

    return (
        <Card className="rounded-3xl">
            <CardHeader>
                <CardTitle>Сводка по заказу</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <CouponInput
                    appliedCouponCode={appliedCouponCode}
                    onApply={onApplyCoupon}
                    onRemove={onRemoveCoupon}
                    isLoading={isCartLoading && !!appliedCouponCode}
                />
                <PointsToggle 
                    maxPointsToSpend={cart.max_points_to_spend ?? 0}
                    userBalance={dashboard.balance}
                    isApplied={pointsToSpend > 0}
                    onToggle={onPointsToggle}
                />
                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Товары</span>
                        <span>{(cart.total_items_price ?? 0).toFixed(0)} ₽</span>
                    </div>
                    {(cart.discount_amount ?? 0) > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Скидка ({cart.applied_coupon_code})</span>
                            <span className="font-medium text-destructive">-{(cart.discount_amount ?? 0).toFixed(0)} ₽</span>
                        </div>
                    )}
                    {pointsToSpend > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Скидка баллами</span>
                            <span className="font-medium text-destructive">-{pointsToSpend.toFixed(0)} ₽</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-xl pt-2 border-t">
                        <span>Итого</span>
                        <span>{finalTotal.toFixed(0)} ₽</span>
                    </div>
                    {(cart.points_to_earn ?? 0) > 0 && (
                        <div className="text-center text-xs text-green-600 font-medium pt-1">
                            Будет начислено +{cart.points_to_earn} баллов
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};