// src/pages/ProductPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/api/services/catalog.api';
import { useFavorite } from '@/hooks/useFavorite';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { useBackButton } from '@/hooks/useBackButton';
import { Heart, ShoppingBag, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import type { Product, ProductVariation, ProductImage } from '@/types';
import { SlideCounter } from '@/components/shared/SlideCounter';
import { Badge } from '@/components/ui/badge';
import { QuantitySelector } from '@/components/shared/QuantitySelector';
import { ProductPageSkeleton } from '@/components/shared/ProductPageSkeleton';
import { AxiosError } from 'axios';
import { ProductNotFound } from '@/components/shared/ProductNotFound';
import { StarRating } from '@/components/shared/StarRating';
import { ReviewList } from '@/components/shared/ReviewList';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandHeader } from '@/components/shared/BrandHeader';

const buttonVariants = {
  tap: { scale: 0.95 },
};

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  useBackButton();

  const favoriteMutation = useFavorite();
  const { addToCart, updateQuantity, isUpdating: isCartUpdating } = useCart();
  
  const { data: product, isLoading, isError, error } = useQuery<Product, AxiosError>({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !isNaN(productId) && productId > 0,
    retry: false,
  });

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const isVariable = !!(product?.variations && product.variations.length > 0);
  
  const attributes = useMemo(() => {
    if (!isVariable || !product.variations) return [];
    const attrsMap: Record<string, Set<string>> = {};
    product.variations.forEach(v => {
        v.attributes.forEach(attr => {
            if (!attrsMap[attr.name]) attrsMap[attr.name] = new Set();
            attrsMap[attr.name].add(attr.option);
        });
    });
    return Object.entries(attrsMap).map(([name, options]) => ({ name, options: Array.from(options) }));
  }, [product, isVariable]);

  useEffect(() => {
    if (isVariable && product?.variations && Object.keys(selectedAttributes).length === attributes.length) {
        const variation = product.variations.find(v => 
            v.attributes.every(attr => selectedAttributes[attr.name] === attr.option)
        );
        setSelectedVariation(variation || null);
    } else {
        setSelectedVariation(null);
    }
  }, [selectedAttributes, product, isVariable, attributes]);
  
  const handleAttributeChange = (name: string, option: string) => {
      setSelectedAttributes(prev => ({ ...prev, [name]: option }));
  };

  const displayPrice = selectedVariation?.price || product?.price;
  const displayRegularPrice = selectedVariation?.regular_price || product?.regular_price;
  const displayOnSale = selectedVariation?.on_sale || product?.on_sale;
  const displayStockStatus = selectedVariation?.stock_status || product?.stock_status;
  const displayImages: ProductImage[] = selectedVariation ? [selectedVariation.image] : product?.images ?? [];
  
  const itemInCart = useCartStore(state => state.items.find(item => {
    if (isVariable && selectedVariation) {
        return item.variation?.id === selectedVariation.id;
    }
    if (!isVariable && !selectedVariation) {
        return item.product.id === productId && !item.variation;
    }
    return false;
  }));

  const canAddToCart = displayStockStatus === 'instock' && (!isVariable || !!selectedVariation);

  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    setTotalSlides(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap() + 1);
    const handleSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap() + 1);
    carouselApi.on("select", handleSelect);
    return () => { carouselApi.off("select", handleSelect); };
  }, [carouselApi, displayImages]);

  const handleFavoriteClick = () => { 
    if (!product) return; 
    favoriteMutation.mutate({ productId: product.id, isFavorite: product.is_favorite }); 
  };
  
  const handleUpdateQuantity = (newQuantity: number) => { 
    if (!product) return; 
    updateQuantity(product.id, newQuantity, itemInCart?.variation?.id); 
  };
  
  const handleAddToCartClick = () => { 
    if (!product) return; 
    addToCart(product, 1, selectedVariation?.id); 
  };

  const handleDoubleClickFavorite = () => {
    if (!product || favoriteMutation.isPending) return;
    if (!product.is_favorite) {
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 800);
    }
    favoriteMutation.mutate({ productId: product.id, isFavorite: product.is_favorite });
  };

  if (isLoading) { return <ProductPageSkeleton />; }
  if (isError && error?.response?.status === 404) { return <ProductNotFound />; }
  if (isError || !product) { 
    return (
        <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
            <div className="p-4 text-center">
                <h1 className="text-2xl font-bold">Произошла ошибка</h1>
                <p className="text-muted-foreground mt-2">{error?.message || 'Не удалось загрузить товар'}</p>
            </div>
        </>
    );
  }

  const hasDescription = product.description && product.description.replace(/<p>|<\/p>|\s/g, '').length > 0;
  const showReviewsSection = product.rating_count > 0 || product.can_review;
  
  return (
    <div>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
      <main className="pb-24 p-4 space-y-6">
        <div 
          className="relative overflow-hidden rounded-2xl group"
          onDoubleClick={handleDoubleClickFavorite}
        >
          <AnimatePresence>
            {showHeartAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              >
                <Heart className="h-24 w-24 text-white fill-white drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>

          <Button asChild variant="ghost" size="icon" className={cn('absolute top-3 right-3 h-control-sm w-control-sm rounded-full z-10 text-black/80 hover:bg-transparent', product.is_favorite && '!text-red-500')}>
            <motion.button onClick={handleFavoriteClick} disabled={favoriteMutation.isPending} variants={buttonVariants} whileTap="tap">
                <Heart className={cn("h-6 w-6", product.is_favorite && 'fill-current')} />
            </motion.button>
          </Button>
          
          {displayImages.length > 0 ? (
              <Carousel setApi={setCarouselApi} className="w-full">
                <CarouselContent>
                    {displayImages.map(image => (
                        <CarouselItem key={image.id}>
                            <img src={image.src} alt={image.alt || product.name} className="w-full rounded-2xl h-auto aspect-square object-cover" loading="lazy" />
                        </CarouselItem>
                    ))}
                </CarouselContent>
              </Carousel>
          ) : (
              <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-2xl">
                <span className="text-muted-foreground">Нет изображения</span>
              </div>
          )}
          <SlideCounter current={currentSlide} total={totalSlides} />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {product.categories.map(category => (
              <Link key={category.id} to={`/catalog/${category.id}`}><Badge variant="secondary" className="hover:bg-accent cursor-pointer rounded-lg">{category.name}</Badge></Link>
          ))}
        </div>

        <h1 className="text-2xl font-bold leading-tight break-words">{product.name}</h1>
        {product.sku && <p className="text-sm text-muted-foreground">Артикул: {product.sku}</p>}
        
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{parseFloat(displayPrice || '0').toFixed(0)} ₽</span>
          {displayOnSale && displayRegularPrice && (
            <span className="text-lg text-muted-foreground line-through">{parseFloat(displayRegularPrice).toFixed(0)} ₽</span>
          )}
        </div>

        {product.rating_count > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer -mt-4" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
              <StarRating rating={parseFloat(product.average_rating)} />
              <span>({product.rating_count} {product.rating_count === 1 ? 'отзыв' : (product.rating_count > 1 && product.rating_count < 5 ? 'отзыва' : 'отзывов')})</span>
          </div>
        )}
        
        {attributes.map(attr => (
          <div key={attr.name} className="border-t pt-4">
              <Label className="font-semibold mb-3 block text-lg">{attr.name}</Label>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-2 whitespace-nowrap py-1">
                      {attr.options.map(option => (
                          <Button
                              key={option}
                              variant={selectedAttributes[attr.name] === option ? 'default' : 'outline'}
                              onClick={() => handleAttributeChange(attr.name, option)}
                              className="h-control-sm rounded-full shrink-0"
                          >
                              {option}
                          </Button>
                      ))}
                  </div>
              </div>
          </div>
        ))}
        
        {hasDescription && (
          <div className="pt-4 border-t">
              <h2 className="font-semibold mb-2 text-2xl break-words">Описание</h2>
              <div className="text-foreground/80 prose prose-sm max-w-none prose-p:my-2" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}

        {showReviewsSection && (
          <div id="reviews-section" className="border-t pt-6 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Отзывы ({product.rating_count})</h2>
                {product.can_review && (
                    <Button asChild variant="outline" className="h-control-sm rounded-full">
                      <motion.button onClick={() => navigate(`/product/${productId}/review/create`)} variants={buttonVariants} whileTap="tap">
                          Оставить отзыв
                      </motion.button>
                    </Button>
                )}
            </div>
            
            {product.rating_count > 0 ? (
                <div>
                    <ReviewList productId={productId} take={1} />
                    {product.rating_count > 1 && (
                        <Button asChild variant="outline" className="w-full mt-4 h-control-sm rounded-full">
                          <motion.button onClick={() => navigate(`/product/${productId}/reviews`, { state: { productName: product.name, ratingCount: product.rating_count } })} variants={buttonVariants} whileTap="tap">
                              Показать все отзывы ({product.rating_count})
                              <ChevronRight className="h-4 w-4 ml-2" />
                          </motion.button>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="text-center text-muted-foreground pt-4">
                    <p>На этот товар еще нет отзывов.</p>
                    {product.can_review && <p>Станьте первым!</p>}
                </div>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-3 z-20">
        {itemInCart ? (
            <div className="flex items-center gap-3">
                <div className="shrink-0">
                    <QuantitySelector 
                        quantity={itemInCart.quantity}
                        onDecrement={() => handleUpdateQuantity(itemInCart.quantity - 1)}
                        onIncrement={() => handleUpdateQuantity(itemInCart.quantity + 1)}
                        maxQuantity={selectedVariation?.stock_quantity ?? product.stock_quantity}
                        isUpdating={isCartUpdating}
                        className="h-control-md rounded-2xl"
                    />
                </div>
                <Button asChild size="lg" className="flex-grow h-control-md text-base rounded-2xl">
                    <motion.button onClick={() => navigate('/cart')} variants={buttonVariants} whileTap="tap">
                        В корзину <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.button>
                </Button>
            </div>
        ) : (
            <Button asChild size="lg" className="w-full h-control-md text-base rounded-2xl">
                <motion.button disabled={!canAddToCart} onClick={handleAddToCartClick} variants={buttonVariants} whileTap="tap">
                    {isVariable && !selectedVariation ? "Выберите вариант" : (
                        <>
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            {displayStockStatus === 'instock' ? 'Добавить в корзину' : 'Нет в наличии'}
                        </>
                    )}
                </motion.button>
            </Button>
        )}
      </footer>
    </div>
  );
};