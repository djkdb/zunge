import { useEffect, useRef, useState } from 'react';

/** 목표값으로 부드럽게 수렴하는 숫자 (requestAnimationFrame 기반) */
export function useAnimatedNumber(target: number, speed = 0.18): number {
  const [value, setValue] = useState(target);
  const ref = useRef(target);
  const targetRef = useRef(target);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    targetRef.current = target;
    if (raf.current !== null) return;
    const step = () => {
      const t = targetRef.current;
      const cur = ref.current;
      const diff = t - cur;
      if (Math.abs(diff) < Math.max(0.5, Math.abs(t) * 0.0005)) {
        ref.current = t;
        setValue(t);
        raf.current = null;
        return;
      }
      ref.current = cur + diff * speed;
      setValue(ref.current);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [target, speed]);

  useEffect(() => () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
  }, []);

  return value;
}
