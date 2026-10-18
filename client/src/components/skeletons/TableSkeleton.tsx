import React from 'react';
import { Skeleton } from '../common/Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {/* Header Row Skeleton */}
      <div className="flex items-center gap-4 bg-slate-50/80 px-6 py-4 border-b border-slate-200">
        {[...Array(columns)].map((_, i) => (
          <div key={`th-${i}`} className="flex-1">
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>

      {/* Body Rows */}
      <div className="divide-y divide-slate-100">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={`tr-${rowIndex}`} className="flex items-center gap-4 px-6 py-4">
            {[...Array(columns)].map((_, colIndex) => (
              <div key={`td-${rowIndex}-${colIndex}`} className="flex-1">
                <Skeleton
                  className={`h-4 rounded ${
                    colIndex === 0
                      ? 'w-11/12'
                      : colIndex === columns - 1
                      ? 'w-16 ml-auto'
                      : 'w-2/3'
                  }`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
