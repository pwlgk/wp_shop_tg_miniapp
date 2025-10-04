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
    
    // --- НАЧАЛО ЛОГИКИ OPTIMISTIC UPDATE ---
    onMutate: async ({ productId, isFavorite }) => {
      // 1. Отменяем все текущие запросы, чтобы они не перезаписали наши данные
      await queryClient.cancelQueries({ queryKey: ['products'] });
      await queryClient.cancelQueries({ queryKey: ['product', productId] });

      // 2. Сохраняем предыдущее состояние данных для отката в случае ошибки
      const previousProduct = queryClient.getQueryData<Product>(['product', productId]);
      const previousProductsLists = queryClient.getQueriesData<InfiniteData<PaginatedProducts>>({ queryKey: ['products'] });

      // 3. Оптимистично обновляем UI
      // Обновляем детальную страницу товара
      if (previousProduct) {
        queryClient.setQueryData<Product>(['product', productId], {
          ...previousProduct,
          is_favorite: !isFavorite,
        });
      }

      // Обновляем все списки товаров
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

      // 4. Возвращаем контекст с сохраненными данными
      return { previousProduct, previousProductsLists };
    },

    // Если мутация провалилась, откатываем изменения
    onError: (err, variables, context) => {
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
    
    // После завершения запроса (успех или ошибка), инвалидируем кэш для синхронизации
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return mutation;
};