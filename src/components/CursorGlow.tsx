import React, { useEffect, useRef } from 'react';
import { useIsTouchDevice, usePrefersReducedMotion } from '../motion';

/**
 * Desktop-only low-contrast warm halo following the cursor calmly.
 * Disabled on touch/mobile devices and when prefers-reduced-motion is set.
 */
export const CursorGlow: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || isTouch) return;
    const el = glowRef.current;
    if (!el) return;

    let targetX = -400;
    let targetY = -400;
    let curX = -400;
    let curY = -400;
    let rafId = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      el.style.transform = `translate3d(${curX - 180}px, ${curY - 180}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [reduced, isTouch]);

  if (reduced || isTouch) return null;

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="fixed top-0 left-0 w-[360px] h-[360px] rounded-full pointer-events-none z-0 no-print"
      style={{
        background:
          'radial-gradient(circle, rgba(31, 138, 125, 0.08) 0%, rgba(122, 100, 92, 0.05) 45%, transparent 72%)',
        willChange: 'transform',
      }}
    />
  );
};
