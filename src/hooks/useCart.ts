// src/hooks/useCart.ts

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getCart, removeCartItem, updateCartItem } from '@/api/services/cart.api';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState, useRef } from 'react';
import type { Product, CartResponse, CartItem } from '@/types';
import { toast } from 'sonner';
// --- ИЗМЕНЕНИЕ 1: Импортируем наш новый хелпер ---
import { handleApiError } from '@/api/errorHandler';

export const useCart = () => {
  const queryClient = useQueryClient();
  const { setCart } = useCartStore();
  
  const [pointsToSpend, setPointsToSpend] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  
  const shownNotificationIds = useRef(new Set<string>());

  const { data: cartData, isLoading, isError, error } = useQuery<CartResponse, Error>({
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
            if (lastNotification.level === 'success') toast.success(lastNotification.message);
            else if (lastNotification.level === 'error') toast.error(lastNotification.message);
            else toast.info(lastNotification.message);
            shownNotificationIds.current.add(notificationId);
        }
      }
      
      if (cartData.applied_coupon_code === null && appliedCouponCode !== null) {
        setAppliedCouponCode(null);
      }
    }
  }, [cartData, setCart, appliedCouponCode, setAppliedCouponCode]);

  // Обработка общей ошибки загрузки корзины
  useEffect(() => {
    if (isError) {
      handleApiError(error);
    }
  }, [isError, error]);
  
  const handleMutationSuccess = () => {
    if (pointsToSpend > 0) {
        console.log('[useCart] Resetting points after cart mutation.');
        setPointsToSpend(0);
        toast.info("Скидка баллами была сброшена из-за изменения состава корзины.");
    }
  };

  const handleMutationEnd = () => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, quantity, variationId }: { productId: number; quantity: number; variationId?: number }) => 
        updateCartItem({ productId, quantity, variationId }),
    onSuccess: handleMutationSuccess,
    onMutate: async ({ productId, quantity, variationId }) => {
        await queryClient.cancelQueries({ queryKey: ['cart'] });
        const previousCart = queryClient.getQueryData<CartResponse>(['cart']);
        
        queryClient.setQueryData<CartResponse>(['cart'], (oldCart) => {
            if (!oldCart) return undefined;
            const itemIdentifier = (item: CartItem) => variationId ? item.variation?.id === variationId : item.product.id === productId && !item.variation;
            const newItems = oldCart.items.map(item => itemIdentifier(item) ? { ...item, quantity } : item);
            return { ...oldCart, items: newItems };
        });
        return { previousCart };
    },
    // --- ИЗМЕНЕНИЕ 2: Используем централизованный обработчик ---
    onError: (err, _variables, context) => {
        if (context?.previousCart) {
            queryClient.setQueryData(['cart'], context.previousCart);
        }
        handleApiError(err); // <-- Вызываем наш хелпер
    },
    onSettled: handleMutationEnd,
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ productId, variationId }: { productId: number; variationId?: number }) => 
        removeCartItem({ productId, variationId }),
    onSuccess: handleMutationSuccess,
    onMutate: async ({ productId, variationId }) => {
        await queryClient.cancelQueries({ queryKey: ['cart'] });
        const previousCart = queryClient.getQueryData<CartResponse>(['cart']);

        queryClient.setQueryData<CartResponse>(['cart'], (oldCart) => {
            if (!oldCart) return oldCart;
            const itemIdentifier = (item: CartItem) => variationId ? item.variation?.id === variationId : item.product.id === productId && !item.variation;
            return { ...oldCart, items: oldCart.items.filter(item => !itemIdentifier(item)) };
        });
        
        return { previousCart };
    },
    // --- ИЗМЕНЕНИЕ 3: Используем централизованный обработчик ---
    onError: (err, _variables, context) => {
        if (context?.previousCart) {
            queryClient.setQueryData(['cart'], context.previousCart);
        }
        handleApiError(err); // <-- Вызываем наш хелпер
    },
    onSettled: handleMutationEnd,
  });
  
  const addToCart = (product: Product, quantity = 1, variationId?: number) => {
    const itemIdentifier = (item: CartItem) => variationId ? item.variation?.id === variationId : item.product.id === product.id && !item.variation;
    const existingItem = cartData?.items.find(itemIdentifier);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    updateItemMutation.mutate({ productId: product.id, quantity: newQuantity, variationId });
  };
  
  const updateQuantity = (productId: number, quantity: number, variationId?: number) => {
    if (quantity > 0) {
      updateItemMutation.mutate({ productId, quantity, variationId });
    } else {
      removeItemMutation.mutate({ productId, variationId });
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