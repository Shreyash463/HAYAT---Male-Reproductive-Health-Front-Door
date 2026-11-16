import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DURATIONS, HAYAT_EASE } from './config';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { useDeviceCapabilities } from './useDeviceCapabilities';

interface TiltCardProps {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 4,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { isDesktop } = useDeviceCapabilities();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const active = isDesktop && !reduced;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -py * maxTilt * 2,
      rotateY: px * maxTilt * 2,
    });
  };

  const handleLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
      }}
      transition={{ duration: DURATIONS.fast, ease: HAYAT_EASE }}
      style={{ transformStyle: 'preserve-3d', transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
