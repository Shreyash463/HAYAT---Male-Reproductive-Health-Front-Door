import React from 'react';
import { motion } from 'framer-motion';
import { DURATIONS, HAYAT_EASE } from './config';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface PathDrawProps {
  d: string;
  viewBox?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  className?: string;
  delay?: number;
  duration?: number;
  fill?: string;
}

export const PathDraw: React.FC<PathDrawProps> = ({
  d,
  viewBox = '0 0 100 100',
  stroke = 'currentColor',
  strokeWidth = 2.5,
  strokeDasharray,
  className = '',
  delay = 0,
  duration = DURATIONS.slow,
  fill = 'none',
}) => {
  const reduced = usePrefersReducedMotion();

  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true">
      <motion.path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={strokeDasharray}
        initial={reduced ? { pathLength: 1, opacity: 0 } : { pathLength: 0, opacity: 0.4 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={
          reduced
            ? { duration: 0.18 }
            : { duration, delay, ease: HAYAT_EASE }
        }
      />
    </svg>
  );
};
