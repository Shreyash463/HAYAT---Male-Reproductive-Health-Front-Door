import React from 'react';
import { motion } from 'framer-motion';
import { DURATIONS, HAYAT_EASE } from './config';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  y = 18,
  duration = DURATIONS.base,
  className = '',
}) => {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={
        reduced
          ? { duration: 0.18, delay: 0 }
          : { duration, delay, ease: HAYAT_EASE }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
};
