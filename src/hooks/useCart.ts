// src/hooks/useCart.ts
import { useMutation, useQueryClient, useQuery, type UseMutateFunction } from '@tanstack/react-query';
import { getCart, removeCartItem, updateCartItem } from '@/api/services/cart.api';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState } from 'react';
import type { Product, CartResponse } from '@/types';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

// Экспортируем тип возвращаемого значения для удобства использования в компонентах
export interface UseCartReturnType {
  cart: CartResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  updateItem: UseMutateFunction<void, AxiosError<{ detail: string; }>, { productId: number; quantity: number; }>;
  removeItem: UseMutateFunction<void, Error, number>;
  addToCart: (product: Product, quantity?: number) => void;
  isUpdating: boolean;
  isRemoving: boolean;
  pointsToSpend: number;
  setPointsToSpend: React.Dispatch<React.SetStateAction<number>>;
  appliedCouponCode: string | null;
  setAppliedCouponCode: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useCart = (): UseCartReturnType => {
  const queryClient = useQueryClient();
  const { setCart } = useCartStore();
  
  const [pointsToSpend, setPointsToSpend] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  const { data: cartData, isLoading, isError } = useQuery<CartResponse, Error>({
    queryKey: ['cart', { points: pointsToSpend, coupon: appliedCouponCode }],
    queryFn: () => getCart({ 
      pointsToSpend, 
      couponCode: appliedCouponCode ?? undefined 
    }),
  });

  // Эффект для синхронизации глобального стора (для счетчиков) и состояния купона
  useEffect(() => {
    if (cartData) {
      setCart(cartData.items);
      // Если бэкенд вернул null в applied_coupon_code (например, купон стал невалиден),
      // сбрасываем его и на клиенте, чтобы UI обновился.
      if (cartData.applied_coupon_code === null && appliedCouponCode !== null) {
        setAppliedCouponCode(null);
      }
    }
  }, [cartData, setCart, appliedCouponCode]);

  // Эффект для отображения уведомлений от бэкенда
  useEffect(() => {
    const shownMessages = new Set<string>();
    cartData?.notifications.forEach(notification => {
        if (!shownMessages.has(notification.message)) {
            if (notification.level === 'success') toast.success(notification.message);
            else if (notification.level === 'error') toast.error(notification.message);
            else if (notification.level === 'info') toast.info(notification.message);
            else if (notification.level === 'warning') toast.warning(notification.message);
            shownMessages.add(notification.message);
        }
    });
  }, [cartData?.notifications]);
  
  // При любом изменении состава корзины (добавление, удаление, обновление)
  // мы просто инвалидируем кэш. `useQuery` сам сделает повторный запрос
  // с текущими `appliedCouponCode` и `pointsToSpend`.
  const handleMutationSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number, quantity: number }) => updateCartItem(productId, quantity),
    onSuccess: handleMutationSuccess,
    onError: (error: AxiosError<{ detail: string }>) => {
      if (error.response?.status === 409) {
        // Ошибка наличия товара
        toast.error("Не удалось обновить товар", { 
          description: error.response?.data?.detail || "Товара нет в наличии.",
        });
        // Принудительно обновляем корзину, чтобы показать актуальные остатки
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        toast.error("Ошибка", { 
          description: "Не удалось обновить товар в корзине." 
        });
      }
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId: number) => removeCartItem(productId),
    onSuccess: handleMutationSuccess,
    onError: () => {
        toast.error("Ошибка", { 
            description: "Не удалось удалить товар из корзины." 
        });
    }
  });
  
  const addToCart = (product: Product, quantity = 1) => {
    const existingItem = cartData?.items.find((item) => item.product.id === product.id);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    updateItemMutation.mutate({ productId: product.id, quantity: newQuantity });
  };
  
  return {
    cart: cartData,
    isLoading,
    isError,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    addToCart,
    isUpdating: updateItemMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    pointsToSpend,
    setPointsToSpend,
    appliedCouponCode,
    setAppliedCouponCode,
  };
};