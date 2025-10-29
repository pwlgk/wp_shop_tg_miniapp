// src/hooks/useCart.ts
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getCart, removeCartItem, updateCartItem } from '@/api/services/cart.api';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState, useRef } from 'react';
import type { Product, CartResponse, CartItem } from '@/types';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const useCart = () => {
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
  
  const handleMutationEnd = () => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, quantity, variationId }: { productId: number; quantity: number; variationId?: number }) => 
        updateCartItem({ productId, quantity, variationId }),
    onMutate: async ({ productId, quantity, variationId }) => {
        await queryClient.cancelQueries({ queryKey: ['cart'] });
        const previousCart = queryClient.getQueryData<CartResponse>(['cart']);
        
        queryClient.setQueryData<CartResponse>(['cart'], (oldCart) => {
            if (!oldCart) return undefined;
            
            const itemIdentifier = (item: CartItem) => 
                variationId ? item.variation?.id === variationId : item.product.id === productId && !item.variation;

            const existingItem = oldCart.items.find(itemIdentifier);
            let newItems: CartItem[];

            if (existingItem) {
                newItems = oldCart.items.map(item => itemIdentifier(item) ? { ...item, quantity } : item);
            } else {
                // Optimistic add для вариаций сложен без полного объекта Product.
                // Поэтому при добавлении нового товара/вариации UI обновится после ответа сервера.
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
        toast.error("Ошибка обновления корзины", { description: err.response?.data?.detail || "Пожалуйста, попробуйте снова." });
    },
    onSettled: handleMutationEnd,
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ productId, variationId }: { productId: number; variationId?: number }) => 
        removeCartItem({ productId, variationId }),
    onMutate: async ({ productId, variationId }) => {
        await queryClient.cancelQueries({ queryKey: ['cart'] });
        const previousCart = queryClient.getQueryData<CartResponse>(['cart']);

        queryClient.setQueryData<CartResponse>(['cart'], (oldCart) => {
            if (!oldCart) return oldCart;
            const itemIdentifier = (item: CartItem) => 
                variationId ? item.variation?.id === variationId : item.product.id === productId && !item.variation;
            
            return {
                ...oldCart,
                items: oldCart.items.filter(item => !itemIdentifier(item))
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
  
  const addToCart = (product: Product, quantity = 1, variationId?: number) => {
    const itemIdentifier = (item: CartItem) => 
        variationId ? item.variation?.id === variationId : item.product.id === product.id && !item.variation;

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