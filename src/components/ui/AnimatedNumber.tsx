import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

interface Props {
  value: number;
  format: (n: number) => string;
  className?: string;
  speed?: number;
}

export function AnimatedNumber({ value, format, className = '', speed }: Props) {
  const v = useAnimatedNumber(value, speed);
  return <span className={`tnum ${className}`}>{format(v)}</span>;
}
