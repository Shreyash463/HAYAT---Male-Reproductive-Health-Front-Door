import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/AppContext';
import { useDeviceCapabilities, usePrefersReducedMotion } from '../motion';

export const CursorHalo: React.FC = () => {
  const { theme } = useApp();
  const reduced = usePrefersReducedMotion();
  const { isDesktop } = useDeviceCapabilities();
  const haloRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const enabled = isDesktop && !reduced;

  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;
    const target = { x: -400, y: -400 };
    const current = { x: -400, y: -400 };
    let isActive = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!isActive) {
        isActive = true;
        setVisible(true);
      }
    };

    const onLeave = () => {
      isActive = false;
      setVisible(false);
    };

    const loop = () => {
      if (!document.hidden && haloRef.current && isActive) {
        current.x += (target.x - current.x) * 0.14;
        current.y += (target.y - current.y) * 0.14;
        haloRef.current.style.transform = `translate3d(${current.x - 180}px, ${current.y - 180}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const haloGradient =
    theme === 'dark'
      ? 'radial-gradient(circle, rgba(196, 174, 165, 0.085) 0%, rgba(58, 180, 165, 0.03) 42%, transparent 72%)'
      : 'radial-gradient(circle, rgba(122, 100, 92, 0.095) 0%, rgba(31, 138, 125, 0.035) 42%, transparent 72%)';

  return (
    <div
      ref={haloRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 w-[360px] h-[360px] rounded-full z-20 transition-opacity duration-300"
      style={{
        opacity: visible ? 1 : 0,
        background: haloGradient,
        willChange: 'transform',
      }}
    />
  );
};
