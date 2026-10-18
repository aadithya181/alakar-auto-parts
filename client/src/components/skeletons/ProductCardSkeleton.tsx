import React from 'react';
import { Skeleton } from '../common/Skeleton';

interface ProductCardSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = () => {
  return (
    <div className="relative bg-white border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col h-full shadow-card">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
        <Skeleton className="w-full h-full rounded-none" />
        
        {/* Badge Skeletons */}
        <div className="absolute top-2.5 left-2.5">
          <Skeleton className="w-14 h-4 rounded-lg" />
        </div>
        <div className="absolute top-2.5 right-2.5">
          <Skeleton className="w-7 h-7 rounded-full" />
        </div>
      </div>

      {/* Card Details Skeleton */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-2">
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <Skeleton className="w-16 h-3 rounded" />
          </div>

          {/* Product Title (2 lines) */}
          <div className="space-y-1.5 mb-2">
            <Skeleton className="w-full h-3.5 rounded" />
            <Skeleton className="w-3/4 h-3.5 rounded" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1">
            <Skeleton className="w-20 h-3 rounded" />
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-baseline gap-1.5">
            <Skeleton className="w-16 h-5 rounded" />
            <Skeleton className="w-10 h-3 rounded" />
          </div>

          {/* Add to Cart Button Skeleton */}
          <Skeleton className="w-16 h-7 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
