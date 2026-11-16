import React from 'react';
import { motion } from 'framer-motion';
import { TriageLevel } from '../types';
import { ChevronRight, UserCheck, MapPin, ShieldCheck, Info, Stethoscope, Building2, AlertTriangle } from 'lucide-react';
import { DURATIONS, HAYAT_EASE, usePrefersReducedMotion } from '../motion';

interface TriageLadderProps {
  currentLevel: TriageLevel;
  reason: string;
}

const levels: { level: TriageLevel; title: string; subtitle: string; Icon: React.ElementType }[] = [
  {
    level: 'Self-care',
    title: 'Level 1: Self-Care & Lifestyle',
    subtitle: 'Targeted nutrition, sleep, cooling, and routine monitoring',
    Icon: ShieldCheck,
  },
  {
    level: 'Primary care',
    title: 'Level 2: Primary Care Physician',
    subtitle: 'General GP assessment, metabolic baseline, routine lab tests',
    Icon: Info,
  },
  {
    level: 'Andrology/Urology',
    title: 'Level 3: Andrology / Specialist Urology',
    subtitle: 'Physical exam, scrotal ultrasound Doppler, endocrine workup',
    Icon: Stethoscope,
  },
  {
    level: 'Fertility service',
    title: 'Level 4: Reproductive Fertility Medicine',
    subtitle: 'Comprehensive couples evaluation and advanced andrology',
    Icon: Building2,
  },
  {
    level: 'Urgent assessment',
    title: 'Level 5: Urgent Medical Assessment',
    subtitle: 'Same-day evaluation for acute pain, infection, or swelling',
    Icon: AlertTriangle,
  },
];

export const TriageLadder: React.FC<TriageLadderProps> = ({ currentLevel, reason }) => {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="paper-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading font-bold text-lg sm:text-xl text-[var(--text-main)]">
            Clinical Triage Pathway
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Five structured levels showing where your screening points today.
          </p>
        </div>
        <span
          className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full border"
          style={{
            color: currentLevel === 'Urgent assessment' ? 'var(--risk-urg)' : 'var(--accent-text)',
            backgroundColor: currentLevel === 'Urgent assessment' ? 'var(--risk-urg-bg)' : 'var(--accent-soft)',
            borderColor: currentLevel === 'Urgent assessment' ? 'var(--risk-urg-border)' : 'var(--border-hairline)',
          }}
        >
          Recommended: {currentLevel}
        </span>
      </div>

      {/* Vertical Connected PathDraw Ladder */}
      <div className="relative space-y-3">
        {/* Continuous vertical spine drawn via SVG pathLength */}
        <svg
          className="hidden sm:block absolute start-4 top-6 bottom-6 w-2 h-[calc(100%-3rem)] pointer-events-none"
          viewBox="0 0 8 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            x1="4"
            y1="0"
            x2="4"
            y2="400"
            stroke="var(--border-hairline)"
            strokeWidth="2"
          />
          <motion.line
            x1="4"
            y1="0"
            x2="4"
            y2="400"
            stroke={currentLevel === 'Urgent assessment' ? 'var(--risk-urg)' : 'var(--accent)'}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={reduced ? { duration: 0 } : { duration: DURATIONS.slow, ease: HAYAT_EASE }}
          />
        </svg>

        {levels.map((item, idx) => {
          const isSelected = item.level === currentLevel;
          const isUrgentLevel = item.level === 'Urgent assessment';
          const StepIcon = item.Icon;

          return (
            <div key={item.level} className="relative flex gap-3 sm:gap-4 items-stretch">
              <div className="flex flex-col items-center shrink-0 pt-3 z-10">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors"
                  style={
                    isSelected
                      ? {
                          backgroundColor: isUrgentLevel ? 'var(--risk-urg)' : 'var(--accent)',
                          borderColor: isUrgentLevel ? 'var(--risk-urg)' : 'var(--accent)',
                          color: '#FFFFFF',
                        }
                      : {
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border-strong)',
                          color: 'var(--text-muted)',
                        }
                  }
                >
                  {idx + 1}
                </div>
              </div>

              <div
                className={`flex-1 p-4 sm:p-5 rounded-2xl border transition-all ${
                  isSelected ? 'shadow-sm' : 'opacity-75'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: isUrgentLevel ? 'var(--risk-urg-bg)' : 'var(--accent-soft)',
                        borderColor: isUrgentLevel ? 'var(--risk-urg-border)' : 'var(--accent)',
                      }
                    : {
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border-hairline)',
                      }
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <StepIcon
                      className="w-4 h-4 mt-1 shrink-0"
                      style={{
                        color: isSelected
                          ? isUrgentLevel
                            ? 'var(--risk-urg)'
                            : 'var(--accent-text)'
                          : 'var(--text-muted)',
                      }}
                    />
                    <div>
                      <h4 className="text-base font-bold text-[var(--text-main)] leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <motion.span
                      animate={
                        reduced
                          ? undefined
                          : { scale: [1, 1.04, 1], opacity: [0.95, 1, 0.95] }
                      }
                      transition={
                        reduced
                          ? undefined
                          : { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }
                      }
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white shrink-0"
                      style={{ backgroundColor: isUrgentLevel ? 'var(--risk-urg)' : 'var(--accent-text)' }}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>You are here</span>
                    </motion.span>
                  )}
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-hairline)] text-sm sm:text-base text-[var(--text-main)] flex items-start gap-2">
                    <ChevronRight
                      className="w-4 h-4 shrink-0 mt-1 rtl:rotate-180"
                      style={{ color: isUrgentLevel ? 'var(--risk-urg)' : 'var(--accent-text)' }}
                    />
                    <p className="leading-relaxed">
                      <strong>Why this level:</strong> {reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl surface-panel text-sm text-[var(--text-muted)] flex items-start gap-3">
        <UserCheck className="w-5 h-5 text-[var(--brand)] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[var(--text-main)]">Clinical boundaries & Human Oversight:</strong> All decisions regarding physical examinations, prescription therapies, or diagnostic procedures are made exclusively by licensed human healthcare professionals. HAYAT provides decision-support routing only.
        </p>
      </div>
    </div>
  );
};
