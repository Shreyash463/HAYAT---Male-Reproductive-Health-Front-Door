import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, Heart, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { assess } from '../services/api';
import { assessRisk } from '../engine/riskEngine';
import { AssessmentResult } from '../types';
import { DURATIONS, HAYAT_EASE, useDeviceCapabilities, usePrefersReducedMotion } from '../motion';

interface ParticleDot {
  startX: number;
  startY: number;
  angle: number;
  radiusOffset: number;
  size: number;
  colorType: 'accent' | 'brand' | 'muted';
  phase: number;
}

export const AnalysingPage: React.FC = () => {
  const { answers, setResult, t } = useApp();
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const { isMobileViewport } = useDeviceCapabilities();

  const [activeMessageIndex, setActiveMessageIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const computedRef = useRef<AssessmentResult | null>(null);
  const navigatedRef = useRef(false);

  const messages = [
    { text: t.reassurance1, icon: ShieldCheck, color: 'var(--risk-mod)' },
    { text: t.reassurance2, icon: Heart, color: 'var(--accent-text)' },
    { text: t.reassurance3, icon: Sparkles, color: 'var(--brand)' },
  ];

  // Max duration: 2.3s (< 2.5s limit), 0.55s if reduced motion
  const TOTAL_DURATION_MS = reduced ? 550 : 2300;

  const finishAndNavigate = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    const finalResult = computedRef.current ?? assessRisk(answers);
    setResult(finalResult);
    navigate('/results');
  };

  useEffect(() => {
    let active = true;
    const startTime = performance.now();

    // Start async service assessment
    assess(answers).then(computed => {
      if (!active) return;
      computedRef.current = computed;
    });

    const msgInterval = setInterval(() => {
      setActiveMessageIndex(prev => (prev < messages.length - 1 ? prev + 1 : prev));
    }, Math.floor(TOTAL_DURATION_MS / 3));

    const progressInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      setProgressPct(Math.min(100, Math.round((elapsed / TOTAL_DURATION_MS) * 100)));
    }, 45);

    const endTimeout = setTimeout(() => {
      if (!active) return;
      finishAndNavigate();
    }, TOTAL_DURATION_MS);

    return () => {
      active = false;
      clearInterval(msgInterval);
      clearInterval(progressInterval);
      clearTimeout(endTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Signature scattered-dots-converging-into-ring-gauge Canvas2D sequence
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 196;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const dotCount = isMobileViewport ? 48 : 84;
    const center = size / 2;
    const targetRingRadius = 64;

    const dots: ParticleDot[] = Array.from({ length: dotCount }, (_, i) => {
      const angle = (i / dotCount) * Math.PI * 2;
      const scatterDist = 80 + (i % 5) * 8;
      const scatterAngle = angle + ((i % 7) - 3) * 0.42;
      return {
        startX: center + Math.cos(scatterAngle) * scatterDist,
        startY: center + Math.sin(scatterAngle) * scatterDist,
        angle,
        radiusOffset: ((i % 3) - 1) * 2.2,
        size: i % 4 === 0 ? 2.6 : 1.9,
        colorType: i % 3 === 0 ? 'accent' : i % 3 === 1 ? 'brand' : 'muted',
        phase: i * 0.3,
      };
    });

    const getThemeColor = (type: ParticleDot['colorType']) => {
      const styles = getComputedStyle(document.documentElement);
      if (type === 'accent') return styles.getPropertyValue('--accent').trim() || '#1F8A7D';
      if (type === 'brand') return styles.getPropertyValue('--brand').trim() || '#7A645C';
      return styles.getPropertyValue('--text-muted').trim() || '#6B5F57';
    };

    let rafId = 0;
    const start = performance.now();

    const draw = (now: number) => {
      if (document.hidden) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const elapsed = now - start;
      const rawT = Math.min(1, elapsed / (TOTAL_DURATION_MS - 250));
      // Smooth cubic-bezier(0.22, 1, 0.36, 1)-like easeOut
      const eased = 1 - Math.pow(1 - rawT, 3);

      ctx.clearRect(0, 0, size, size);

      // Subtle guide ring appearing as dots lock in
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, targetRingRadius, 0, Math.PI * 2);
      ctx.strokeStyle = getThemeColor('brand');
      ctx.globalAlpha = 0.14 * eased;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      const spinOffset = rawT * 0.65;

      for (const dot of dots) {
        const currentAngle = dot.angle + spinOffset;
        const targetX = center + Math.cos(currentAngle) * (targetRingRadius + dot.radiusOffset);
        const targetY = center + Math.sin(currentAngle) * (targetRingRadius + dot.radiusOffset);

        const x = dot.startX + (targetX - dot.startX) * eased;
        const y = dot.startY + (targetY - dot.startY) * eased;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = getThemeColor(dot.colorType);
        ctx.globalAlpha = 0.35 + 0.6 * eased;
        ctx.fill();
        ctx.restore();
      }

      if (rawT < 1 || elapsed < TOTAL_DURATION_MS) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [reduced, isMobileViewport, TOTAL_DURATION_MS]);

  const CurrentIcon = messages[activeMessageIndex].icon;

  return (
    <div className="min-h-[72vh] flex flex-col items-center justify-center px-4 text-center py-8">
      <div className="max-w-md w-full p-8 sm:p-10 paper-card space-y-6 relative overflow-hidden">
        {/* Signature scattered dots converging into ring gauge */}
        <div className="relative mx-auto w-[196px] h-[196px] flex items-center justify-center">
          {!reduced ? (
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          ) : (
            <svg
              viewBox="0 0 196 196"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <circle
                cx="98"
                cy="98"
                r="64"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeDasharray="6 6"
                opacity="0.55"
              />
            </svg>
          )}

          <div className="relative w-16 h-16 rounded-full bg-[var(--surface)] border border-[var(--border-strong)] flex items-center justify-center shadow-xs z-10">
            <CurrentIcon
              className="w-7 h-7 transition-colors duration-300"
              style={{ color: messages[activeMessageIndex].color }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-main)]">
            {t.analysingTitle}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)]">
            Applying transparent clinical guidelines in a private on-device session.
          </p>
        </div>

        {/* Cross-fading reassurance line */}
        <div className="min-h-[52px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMessageIndex}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={reduced ? { duration: 0.15 } : { duration: DURATIONS.fast, ease: HAYAT_EASE }}
              className="flex items-center gap-2 text-sm sm:text-base font-medium text-[var(--text-main)]"
            >
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
              <span>{messages[activeMessageIndex].text}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots + Skip link */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-center gap-2">
            {messages.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeMessageIndex ? 'w-7 bg-[var(--accent)]' : 'w-2 bg-[var(--gauge-track)]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-hairline)] text-xs font-mono text-[var(--text-muted)]">
            <span>{progressPct}%</span>
            <button
              type="button"
              onClick={finishAndNavigate}
              className="inline-flex items-center gap-1 text-sm font-sans font-semibold text-[var(--accent-text)] hover:underline cursor-pointer px-2 py-1 rounded-lg"
            >
              <span>{t.skipQuestion}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
