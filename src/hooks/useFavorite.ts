// src/hooks/useFavorite.ts

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '@/api/services/favorites.api';
import type { Product, PaginatedProducts } from '@/types';
// --- ИЗМЕНЕНИЕ 1: Импортируем наш хелпер ---
import { handleApiError } from '@/api/errorHandler';

export const useFavorite = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ productId, isFavorite }: { productId: number; isFavorite: boolean }) =>
      isFavorite ? removeFavorite(productId) : addFavorite(productId),
    
    // onMutate остается без изменений, он отвечает за оптимистичное обновление
    onMutate: async ({ productId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      await queryClient.cancelQueries({ queryKey: ['product', productId] });
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

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

    // --- ИЗМЕНЕНИЕ 2: Используем централизованный обработчик ошибок ---
    onError: (err, variables, context) => {
      // Сначала откатываем оптимистичное обновление
      if (context?.previousProduct) {
        queryClient.setQueryData(['product', variables.productId], context.previousProduct);
      }
      if (context?.previousProductsLists) {
          context.previousProductsLists.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
          });
      }
      
      // Затем показываем ошибку через наш хелпер
      handleApiError(err);
    },
    
    // onSuccess остается без изменений
    onSuccess: (_data, variables) => {
      // Инвалидируем кэши, чтобы при следующем заходе на страницу данные были свежими.
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return mutation;
};