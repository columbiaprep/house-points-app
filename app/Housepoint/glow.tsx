'use client';

import { memo, useEffect, useRef, ReactNode } from 'react';
import { cn } from './Dependencies';

interface GlowingEffectProps {
  className?: string;
  borderWidth?: number;
  duration?: number;
  color?: string;
  house?: string;
  children: ReactNode;
}

// full house list with all the house names and their glow colors that should be used. this can be changed if the color doesnt look good
const houseStyles: Record<string, { glowColor: string }> = {
  'Blue Thunder': { glowColor: 'rgba(59, 130, 246, 0.8)' },
  'Orange Supernova': { glowColor: 'rgba(251, 146, 60, 0.8)' },
  'Purple Reign': { glowColor: 'rgba(168, 85, 247, 0.8)' },
  'Red Pheonix': { glowColor: 'rgba(239, 68, 68, 0.8)' },
  'Silver Knights': { glowColor: 'rgba(156, 163, 175, 0.8)' },
  'Green Ivy': { glowColor: 'rgba(34, 197, 94, 0.8)' },
  'Gold House': { glowColor: 'rgba(234, 179, 8, 0.8)' },
  'Pink Panther': { glowColor: 'rgba(236, 72, 153, 0.8)' },
};

//NOTE! Memo is to compare props and only re-render if they change
const GlowingEffect = memo(
  ({
    className = '',
    borderWidth = 2,
    duration = 2000,
    color,
    house,
    children,
  }: GlowingEffectProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const resolvedColor =
      color || (house && houseStyles[house]?.glowColor) || 'rgba(255, 255, 255, 0.6)';

    useEffect(() => {
      if (ref.current) {
        const keyframes = [
          `0 0 0 ${borderWidth}px ${resolvedColor}`,
          `0 0 15px ${resolvedColor}`,
          `0 0 0 ${borderWidth}px ${resolvedColor}`,
        ];
        ref.current.animate(
          { boxShadow: keyframes },
          {
            duration,
            iterations: Infinity,
          }
        );
      }
    }, [borderWidth, duration, resolvedColor]);

    return (
      <div className="relative">
        <div
          ref={ref}
          className={cn(
            'absolute inset-0 rounded-lg pointer-events-none z-0 transition-all',
            className
          )}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

export default GlowingEffect;
