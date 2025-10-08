// src/pages/OrderListPage.tsx
import { Fragment, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getOrdersHistory } from "@/api/services/orders.api";
import { useInView } from "react-intersection-observer";
import { useBackButton } from "@/hooks/useBackButton";
import { OrderListItem } from "@/components/shared/OrderListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export const OrderListPage = () => {
    useBackButton();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
        queryKey: ['orders'],
        // ИЗМЕНЕНИЕ ЗДЕСЬ:
        // Передаем строку со всеми необходимыми статусами в API.
        // Бэкенд должен уметь принимать несколько статусов через запятую.
        queryFn: ({ pageParam = 1 }) => getOrdersHistory({ 
            page: pageParam,
            status: "pending,processing,on-hold,completed,cancelled"
        }),
        getNextPageParam: (lastPage) => lastPage.current_page < lastPage.total_pages ? lastPage.current_page + 1 : undefined,
        initialPageParam: 1,
    });

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

    const allOrders = data?.pages.flatMap(page => page.items) ?? [];

    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                <h1 className="text-3xl font-bold">Мои заказы</h1>
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
            </div>
        );
    }
    
    if (isError) {
        return <div className="p-4 text-center">Ошибка загрузки заказов.</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4">Мои заказы</h1>
            {allOrders.length > 0 ? (
                <div className="space-y-4">
                    {allOrders.map((order, index) => (
                        <Fragment key={order.id}>
                            {index === allOrders.length - 1 
                                ? <div ref={ref}><OrderListItem order={order} /></div>
                                : <OrderListItem order={order} />
                            }
                        </Fragment>
                    ))}
                    {isFetchingNextPage && <Skeleton className="h-28 w-full rounded-2xl" />}
                </div>
            ) : (
                <div className="text-center pt-16">
                    <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">У вас еще нет заказов</h2>
                    <Button asChild className="mt-6 h-control-md rounded-2xl"><Link to="/">Начать покупки</Link></Button>
                </div>
            )}
        </div>
    );
};