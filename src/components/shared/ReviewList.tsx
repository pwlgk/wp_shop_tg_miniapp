// src/components/shared/ReviewList.tsx
import { Fragment, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getReviews } from "@/api/services/reviews.api";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewItem } from "./ReviewItem";

const ReviewListSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="py-6 space-y-3">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="space-y-1 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        ))}
    </div>
);

interface ReviewListProps {
    productId: number;
    take?: number; 
}

export const ReviewList = ({ productId, take }: ReviewListProps) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['reviews', productId],
        queryFn: ({ pageParam = 1 }) => getReviews(productId, pageParam),
        getNextPageParam: (lastPage) => lastPage.current_page < lastPage.total_pages ? lastPage.current_page + 1 : undefined,
        initialPageParam: 1,
    });

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !take) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, take]);

    const allReviews = data?.pages.flatMap(page => page.items) ?? [];
    const reviewsToShow = take ? allReviews.slice(0, take) : allReviews;

    if (isLoading) {
        return <ReviewListSkeleton />;
    }

    return (
        <div className="divide-y -my-6">
            {reviewsToShow.map((review, index) => (
                <Fragment key={review.id}>
                    {!take && index === allReviews.length - 1
                        ? <div ref={ref}><ReviewItem review={review} /></div>
                        : <ReviewItem review={review} />
                    }
                </Fragment>
            ))}
            {isFetchingNextPage && !take && (
                <div className="py-6">
                    <ReviewListSkeleton />
                </div>
            )}
        </div>
    );
};