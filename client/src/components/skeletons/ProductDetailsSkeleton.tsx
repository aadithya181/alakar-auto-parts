import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const ProductDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-12 animate-fade-up">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="w-16 h-3 rounded" />
        <span className="text-slate-300">/</span>
        <Skeleton className="w-24 h-3 rounded" />
        <span className="text-slate-300">/</span>
        <Skeleton className="w-40 h-3 rounded" />
      </div>

      {/* Main Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mb-12">
        {/* Left Column: Image Gallery Skeleton (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-card p-4">
            <Skeleton className="w-full h-full rounded-2xl" />
            <div className="absolute top-6 left-6">
              <Skeleton className="w-16 h-6 rounded-xl" />
            </div>
            <div className="absolute top-6 right-6">
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex items-center gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-2xl shrink-0" />
            ))}
          </div>
        </div>

        {/* Right Column: Info & Purchase Actions (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-4 rounded" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="w-11/12 h-8 rounded-xl" />
            <Skeleton className="w-3/4 h-8 rounded-xl" />
          </div>

          {/* SKU / Part No / Ratings Row */}
          <div className="flex items-center gap-4">
            <Skeleton className="w-24 h-4 rounded" />
            <Skeleton className="w-28 h-4 rounded" />
            <Skeleton className="w-20 h-4 rounded" />
          </div>

          {/* Price Block */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-baseline gap-3">
              <Skeleton className="w-32 h-9 rounded-xl" />
              <Skeleton className="w-20 h-5 rounded" />
            </div>
            <Skeleton className="w-40 h-3 rounded" />
          </div>

          {/* Vehicle Compatibility Box Skeleton */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="w-48 h-5 rounded" />
              <Skeleton className="w-24 h-6 rounded-full" />
            </div>
            <Skeleton className="w-full h-10 rounded-xl" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="w-28 h-12 rounded-xl" />
            <Skeleton className="flex-1 h-12 rounded-xl" />
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
