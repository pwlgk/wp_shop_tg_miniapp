// src/components/shared/ProductCard.tsx
import { useState, useEffect } from 'react';
import type { Product } from '@/types';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { useFavorite } from '@/hooks/useFavorite';
// import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    const favoriteMutation = useFavorite();
    // const { addToCart } = useCart();

    const [api, setApi] = useState<CarouselApi | null>(null);
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());
        api.on("select", () => setCurrent(api.selectedScrollSnap()));
        return () => { api.off("select", () => setCurrent(api.selectedScrollSnap())) };
    }, [api]);

    // const handleCartClick = (e: React.MouseEvent) => {
    //     e.preventDefault(); e.stopPropagation();
    //     addToCart(product, 1);
    // };
    
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        favoriteMutation.mutate({ productId: product.id, isFavorite: product.is_favorite });
    };

    // Расчет скидки в процентах
    const discountPercent = product.on_sale 
        ? Math.round(((parseFloat(product.regular_price) - parseFloat(product.price)) / parseFloat(product.regular_price)) * 100)
        : 0;

    return (
        <Link to={`/product/${product.id}`} className="block group">
            <div className="relative bg-background border rounded-3xl overflow-visible transition-shadow hover:shadow-md h-full flex flex-col">
                
                {/* --- БЛОК С КАРУСЕЛЬЮ ИЗОБРАЖЕНИЙ --- */}
                <div className="relative overflow-hidden rounded-t-lg">
                    <Carousel setApi={setApi} opts={{ loop: product.images.length > 1 }} className="w-full">
                        <CarouselContent>
                            {product.images.length > 0 ? (
                                product.images.map(image => (
                                    <CarouselItem key={image.id}>
                                        <img src={image.src} alt={image.alt || product.name} className="aspect-[4/5] rounded-3xl w-full object-cover" loading="lazy"/>
                                    </CarouselItem>
                                ))
                            ) : (
                                <CarouselItem>
                                    <div className="aspect-[4/5] w-full bg-muted flex items-center justify-center">
                                        <span className="text-sm text-muted-foreground">Нет фото</span>
                                    </div>
                                </CarouselItem>
                            )}
                        </CarouselContent>
                    </Carousel>
                    
                    {/* Бейдж со скидкой */}
                    {discountPercent > 0 && (
                        <Badge variant="destructive" className="absolute top-2 left-2">-{discountPercent}%</Badge>
                    )}

                    {/* Кнопка "Избранное" без фона */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-9 w-9 text-black/80 hover:bg-transparent"
                        onClick={handleFavoriteClick}
                        disabled={favoriteMutation.isPending}
                    >
                        <Heart className={cn("h-6 w-6 transition-all", product.is_favorite && 'fill-red-500 text-red-500')} />
                    </Button>
                    
                    {/* Индикаторы карусели */}
                    {count > 1 && (
                        <div className="absolute bottom-2 left-0 right-0 z-10 flex items-center justify-center gap-1.5">
                            {Array.from({ length: count }).map((_, index) => (
                                <button key={index} onClick={(e) => { e.preventDefault(); api?.scrollTo(index); }}
                                    className={cn("h-1.5 w-1.5 rounded-full bg-white/70 backdrop-blur-sm transition-all", current === index && "w-4")}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* --- БЛОК С ИНФОРМАЦИЕЙ --- */}
                <div className="p-3 flex-grow flex flex-col">
                    <div className="flex-grow">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-foreground">{parseFloat(product.price).toFixed(0)} ₽</span>
                            {product.on_sale && (
                                <span className="text-sm text-muted-foreground line-through">{parseFloat(product.regular_price).toFixed(0)} ₽</span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug mt-1 line-clamp-2 h-14">
                            {product.name}
                        </p>
                    </div>
                </div>

                {/* --- КНОПКА "В КОРЗИНУ" НА СТЫКЕ --- */}
                {/* <Button
                    size="icon"
                    className="absolute bottom-[4.5rem] right-3 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg transform translate-y-1/2 transition-transform group-hover:scale-110"
                    disabled={product.stock_status !== 'instock' || isUpdating}
                    onClick={handleCartClick}
                >
                    <ShoppingCart className="h-6 w-6" />
                </Button> */}
            </div>
        </Link>
    );
};