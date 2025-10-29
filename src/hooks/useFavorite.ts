// src/hooks/useFavorite.ts
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '@/api/services/favorites.api';
import type { Product, PaginatedProducts } from '@/types';
import { toast } from 'sonner';

export const useFavorite = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ productId, isFavorite }: { productId: number; isFavorite: boolean }) =>
      isFavorite ? removeFavorite(productId) : addFavorite(productId),
    
    onMutate: async ({ productId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      await queryClient.cancelQueries({ queryKey: ['product', productId] });
      await queryClient.cancelQueries({ queryKey: ['favorites'] }); // Также отменяем запросы к списку избранного

      const previousProduct = queryClient.getQueryData<Product>(['product', productId]);
      const previousProductsLists = queryClient.getQueriesData<InfiniteData<PaginatedProducts>>({ queryKey: ['products'] });

      // Оптимистично обновляем детальную страницу товара
      if (previousProduct) {
        queryClient.setQueryData<Product>(['product', productId], {
          ...previousProduct,
          is_favorite: !isFavorite,
        });
      }

      // Оптимистично обновляем все списки товаров
      queryClient.setQueriesData<InfiniteData<PaginatedProducts>>({ queryKey: ['products'] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            items: page.items.map(product =>
              product.id === productId ? { ...product, is_favorite: !isFavorite } : product
            ),
          })),
        };
      });

      return { previousProduct, previousProductsLists };
    },

    onError: (_err, variables, context) => {
      toast.error("Не удалось изменить избранное");
      if (context?.previousProduct) {
        queryClient.setQueryData(['product', variables.productId], context.previousProduct);
      }
      if (context?.previousProductsLists) {
          context.previousProductsLists.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
          });
      }
    },
    
    // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
    // Используем onSuccess для инвалидации, чтобы гарантировать, что сервер уже обновил данные
    onSuccess: (_data, variables) => {
      // Инвалидируем кэши, чтобы при следующем заходе на страницу данные были свежими.
      // Это происходит "в фоне" и не мешает оптимистичному обновлению.
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },

    // onSettled больше не нужен для инвалидации, его можно убрать или использовать для других целей
  });

  return mutation;
};