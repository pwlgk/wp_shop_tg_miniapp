// src/hooks/useCart.ts
import { useMutation, useQueryClient, useQuery, type UseMutateFunction } from '@tanstack/react-query';
import { getCart, removeCartItem, updateCartItem } from '@/api/services/cart.api';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState, useRef } from 'react';
import type { Product, CartResponse, CartItem } from '@/types';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export interface UseCartReturnType {
  cart: CartResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: UseMutateFunction<void, Error, number, { previousCart: CartResponse | undefined }>;
  addToCart: (product: Product, quantity?: number) => void;
  isUpdating: boolean;
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
  
  const shownNotificationIds = useRef(new Set<string>());

  const { data: cartData, isLoading, isError } = useQuery<CartResponse, Error>({
    queryKey: ['cart', { points: pointsToSpend, coupon: appliedCouponCode }],
    queryFn: () => getCart({ 
      pointsToSpend, 
      couponCode: appliedCouponCode ?? undefined 
    }),
  });

  useEffect(() => {
    if (cartData) {
      setCart(cartData.items);

      if (cartData.notifications && cartData.notifications.length > 0) {
        const lastNotification = cartData.notifications[cartData.notifications.length - 1];
        const notificationId = `${lastNotification.level}-${lastNotification.message}`;

        if (!shownNotificationIds.current.has(notificationId)) {
          if (lastNotification.level === 'success') {
            toast.success(lastNotification.message);
            if (cartData.applied_coupon_code) {
              setAppliedCouponCode(cartData.applied_coupon_code);
            }
          } else if (lastNotification.level === 'error') {
            toast.error(lastNotification.message);
            setAppliedCouponCode(null);
          } else {
            toast.info(lastNotification.message);
          }
          shownNotificationIds.current.add(notificationId);
        }
      }
      
      if (cartData.applied_coupon_code === null && appliedCouponCode !== null) {
        setAppliedCouponCode(null);
      }
    }
  }, [cartData, setCart, appliedCouponCode, setAppliedCouponCode]);
  
  // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
  const handleMutationEnd = () => {
    // При любом изменении состава корзины (добавление, удаление, обновление):
    
    // 1. Сбрасываем примененные скидки на клиенте.
    // Это предотвращает рассинхронизацию, когда `cartData` обновляется, а `pointsToSpend` нет.
    setPointsToSpend(0);
    setAppliedCouponCode(null);
    
    // 2. Инвалидируем кэши, чтобы получить свежие, пересчитанные данные с сервера.
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
  // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number, quantity: number }) => updateCartItem(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
        await queryClient.cancelQueries({ queryKey: ['cart'] });
        const previousCart = queryClient.getQueryData<CartResponse>(['cart']);
        
        queryClient.setQueryData<CartResponse>(['cart'], (oldCart) => {
            if (!oldCart) return undefined;
            const existingItem = oldCart.items.find(item => item.product.id === productId);
            let newItems: CartItem[];

            if (existingItem) {
                newItems = oldCart.items.map(item => item.product.id === productId ? { ...item, quantity } : item);
            } else {
                return oldCart; 
            }
            return { ...oldCart, items: newItems };
        });

        return { previousCart };
    },
    onError: (err: AxiosError<{ detail: string }>, _variables, context) => {
        if (context?.previousCart) {
            queryClient.setQueryData(['cart'], context.previousCart);
        }
        if (err.response?.status === 409) {
            toast.error("Не удалось обновить товар", { description: err.response?.data?.detail });
        } else {
            toast.error("Ошибка", { description: "Не удалось обновить корзину." });
        }
    },
    onSettled: handleMutationEnd,
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId: number) => removeCartItem(productId),
    onMutate: async (productId) => {
        await queryClient.cancelQueries({ queryKey: ['cart'] });
        const previousCart = queryClient.getQueryData<CartResponse>(['cart']);

        queryClient.setQueryData<CartResponse>(['cart'], (oldCart) => {
            if (!oldCart) return oldCart;
            return {
                ...oldCart,
                items: oldCart.items.filter(item => item.product.id !== productId)
            };
        });
        
        return { previousCart };
    },
    onError: (_err, _variables, context) => {
        toast.error("Не удалось удалить товар");
        if (context?.previousCart) {
            queryClient.setQueryData(['cart'], context.previousCart);
        }
    },
    onSettled: handleMutationEnd,
  });
  
  const addToCart = (product: Product, quantity = 1) => {
    const existingItem = cartData?.items.find((item) => item.product.id === product.id);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    updateItemMutation.mutate({ productId: product.id, quantity: newQuantity });
  };
  
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity > 0) {
      updateItemMutation.mutate({ productId, quantity });
    } else {
      removeItemMutation.mutate(productId);
    }
  };

  return {
    cart: cartData,
    isLoading,
    isError,
    updateQuantity,
    removeItem: removeItemMutation.mutate,
    addToCart,
    isUpdating: updateItemMutation.isPending || removeItemMutation.isPending,
    pointsToSpend,
    setPointsToSpend,
    appliedCouponCode,
    setAppliedCouponCode,
  };
};