import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useDeviceCapabilities, usePrefersReducedMotion } from '../motion';
import { RiskBand } from '../types';

function getRgbForContext(
  pathname: string,
  band: RiskBand | undefined,
  theme: 'light' | 'dark'
): [number, number, number] {
  if (pathname === '/results' && band) {
    if (band === 'Low') return theme === 'dark' ? [74, 222, 128] : [29, 122, 82];
    if (band === 'Moderate') return theme === 'dark' ? [251, 191, 36] : [154, 91, 6];
    if (band === 'Elevated') return theme === 'dark' ? [251, 146, 60] : [180, 75, 24];
    if (band === 'Urgent') return theme === 'dark' ? [248, 113, 113] : [180, 35, 35];
  }
  if (pathname.startsWith('/privacy') || pathname.startsWith('/consent')) {
    return theme === 'dark' ? [58, 180, 165] : [31, 138, 125];
  }
  if (pathname.startsWith('/care')) {
    return theme === 'dark' ? [96, 178, 165] : [45, 124, 114];
  }
  if (pathname.startsWith('/evidence')) {
    return theme === 'dark' ? [168, 152, 145] : [110, 94, 88];
  }
  // Default warm brand taupe
  return theme === 'dark' ? [196, 174, 165] : [122, 100, 92];
}

export const AmbientWaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pathname } = useLocation();
  const { theme, result } = useApp();
  const reduced = usePrefersReducedMotion();
  const { isMobileViewport, isCoarsePointer } = useDeviceCapabilities();

  const targetRgbRef = useRef<[number, number, number]>(
    getRgbForContext(pathname, result?.band, theme)
  );
  const currentRgbRef = useRef<[number, number, number]>([...targetRgbRef.current]);

  useEffect(() => {
    targetRgbRef.current = getRgbForContext(pathname, result?.band, theme);
  }, [pathname, result?.band, theme]);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let lastDraw = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const lightweight = isMobileViewport || isCoarsePointer;
    const cols = lightweight ? 18 : 34;
    const rows = lightweight ? 8 : 14;
    const frameInterval = lightweight ? 42 : 28; // ~24fps mobile, ~35fps desktop

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let t = 0;
    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);
      if (document.hidden || now - lastDraw < frameInterval) return;
      const dt = Math.min((now - lastDraw) / 1000 || 0.03, 0.08);
      lastDraw = now;
      t += dt * 0.45;

      // Smoothly interpolate color shift
      const cur = currentRgbRef.current;
      const tgt = targetRgbRef.current;
      cur[0] += (tgt[0] - cur[0]) * 0.05;
      cur[1] += (tgt[1] - cur[1]) * 0.05;
      cur[2] += (tgt[2] - cur[2]) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const baseOpacity = theme === 'dark' ? 0.14 : 0.16;
      ctx.fillStyle = `rgba(${Math.round(cur[0])}, ${Math.round(cur[1])}, ${Math.round(cur[2])}, ${baseOpacity})`;

      for (let r = 0; r < rows; r++) {
        const yNorm = r / (rows - 1);
        const yBase = height * (0.22 + yNorm * 0.68);
        for (let c = 0; c < cols; c++) {
          const xNorm = c / (cols - 1);
          const x = xNorm * width;
          const wave =
            Math.sin(xNorm * Math.PI * 2.5 + t + r * 0.35) * 14 +
            Math.cos(yNorm * Math.PI * 2 + t * 0.7) * 8;
          const radius = 1.2 + Math.sin(xNorm * Math.PI + t * 0.5) * 0.4;
          ctx.beginPath();
          ctx.arc(x, yBase + wave, Math.max(0.8, radius), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [reduced, theme, isMobileViewport, isCoarsePointer]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 w-full h-full z-0"
    />
  );
};
