import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  bgClass?: string;
  height?: string;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  colorClass = 'bg-mint',
  bgClass = 'bg-warm-200',
  height = 'h-2',
  showLabel = false,
  className,
}) => {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={cn('relative w-full rounded-full overflow-hidden', bgClass, height, className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300 ease-out', colorClass)}
        style={{ width: `${percent}%` }}
      />
      {showLabel && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-coffee-dark drop-shadow-sm">
          {Math.round(value)}/{max}
        </span>
      )}
    </div>
  );
};
