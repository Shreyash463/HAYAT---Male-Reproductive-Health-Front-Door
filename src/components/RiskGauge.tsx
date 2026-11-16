import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Info, AlertCircle, AlertTriangle } from 'lucide-react';
import { RiskBand } from '../types';
import { HAYAT_EASE, usePrefersReducedMotion } from '../motion';

interface RiskGaugeProps {
  score: number;
  band: RiskBand;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, band, size = 210 }) => {
  const reduced = usePrefersReducedMotion();
  const [displayScore, setDisplayScore] = useState(reduced ? score : 0);

  useEffect(() => {
    if (reduced) {
      setDisplayScore(score);
      return;
    }

    let rafId = 0;
    const duration = 680;
    const startVal = displayScore;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3.2);
      setDisplayScore(Math.round(startVal + (score - startVal) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [score, reduced]);

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(4, score));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  const bandMeta: Record<
    RiskBand,
    { stroke: string; bg: string; border: string; Icon: React.ElementType; label: string }
  > = {
    Low: {
      stroke: 'var(--risk-low)',
      bg: 'var(--risk-low-bg)',
      border: 'var(--risk-low-border)',
      Icon: ShieldCheck,
      label: 'Low Band',
    },
    Moderate: {
      stroke: 'var(--risk-mod)',
      bg: 'var(--risk-mod-bg)',
      border: 'var(--risk-mod-border)',
      Icon: Info,
      label: 'Moderate Band',
    },
    Elevated: {
      stroke: 'var(--risk-elev)',
      bg: 'var(--risk-elev-bg)',
      border: 'var(--risk-elev-border)',
      Icon: AlertCircle,
      label: 'Elevated Band',
    },
    Urgent: {
      stroke: 'var(--risk-urg)',
      bg: 'var(--risk-urg-bg)',
      border: 'var(--risk-urg-border)',
      Icon: AlertTriangle,
      label: 'Urgent Band',
    },
  };

  const meta = bandMeta[band];
  const BandIcon = meta.Icon;

  return (
    <div
      className="relative flex flex-col items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      aria-label={`${meta.label}, Signal ${score} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--gauge-track)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={meta.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduced ? strokeDashoffset : circumference }}
          animate={{ strokeDashoffset }}
          transition={reduced ? { duration: 0 } : { duration: 0.7, ease: HAYAT_EASE }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5">
        <div
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 border"
          style={{
            color: meta.stroke,
            backgroundColor: meta.bg,
            borderColor: meta.border,
          }}
        >
          <BandIcon className="w-3.5 h-3.5 shrink-0" />
          <span>{band}</span>
        </div>
        <span className="text-3xl font-extrabold font-heading text-[var(--text-main)] tabular-nums leading-none mt-1">
          {displayScore}
          <span className="text-sm font-medium text-[var(--text-muted)]">/100</span>
        </span>
        <span className="text-xs font-mono text-[var(--text-muted)] mt-1">
          Signal Index
        </span>
      </div>
    </div>
  );
};
