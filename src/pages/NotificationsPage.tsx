// src/pages/NotificationsPage.tsx
import { Fragment, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, readAllNotifications } from "@/api/services/notifications.api";
import { useInView } from "react-intersection-observer";
import { useBackButton } from "@/hooks/useBackButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { NotificationListItem } from "@/components/shared/NotificationListItem"; // <-- Импортируем новый компонент

export const NotificationsPage = () => {
    useBackButton();
    const queryClient = useQueryClient();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['notifications'],
        queryFn: ({ pageParam = 1 }) => getNotifications({ page: pageParam }),
        getNextPageParam: (lastPage) => lastPage.current_page < lastPage.total_pages ? lastPage.current_page + 1 : undefined,
        initialPageParam: 1,
    });

    const readAllMutation = useMutation({
        mutationFn: readAllNotifications,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });

    const { ref, inView } = useInView();
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

    const allNotifications = data?.pages.flatMap(page => page.items) ?? [];
    const hasUnread = allNotifications.some(n => !n.is_read);

    if (isLoading) {
        return (
            <div className="p-4">
                <Skeleton className="h-9 w-1/3 mb-4" />
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <h1 className="text-3xl font-bold">Уведомления</h1>
                {hasUnread && (
                    <Button variant="ghost" size="sm" onClick={() => readAllMutation.mutate()} disabled={readAllMutation.isPending}>
                        <CheckCheck className="mr-2 h-4 w-4" /> Прочитать все
                    </Button>
                )}
            </div>
            {allNotifications.length > 0 ? (
                <div className="divide-y">
                    {allNotifications.map((notification, index) => (
                        <Fragment key={notification.id}>
                            {index === allNotifications.length - 1
                                ? <div ref={ref}><NotificationListItem notification={notification} /></div>
                                : <NotificationListItem notification={notification} />
                            }
                        </Fragment>
                    ))}
                    {isFetchingNextPage && <div className="p-4"><Skeleton className="h-24 w-full" /></div>}
                </div>
            ) : (
                <div className="text-center p-16 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4" />
                    <p>Здесь будут появляться уведомления о заказах и акциях</p>
                </div>
            )}
        </div>
    );
};