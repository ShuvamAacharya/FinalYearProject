import { useEffect, useState } from 'react';

export function useCountUp(target: number, duration = 1200, active = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(target);
      return;
    }
    let start = 0;
    const startTime = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, active]);

  return value;
}
