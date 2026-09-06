interface Props {
  value: number; // 0~1
  color?: string;
  height?: number;
  striped?: boolean;
  className?: string;
  trackClassName?: string;
}

export function ProgressBar({ value, color = 'bg-primary', height = 8, striped, className = '', trackClassName = 'bg-white/10' }: Props) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className={`w-full overflow-hidden rounded-full ${trackClassName} ${className}`} style={{ height }}>
      <div
        className={`h-full rounded-full transition-[width] duration-200 ease-linear ${color} ${striped ? 'progress-stripes' : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
