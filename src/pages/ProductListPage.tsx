// src/pages/ProductListPage.tsx

import { Fragment, useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getCategories, getProducts } from '@/api/services/catalog.api';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ListFilter, Search } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { PaginatedProducts, ProductCategory } from '@/types';
import { useBackButton } from '@/hooks/useBackButton';
import { Skeleton } from '@/components/ui/skeleton';
import type { InfiniteData } from '@tanstack/react-query';
import { BrandHeader } from '@/components/shared/BrandHeader';
import { useTelegramSafeArea } from '@/hooks/useTelegramSafeArea';

const sortOptions = {
  popularity: 'Популярные',
  date: 'Новинки',
  'price-asc': 'Сначала дешевые',
  'price-desc': 'Сначала дорогие',
};
type SortKey = keyof typeof sortOptions;

const ProductListPageSkeleton = () => (
  <>
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
    <div className="p-4">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-control-sm w-control-sm rounded-full" />
        <Skeleton className="h-control-sm w-control-sm rounded-full" />
        <Skeleton className="h-control-sm w-32 rounded-full" />
        <Skeleton className="h-control-sm w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  </>
);

export const ProductListPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  useBackButton();

  const safeArea = useTelegramSafeArea();
  const HEADER_CONTENT_HEIGHT = 48; // (py-2 + h-8) = (8px + 32px + 8px)
  const headerHeight = (safeArea.top || 0) + HEADER_CONTENT_HEIGHT;

  const filterPanelStyle = {
    top: `${headerHeight}px`,
  };

  const parentCategoryId = Number(categoryId);
  const subCategoryIdFromUrl = searchParams.get('subcategory');

  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(
    subCategoryIdFromUrl ? Number(subCategoryIdFromUrl) : null
  );
  const [sortBy, setSortBy] = useState<SortKey>('popularity');

  const { data: allCategories, isLoading: areCategoriesLoading } = useQuery<ProductCategory[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const parentCategory = allCategories?.find(cat => cat.id === parentCategoryId);
  const subCategories = parentCategory?.children ?? [];
  const pageTitle = allCategories?.find(c => c.id === (selectedSubCategoryId || parentCategoryId))?.name || 'Каталог';

  const allButtonText = subCategories.length > 0
    ? `Все в "${parentCategory?.name}"`
    : (parentCategory?.name || 'Все');

  const filterCategoryId = selectedSubCategoryId ?? parentCategoryId;

  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: areProductsLoading,
  } = useInfiniteQuery<PaginatedProducts, Error, InfiniteData<PaginatedProducts>, any, number>({
    queryKey: ['products', filterCategoryId, sortBy],
    queryFn: ({ pageParam = 1 }) => {
      const orderby = sortBy.includes('price') ? 'price' : sortBy;
      const order = sortBy === 'price-asc' ? 'asc' : 'desc';
      return getProducts({ page: pageParam, category: filterCategoryId, orderby, order });
    },
    getNextPageParam: (lastPage) => (lastPage.current_page < lastPage.total_pages ? lastPage.current_page + 1 : undefined),
    initialPageParam: 1,
  });

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "400px", // Начинаем загружать следующие товары за 400px до конца списка
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedSubCategoryId) {
      params.set('subcategory', String(selectedSubCategoryId));
    } else {
      params.delete('subcategory');
    }
    setSearchParams(params, { replace: true });
  }, [selectedSubCategoryId, setSearchParams, searchParams]);

  const allProducts = productsData?.pages.flatMap((page) => page.items) ?? [];

  const isLoading = areCategoriesLoading || areProductsLoading;

  if (isLoading && allProducts.length === 0) {
    return <ProductListPageSkeleton />;
  }

  return (
    <div>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm">
        <BrandHeader />
      </header>

      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold truncate">{pageTitle}</h1>
      </div>

      <div 
        className="sticky bg-background/80 backdrop-blur-sm py-2 border-b" 
        style={filterPanelStyle}
      >
        <div className="flex items-center gap-2 px-4 overflow-x-auto scrollbar-hide">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="shrink-0 rounded-full h-control-sm w-control-sm"><ListFilter className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background/80">
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortKey)}>
                {Object.entries(sortOptions).map(([key, value]) => (<DropdownMenuRadioItem key={key} value={key}>{value}</DropdownMenuRadioItem>))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" className="shrink-0 rounded-full h-control-sm w-control-sm" onClick={() => navigate('/search')}><Search className="h-4 w-4" /></Button>

          {subCategories.length > 0 && (
            <>
              <Button
                variant={(selectedSubCategoryId === null) ? 'default' : 'outline'}
                onClick={() => setSelectedSubCategoryId(null)}
                className="shrink-0 rounded-full h-control-sm whitespace-nowrap"
              >
                {allButtonText}
              </Button>
              {subCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedSubCategoryId === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSubCategoryId(category.id)}
                  className="shrink-0 rounded-full h-control-sm whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 pb-4">
        {areProductsLoading && allProducts.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : (
          allProducts.map((product, index) => (
            <Fragment key={product.id}>
              {index === allProducts.length - 1
                ? <div ref={ref}><ProductCard product={product} /></div>
                : <ProductCard product={product} />
              }
            </Fragment>
          ))
        )}
      </div>

      {isFetchingNextPage && (
        <div className="px-4 grid grid-cols-2 gap-3 pb-4">
          <ProductCardSkeleton /><ProductCardSkeleton />
        </div>
      )}
      {!hasNextPage && !areProductsLoading && allProducts.length > 0 && (
        <p className="text-center text-muted-foreground py-4">Вы посмотрели все товары</p>
      )}
      {!areProductsLoading && allProducts.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          <p>Товары не найдены</p>
        </div>
      )}
    </div>
  );
};