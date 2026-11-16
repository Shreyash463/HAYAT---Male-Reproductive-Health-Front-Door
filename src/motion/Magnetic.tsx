import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { HAYAT_EASE } from './config';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { useDeviceCapabilities } from './useDeviceCapabilities';

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.2,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { isDesktop } = useDeviceCapabilities();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const active = isDesktop && !reduced;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-10, Math.min(10, (e.clientX - cx) * strength));
    const dy = Math.max(-8, Math.min(8, (e.clientY - cy) * strength));
    setOffset({ x: dx, y: dy });
  };

  const handleLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ duration: 0.3, ease: HAYAT_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
