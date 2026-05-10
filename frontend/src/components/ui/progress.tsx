import { cn } from '@/utils/cn';

type ProgressProps = {
  value: number;
  max: number;
  className?: string;
};

export function Progress({ value, max, className }: ProgressProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-indigo-500';

  return (
    <div className={cn('h-2 w-full rounded-full bg-gray-100', className)}>
      <div
        className={cn('h-2 rounded-full transition-all', color)}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}
