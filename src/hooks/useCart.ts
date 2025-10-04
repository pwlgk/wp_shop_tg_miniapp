// src/hooks/useCart.ts
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getCart, removeCartItem, updateCartItem } from '@/api/services/cart.api';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState } from 'react';
import type { Product, CartResponse } from '@/types';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const useCart = () => {
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

  useEffect(() => {
    if (cartData) {
      setCart(cartData.items);
      if (cartData.applied_coupon_code === null && appliedCouponCode !== null) {
        setAppliedCouponCode(null);
      }
    }
  }, [cartData, setCart, appliedCouponCode]);

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
  
  const handleMutationEnd = () => {
    // onSettled инвалидирует кэши, чтобы синхронизировать
    // состояние с сервером после оптимистичного обновления.
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number, quantity: number }) => updateCartItem(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
        await queryClient.cancelQueries({ queryKey: ['cart'] });
        const previousCart = queryClient.getQueryData<CartResponse>(['cart']);
        
        queryClient.setQueryData<CartResponse>(['cart'], (oldCart) => {
            if (!oldCart) return undefined;
            const newItems = oldCart.items.map(item => 
                item.product.id === productId ? { ...item, quantity } : item
            );
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
    // Для добавления/обновления используем одну и ту же мутацию
    updateItemMutation.mutate({ productId: product.id, quantity: newQuantity });
  };
  
  // Единая функция для изменения количества из компонентов
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity > 0) {
      updateItemMutation.mutate({ productId, quantity });
    } else {
      // Если количество 0 или меньше, удаляем товар
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