// src/pages/NotificationsPage.tsx
import { Fragment, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, readAllNotifications } from "@/api/services/notifications.api";
import { useInView } from "react-intersection-observer";
import { useBackButton } from "@/hooks/useBackButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { NotificationListItem } from "@/components/shared/NotificationListItem";
import { BrandHeader } from "@/components/shared/BrandHeader";

const NotificationsPageSkeleton = () => (
    <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-1/2" /> {/* h-8 для text-2xl */}
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
            </div>
        </div>
    </>
);


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
        return <NotificationsPageSkeleton />;
    }

    return (
        <div>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
            <header 
                className="flex justify-between items-center p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10"
                style={{ top: 'var(--tg-viewport-header-height, 0px)' }}
            >
                <h1 className="text-2xl font-bold">Уведомления</h1>
                {hasUnread && (
                    <Button variant="ghost" size="sm" onClick={() => readAllMutation.mutate()} disabled={readAllMutation.isPending}>
                        <CheckCheck className="mr-2 h-4 w-4" /> Прочитать все
                    </Button>
                )}
            </header>
            
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
                    {isFetchingNextPage && <div className="p-4"><Skeleton className="h-24 w-full rounded-lg" /></div>}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-4">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Здесь будут появляться уведомления о заказах и акциях</p>
                </div>
            )}
        </div>
    );
};