// src/components/shared/ActiveOrdersCarousel.tsx
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import type { Order } from '@/types';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AspectRatio } from '../ui/aspect-ratio';

// Скелетон для карусели
export const ActiveOrdersCarouselSkeleton = () => (
    <div className="animate-pulse">
        <Skeleton className="h-8 w-1/2 mb-2" />
        <div className="flex gap-3">
            <Skeleton className="h-40 w-[45%] rounded-2xl" />
            <Skeleton className="h-40 w-[45%] rounded-2xl" />
        </div>
    </div>
);

// Функция для перевода статусов
const translateStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'pending': 'Ожидает оплаты',
        'processing': 'В обработке',
        'on-hold': 'На удержании',
        'completed': 'Выполнен',
        'cancelled': 'Отменен',
        'refunded': 'Возвращен',
        'failed': 'Не удался',
    };
    return statusMap[status] || status;
}

export const ActiveOrdersCarousel = ({ orders }: { orders: Order[] }) => (
  <div>
    <h2 className="text-xl font-semibold mb-2">Активные заказы</h2>
    <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
      <CarouselContent className="-ml-3">
        {orders.map(order => (
          // ИЗМЕНЕНИЕ: Уменьшаем ширину карточки
          <CarouselItem key={order.id} className="pl-3 basis-[45%]  sm:basis-1/3">
            <Link to={`/orders/${order.id}`} className="block h-full">
                {/* Используем AspectRatio, чтобы сделать карточку квадратной */}
                <AspectRatio ratio={1 / 1} className="flex flex-col justify-between p-3 border rounded-2xl hover:bg-muted transition-colors">
                    <div>
                        <p className="font-bold text-base">Заказ №{order.number}</p>
                        <p className={cn(
                            "text-sm font-medium",
                            order.status === 'processing' ? 'text-blue-600' : 'text-amber-600'
                        )}>
                            {translateStatus(order.status)}
                        </p>
                    </div>

                    <div className="relative flex items-center h-10">
                        {order.line_items.slice(0, 3).map((item, index) => (
                        <div 
                            key={index} 
                            className="absolute h-14 w-14 rounded-lg border-2 border-background bg-muted overflow-hidden shrink-0"
                            style={{ 
                            left: `${index * 20}px`, // Уменьшаем сдвиг
                            zIndex: 3 - index,
                            }}
                        >
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-muted" />
                            )}
                        </div>
                        ))}
                        {order.line_items.length > 3 && (
                            <div 
                                className="absolute h-10 w-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-xs shrink-0"
                                style={{ 
                                    left: `${3 * 20}px`, 
                                    zIndex: 0 
                                }}
                            >
                                +{order.line_items.length - 3}
                            </div>
                        )}
                    </div>
                </AspectRatio>
            </Link>
          </CarouselItem>
        ))}
        <CarouselItem className="pl-3 basis-[45%] sm:basis-1/3">
           <Link to="/orders" className="block h-full">
            <AspectRatio ratio={1/1} className="flex flex-col items-center justify-center p-4 border rounded-2xl bg-muted hover:bg-muted/80 text-center transition-colors">
                <p className="font-bold text-base">Все заказы</p>
                <ArrowRight className="h-7 w-7 mt-2 text-muted-foreground"/>
            </AspectRatio>
           </Link>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </div>
);

export const OrderHistoryCard = () => (
    <Link to="/orders" className="block p-4 border rounded-2xl text-center bg-muted hover:bg-muted/80">
        <h2 className="font-semibold">История заказов</h2>
        <p className="text-sm text-muted-foreground">У вас пока нет активных заказов</p>
    </Link>
);