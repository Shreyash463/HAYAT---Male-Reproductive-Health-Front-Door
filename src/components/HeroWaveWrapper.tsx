import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../store/AppContext';
import { useDeviceCapabilities, usePrefersReducedMotion } from '../motion';

const LazyHeroDottedWave = React.lazy(() => import('./HeroDottedWave'));

const StaticWaveFallback: React.FC = () => {
  const dots = useMemo(() => {
    const pts: { cx: number; cy: number; r: number; o: number }[] = [];
    const cols = 42;
    const rows = 14;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / (cols - 1);
        const nz = r / (rows - 1);
        const wave =
          Math.sin(nx * Math.PI * 3.2) * 18 +
          Math.cos(nz * Math.PI * 2.1 + nx * 2.5) * 12;
        const cx = nx * 1200;
        const cy = 110 + nz * 210 + wave;
        const radius = 1.2 + nz * 1.1;
        const opacity = 0.14 + (1 - Math.abs(nz - 0.5) * 1.4) * 0.25;
        pts.push({ cx, cy, r: radius, o: Math.max(0.08, opacity) });
      }
    }
    return pts;
  }, []);

  return (
    <svg
      viewBox="0 0 1200 380"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill="var(--brand)"
          fillOpacity={d.o}
        />
      ))}
    </svg>
  );
};

function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export const HeroWaveWrapper: React.FC = () => {
  const { theme } = useApp();
  const reduced = usePrefersReducedMotion();
  const { isMobileViewport, isCoarsePointer } = useDeviceCapabilities();
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const isInViewRef = useRef(true);
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    const lowPower =
      typeof navigator !== 'undefined' &&
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency <= 2;

    if (!lowPower && detectWebGLSupport()) {
      setHasWebGL(true);
    }
  }, []);

  const canUseWebGL = hasWebGL && !reduced;

  // Pause WebGL wave when scrolled off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      entries => {
        isInViewRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!canUseWebGL) return;
    const handleMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, [canUseWebGL]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {canUseWebGL ? (
        <Suspense fallback={<StaticWaveFallback />}>
          <LazyHeroDottedWave
            theme={theme}
            pointerRef={pointerRef}
            isInViewRef={isInViewRef}
            isMobile={isMobileViewport || isCoarsePointer}
          />
        </Suspense>
      ) : (
        <StaticWaveFallback />
      )}
      <div
        className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, var(--bg-deep) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-16 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, transparent 0%, var(--bg-deep) 100%)',
        }}
      />
    </div>
  );
};
