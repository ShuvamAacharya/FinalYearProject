import { useState } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const ConfettiBurst = ({ active }: { active: boolean }) => {
  const [pieces] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 280,
      y: -(Math.random() * 120 + 40),
      rotate: Math.random() * 360,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.15,
    })),
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.4, rotate: p.rotate }}
          transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
          className="absolute w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};

export default ConfettiBurst;
