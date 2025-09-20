// src/hooks/useFavorite.ts
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'; // <-- ИЗМЕНЕНИЕ ЗДЕСЬ
import { addFavorite, removeFavorite } from '@/api/services/favorites.api';
import type { Product, PaginatedProducts } from '@/types';

export const useFavorite = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ productId, isFavorite }: { productId: number; isFavorite: boolean }) =>
      isFavorite ? removeFavorite(productId) : addFavorite(productId),
    
    onMutate: async ({ productId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      await queryClient.cancelQueries({ queryKey: ['product', productId] });

      const previousProduct = queryClient.getQueryData<Product>(['product', productId]);

      if (previousProduct) {
        queryClient.setQueryData<Product>(['product', productId], {
          ...previousProduct,
          is_favorite: !isFavorite,
        });
      }

      queryClient.setQueriesData<InfiniteData<PaginatedProducts> | undefined>({ queryKey: ['products'] }, (oldData) => {
        if (!oldData) return undefined;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: PaginatedProducts) => ({
            ...page,
            items: page.items.map((product: Product) =>
              product.id === productId 
                ? { ...product, is_favorite: !isFavorite } 
                : product
            ),
          })),
        };
      });

      return { previousProduct };
    },

    onError: (err, variables, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(['product', variables.productId], context.previousProduct);
      }
      console.error('Failed to update favorite status', err);
    },
    
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] }); 
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); 
    },
  });

  return mutation;
};