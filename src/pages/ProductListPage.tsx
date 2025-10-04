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

const sortOptions = {
  popularity: 'Популярные',
  date: 'Новинки',
  'price-asc': 'Сначала дешевые',
  'price-desc': 'Сначала дорогие',
};
type SortKey = keyof typeof sortOptions;

export const ProductListPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  useBackButton(); 
  
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
  
  // --- НОВАЯ ЛОГИКА ОПРЕДЕЛЕНИЯ КАТЕГОРИЙ И ЗАГОЛОВКОВ ---
  const parentCategory = allCategories?.find(cat => cat.id === parentCategoryId);
  const selectedSubCategory = parentCategory?.children?.find(cat => cat.id === selectedSubCategoryId);
  const subCategories = parentCategory?.children ?? [];
  
  // Заголовок страницы - это название выбранной подкатегории или родительской категории
  const pageTitle = selectedSubCategory?.name || parentCategory?.name || 'Каталог';
  // Текст для кнопки "Все"
  const allButtonText = `${parentCategory?.name}`;
  
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
  
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedSubCategoryId) {
      params.set('subcategory', String(selectedSubCategoryId));
    }
    setSearchParams(params, { replace: true });
  }, [selectedSubCategoryId, setSearchParams]);

  const allProducts = productsData?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div>
      <div className="p-4">
        <h1 className="text-2xl font-bold truncate">{pageTitle}</h1>
      </div>
      
      <div className="sticky top-0 bg-background z-20 py-2">
        <div className="flex items-center gap-2 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0 rounded-2xl"><ListFilter className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortKey)}>
                            {Object.entries(sortOptions).map(([key, value]) => (
                                <DropdownMenuRadioItem key={key} value={key}>{value}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="icon" className="shrink-0 rounded-2xl" onClick={() => navigate('/search')}>
                    <Search className="h-4 w-4" />
                </Button>
            </div>

            {/* Показываем "таблетки" только если есть подкатегории */}
            {subCategories.length > 0 && (
                <div className="flex gap-2 whitespace-nowrap">
                    <Button
                        variant={selectedSubCategoryId === null ? 'default' : 'outline'}
                        onClick={() => setSelectedSubCategoryId(null)}
                        className="shrink-0 rounded-2xl"
                    >
                        {allButtonText}
                    </Button>
                    {areCategoriesLoading 
                        ? <Skeleton className="h-10 w-24 rounded-2xl" />
                        : subCategories.map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedSubCategoryId === category.id ? 'default' : 'outline'}
                                onClick={() => setSelectedSubCategoryId(category.id)}
                                className="shrink-0 rounded-2xl"
                            >
                                {category.name}
                            </Button>
                        ))}
                </div>
            )}
        </div>
      </div>
      
      <div className="px-2 pt-4 grid grid-cols-2 gap-2 pb-4">
        {areProductsLoading ? (
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
        <div className="px-4 grid grid-cols-2 gap-4 pb-4">
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