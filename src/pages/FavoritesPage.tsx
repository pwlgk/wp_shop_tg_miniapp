// src/pages/FavoritesPage.tsx
import { Fragment, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getFavorites } from '@/api/services/favorites.api';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton';
import { useInView } from 'react-intersection-observer';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBackButton } from '@/hooks/useBackButton';

export const FavoritesPage = () => {
    useBackButton();
  const {
    data: favoritesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['favorites'],
    queryFn: ({ pageParam = 1 }) => getFavorites({ page: pageParam, size: 10 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.total_pages) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const allFavoriteProducts = favoritesData?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Избранное</h1>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-center text-destructive">Ошибка загрузки избранного.</div>;
  }

  if (allFavoriteProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">В избранном пока пусто</h2>
        <p className="text-muted-foreground mt-2">Нажмите на сердечко у товара, чтобы добавить его сюда.</p>
        <Button asChild className="mt-6 h-control-md rounded-2xl">
          <Link to="/">Начать покупки</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Избранное</h1>

      <div className="grid grid-cols-2 gap-3">
        {allFavoriteProducts.map((product, index) => (
          <Fragment key={product.id}>
            {index === allFavoriteProducts.length - 1 ? (
              <div ref={ref}>
                <ProductCard product={product} />
              </div>
            ) : (
              <ProductCard product={product} />
            )}
          </Fragment>
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      )}

      {!hasNextPage && !isLoading && (
        <p className="text-center text-muted-foreground py-8">Вы посмотрели все избранные товары</p>
      )}
    </div>
  );
};