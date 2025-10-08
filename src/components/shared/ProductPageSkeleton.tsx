// src/components/shared/ProductPageSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export const ProductPageSkeleton = () => (
    <div className="animate-pulse">
      <div className="p-4 space-y-4">
        <div className="overflow-hidden rounded-2xl">
          <Skeleton className="w-full aspect-square" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-3 border-t bg-background">
         <div className="flex gap-3">
            <Skeleton className="h-control-md w-32 rounded-2xl" />
            <Skeleton className="h-control-md flex-grow rounded-2xl" />
        </div>
      </div>
    </div>
);