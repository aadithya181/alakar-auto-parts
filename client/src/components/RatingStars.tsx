import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating?: number | string;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 5,
  totalReviews,
  size = 'sm',
  showScore = true,
}) => {
  const numRating = typeof rating === 'number' ? rating : parseFloat(rating) || 5;
  const starSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(numRating)
                ? 'fill-amber-400 text-amber-500'
                : 'text-slate-300 fill-slate-100'
            }`}
          />
        ))}
      </div>
      {showScore && (
        <span className="text-xs font-semibold text-slate-800">
          {numRating.toFixed(1)}
        </span>
      )}
      {totalReviews !== undefined && (
        <span className="text-xs text-slate-500">({totalReviews})</span>
      )}
    </div>
  );
};
