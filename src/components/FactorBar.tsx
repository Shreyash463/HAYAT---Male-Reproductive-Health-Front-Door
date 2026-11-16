import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RiskFactor } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, ChevronDown, ChevronUp, RefreshCw, Lock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { DURATIONS, HAYAT_EASE, usePrefersReducedMotion } from '../motion';

interface FactorBarProps {
  factor: RiskFactor;
  detailed: boolean;
  index?: number;
}

export const FactorBar: React.FC<FactorBarProps> = ({ factor, detailed, index = 0 }) => {
  const { t } = useApp();
  const [expanded, setExpanded] = useState(false);
  const reduced = usePrefersReducedMotion();

  const isRaises = factor.direction === 'raises';
  const isLowers = factor.direction === 'lowers';

  const barWidth = Math.min(100, Math.max(12, Math.abs(factor.weight) * 3));

  const directionColor = isRaises
    ? 'var(--risk-elev)'
    : isLowers
    ? 'var(--risk-low)'
    : 'var(--text-muted)';

  const directionBg = isRaises
    ? 'var(--risk-elev-bg)'
    : isLowers
    ? 'var(--risk-low-bg)'
    : 'var(--brand-soft)';

  const directionBorder = isRaises
    ? 'var(--risk-elev-border)'
    : isLowers
    ? 'var(--risk-low-border)'
    : 'var(--border-hairline)';

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={
        reduced
          ? { duration: 0.18 }
          : { duration: DURATIONS.base, delay: Math.min(index * 0.07, 0.35), ease: HAYAT_EASE }
      }
      className="surface-panel p-4 sm:p-5 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5"
            style={{
              color: directionColor,
              backgroundColor: directionBg,
              borderColor: directionBorder,
            }}
            aria-hidden="true"
          >
            {isRaises && <ArrowUpRight className="w-4 h-4" />}
            {isLowers && <ArrowDownRight className="w-4 h-4" />}
            {!isRaises && !isLowers && <Minus className="w-4 h-4" />}
          </div>

          <div>
            <h4 className="text-base font-semibold text-[var(--text-main)] leading-snug">
              {factor.label}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-xs sm:text-sm text-[var(--text-muted)]">
                Your input: <strong className="text-[var(--text-main)] font-semibold">{factor.userValue}</strong>
              </span>

              <span
                className="text-xs px-2.5 py-0.5 rounded-full border font-medium inline-flex items-center gap-1"
                style={{
                  color: factor.modifiable ? 'var(--accent-text)' : 'var(--text-muted)',
                  backgroundColor: factor.modifiable ? 'var(--accent-soft)' : 'var(--brand-soft)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                {factor.modifiable ? (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    <span>{t.canChange}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>{t.cannotChange}</span>
                  </>
                )}
              </span>

              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ color: directionColor, backgroundColor: directionBg }}
              >
                {isRaises ? t.raisesRisk : isLowers ? t.lowersRisk : t.neutralRisk}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--brand-soft)] rounded-xl transition-colors shrink-0 cursor-pointer"
          aria-label={expanded ? 'Hide explanation' : 'Show explanation'}
          aria-expanded={detailed || expanded}
        >
          {detailed || expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--gauge-track)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: directionColor }}
          initial={{ width: reduced ? `${barWidth}%` : '0%' }}
          whileInView={{ width: `${barWidth}%` }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { duration: DURATIONS.slow, ease: HAYAT_EASE }}
        />
      </div>

      {(detailed || expanded) && (
        <div className="pt-2.5 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-hairline)]">
          <p>{factor.explanation}</p>
        </div>
      )}
    </motion.div>
  );
};
