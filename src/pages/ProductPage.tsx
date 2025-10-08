// src/pages/ProductPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/api/services/catalog.api';
import { useFavorite } from '@/hooks/useFavorite';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { useBackButton } from '@/hooks/useBackButton';
import { Heart, ShoppingBag, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';
import { SlideCounter } from '@/components/shared/SlideCounter';
import { Badge } from '@/components/ui/badge';
import { QuantitySelector } from '@/components/shared/QuantitySelector';
import { ProductPageSkeleton } from '@/components/shared/ProductPageSkeleton';
import { toast } from 'sonner';
import { AxiosError } from 'axios'; // <-- Импортируем AxiosError
import { ProductNotFound } from '@/components/shared/ProductNotFound'; // <-- Импортируем наш новый компонент

const MINI_APP_BASE_URL = import.meta.env.VITE_MINI_APP_BASE_URL || 'MINI_APP_BASE_URL';

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);
  const webApp = (window as any).Telegram?.WebApp;

  useBackButton();

  const favoriteMutation = useFavorite();
  const { updateQuantity, addToCart, isUpdating: isCartUpdating } = useCart();
  const itemInCart = useCartStore((state) => 
    state.items.find(item => item.product.id === productId)
  );

  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);

  const { data: product, isLoading, isError, error } = useQuery<Product, AxiosError>({ // <-- Указываем AxiosError как тип ошибки
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !isNaN(productId) && productId > 0,
    retry: false, // Отключаем повторные попытки для 404
  });
  
  // --- НОВАЯ ЛОГИКА ОБРАБОТКИ 404 ---
  const isNotFoundError = isError && error?.response?.status === 404;

  useEffect(() => {
    if (!carouselApi) return;
    setTotalSlides(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap() + 1);
    const handleSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap() + 1);
    };
    carouselApi.on("select", handleSelect);
    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi]);

  const handleFavoriteClick = () => {
    if (!product) return;
    favoriteMutation.mutate({ productId: product.id, isFavorite: product.is_favorite });
  };
  
  const handleUpdateQuantity = (newQuantity: number) => {
    if (!product) return;
    updateQuantity(product.id, newQuantity);
  };
  
  const handleAddToCartClick = () => {
    if (!product) return;
    addToCart(product, 1);
  };

  const handleShare = () => {
    if (!product) return;
    const url = `${MINI_APP_BASE_URL}?startapp=product-${product.id}`;
    
    if (webApp?.showPopup) {
        webApp.showPopup({
            title: 'Поделиться товаром',
            message: `Смотри, что я нашел(ла): ${product.name}`,
            buttons: [
                { id: 'share', type: 'default', text: 'Отправить' },
                { id: 'copy', type: 'default', text: 'Копировать ссылку' },
                { type: 'cancel' },
            ]
        }, (buttonId: string) => {
            if (buttonId === 'share') {
                webApp.switchInlineQuery(`${product.name} - ${url}`);
            }
            if (buttonId === 'copy') {
                webApp.close();
                navigator.clipboard.writeText(url).then(() => {
                    toast.success("Ссылка скопирована!");
                });
            }
        });
    } else {
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Ссылка на товар скопирована!");
        });
    }
  };

  // --- ОБНОВЛЕННАЯ ЛОГИКА РЕНДЕРИНГА ---
  if (isLoading) { 
    return <ProductPageSkeleton />; 
  }
  
  // Если ошибка 404, показываем специальный компонент
  if (isNotFoundError) {
    return <ProductNotFound />;
  }

  // Если любая другая ошибка или нет данных
  if (isError || !product) { 
    return ( 
      <div className="p-4 text-center"> 
        <h1 className="text-3xl font-bold">Произошла ошибка</h1> 
        <p className="text-muted-foreground mt-2">{error?.message || 'Не удалось загрузить товар'}</p> 
      </div> 
    ); 
  }

  const hasDescription = product.description && product.description.replace(/<p>|<\/p>|\s/g, '').length > 0;
  
  return (
    <div className="relative">
      <main className="pb-24">
        <div className="p-4">
            <div className="relative overflow-hidden rounded-2xl group">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleFavoriteClick}
                disabled={favoriteMutation.isPending}
                className={cn(
                  'absolute top-3 right-3 h-control-sm w-control-sm rounded-full z-10 text-black/80 hover:bg-transparent',
                  product.is_favorite && '!text-red-500'
                )}
              >
                <Heart className={cn("h-6 w-6", product.is_favorite && 'fill-current')} />
              </Button>
              
              <Button 
                variant="ghost" size="icon" onClick={handleShare}
                className="absolute bottom-2 left-3 h-control-sm w-control-sm rounded-full z-10 text-black/80 hover:bg-transparent"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              
              {product.images.length > 0 ? (
                  <Carousel setApi={setCarouselApi} className="w-full">
                    <CarouselContent>
                        {product.images.map(image => (
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
        </div>
        
        <div className="px-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {product.categories.map(category => (
                <Link key={category.id} to={`/catalog/${category.id}`}>
                    <Badge variant="secondary" className="hover:bg-accent cursor-pointer rounded-lg">{category.name}</Badge>
                </Link>
            ))}
          </div>

          <h1 className="text-3xl font-bold leading-tight break-words">{product.name}</h1>
          
          {product.sku && <p className="text-sm text-muted-foreground">Артикул: {product.sku}</p>}
          
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-4xl font-bold text-primary">
              {parseFloat(product.price).toFixed(0)} ₽
            </span>
            {product.on_sale && product.regular_price && (
              <span className="text-lg text-muted-foreground line-through">
                {parseFloat(product.regular_price).toFixed(0)} ₽
              </span>
            )}
          </div>
          
          {hasDescription && (
            <div className="pt-4 border-t">
                <h2 className="font-semibold mb-2 text-2xl break-words">Описание</h2>
                <div 
                    className="text-foreground/80 prose prose-sm max-w-none prose-p:my-2"
                    dangerouslySetInnerHTML={{ __html: product.description }} 
                />
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-3 z-20">
        {itemInCart ? (
            <div className="flex items-center gap-3">
                <div className="shrink-0">
                    <QuantitySelector 
                        quantity={itemInCart.quantity}
                        onDecrement={() => handleUpdateQuantity(itemInCart.quantity - 1)}
                        onIncrement={() => handleUpdateQuantity(itemInCart.quantity + 1)}
                        maxQuantity={product.stock_quantity}
                        isUpdating={isCartUpdating}
                        className="h-control-md rounded-2xl"
                    />
                </div>
                <Button 
                    size="lg" 
                    className="flex-grow h-control-md text-base rounded-2xl"
                    onClick={() => navigate('/cart')}
                >
                    В корзину
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        ) : (
            <Button 
                size="lg" 
                className="w-full h-control-md text-base rounded-2xl"
                disabled={product.stock_status !== 'instock' || isCartUpdating || favoriteMutation.isPending}
                onClick={handleAddToCartClick}
            >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {product.stock_status === 'instock' ? 'Добавить в корзину' : 'Нет в наличии'}
            </Button>
        )}
      </footer>
    </div>
  );
};