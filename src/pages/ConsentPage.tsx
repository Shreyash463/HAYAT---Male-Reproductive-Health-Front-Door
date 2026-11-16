import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { DURATIONS, HAYAT_EASE, Reveal, usePrefersReducedMotion } from '../motion';
import {
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';

interface AnimatedSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  labelId: string;
}

const AnimatedSwitch: React.FC<AnimatedSwitchProps> = ({ checked, onChange, labelId }) => {
  const reduced = usePrefersReducedMotion();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center cursor-pointer border ${
        checked
          ? 'bg-[var(--accent)] border-[var(--accent)] justify-end'
          : 'bg-[var(--card)] border-[var(--border-strong)] justify-start'
      }`}
    >
      <motion.span
        layout={!reduced}
        transition={reduced ? { duration: 0 } : { duration: DURATIONS.fast, ease: HAYAT_EASE }}
        className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center"
      >
        {checked && (
          <motion.span
            initial={reduced ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: HAYAT_EASE }}
          >
            <Check className="w-3.5 h-3.5 text-[var(--accent-text)] stroke-[2.8]" />
          </motion.span>
        )}
      </motion.span>
    </button>
  );
};

export const ConsentPage: React.FC = () => {
  const { t, consent, updateConsent } = useApp();
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();

  const handleContinue = () => {
    if (!consent.processAnswers) return;
    navigate('/check');
  };

  const permissionItems = [
    {
      key: 'processAnswers' as const,
      title: t.consentOpt1,
      sub: 'Required to compute your on-device screening',
      required: true,
    },
    {
      key: 'saveOnDevice' as const,
      title: t.consentOpt2,
      sub: "Stored only inside your browser's local cache. Clear anytime with one click.",
      required: false,
    },
    {
      key: 'shareAnonymisedResearch' as const,
      title: t.consentOpt3,
      sub: 'Aggregated, non-identifiable metrics to check algorithmic fairness across groups.',
      required: false,
    },
    {
      key: 'createClinicianSummary' as const,
      title: t.consentOpt4,
      sub: 'Prepares a printable PDF summary if you choose to bring one to an appointment.',
      required: false,
    },
    {
      key: 'useAiExplanation' as const,
      title: t.consentOptAi,
      sub: 'Sends non-identifying risk category tags to AI for simpler, plain-language wording. Default: Off.',
      required: false,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header + Animated Device Containment SVG Explainer */}
      <Reveal className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-xs font-mono font-semibold border border-[var(--border-hairline)]">
          <Lock className="w-3.5 h-3.5" />
          <span>Privacy By Design</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[var(--text-main)]">
          {t.consentTitle}
        </h1>
        <p className="text-base text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
          {t.consentSub}
        </p>

        {/* Animated Device + Shield + Stay-on-Device Arrows SVG Illustration */}
        <div className="mx-auto max-w-sm pt-2">
          <div className="surface-panel p-4 flex items-center justify-center gap-4">
            <svg
              viewBox="0 0 220 96"
              className="w-56 h-24 overflow-visible"
              aria-label="Illustration showing health answers processed inside your device shield"
            >
              {/* Outer Phone Frame */}
              <motion.rect
                x="76"
                y="8"
                width="68"
                height="80"
                rx="12"
                fill="var(--card)"
                stroke="var(--brand)"
                strokeWidth="2.2"
                initial={reduced ? false : { pathLength: 0, opacity: 0.4 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.55, ease: HAYAT_EASE }}
              />
              {/* Phone Screen Top Bar */}
              <line x1="100" y1="16" x2="120" y2="16" stroke="var(--border-strong)" strokeWidth="2.2" strokeLinecap="round" />

              {/* Shield Inside Device */}
              <motion.path
                d="M110 28 L124 34 V48 C124 58 117.5 65 110 68 C102.5 65 96 58 96 48 V34 Z"
                fill="var(--accent-soft)"
                stroke="var(--accent)"
                strokeWidth="2.2"
                strokeLinejoin="round"
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.18, ease: HAYAT_EASE }}
              />
              {/* Checkmark inside Shield */}
              <motion.path
                d="M104 48 L108.5 52.5 L117 43.5"
                fill="none"
                stroke="var(--accent-text)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.35, delay: 0.45, ease: HAYAT_EASE }}
              />

              {/* Left Loop Arrow (Answers stay inside device) */}
              <motion.path
                d="M66 60 C34 60 34 34 68 34"
                fill="none"
                stroke="var(--accent-text)"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.25, ease: HAYAT_EASE }}
              />
              <motion.path
                d="M62 29 L69 34 L62 39"
                fill="none"
                stroke="var(--accent-text)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.25, delay: 0.55 }}
              />

              {/* Right Loop Arrow */}
              <motion.path
                d="M154 34 C186 34 186 60 152 60"
                fill="none"
                stroke="var(--accent-text)"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.25, ease: HAYAT_EASE }}
              />
              <motion.path
                d="M158 55 L151 60 L158 65"
                fill="none"
                stroke="var(--accent-text)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.25, delay: 0.55 }}
              />
            </svg>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 font-medium">
            Your answers stay protected inside this device&apos;s browser memory
          </p>
        </div>
      </Reveal>

      {/* Comparison Cards */}
      <Reveal delay={0.08}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="paper-card p-6 space-y-3 border-t-4" style={{ borderTopColor: 'var(--accent)' }}>
            <div className="flex items-center gap-2 text-[var(--accent-text)]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h2 className="font-heading font-bold text-sm tracking-wide uppercase">
                {t.whatWeDo}
              </h2>
            </div>
            <ul className="space-y-2.5 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-text)] font-bold mt-0.5">•</span>
                <span>{t.whatWeDo1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-text)] font-bold mt-0.5">•</span>
                <span>{t.whatWeDo2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-text)] font-bold mt-0.5">•</span>
                <span>{t.whatWeDo3}</span>
              </li>
            </ul>
          </div>

          <div className="paper-card p-6 space-y-3 border-t-4" style={{ borderTopColor: 'var(--risk-urg)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--risk-urg)' }}>
              <XCircle className="w-5 h-5 shrink-0" />
              <h2 className="font-heading font-bold text-sm tracking-wide uppercase">
                {t.whatWeNeverDo}
              </h2>
            </div>
            <ul className="space-y-2.5 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              <li className="flex items-start gap-2">
                <span style={{ color: 'var(--risk-urg)' }} className="font-bold mt-0.5">•</span>
                <span>{t.whatWeNever1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: 'var(--risk-urg)' }} className="font-bold mt-0.5">•</span>
                <span>{t.whatWeNever2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: 'var(--risk-urg)' }} className="font-bold mt-0.5">•</span>
                <span>{t.whatWeNever3}</span>
              </li>
            </ul>
          </div>
        </div>
      </Reveal>

      {/* Granular Consent Animated Switches */}
      <Reveal delay={0.12}>
        <div className="paper-card p-6 sm:p-8 space-y-5">
          <h3 className="font-heading font-bold text-lg text-[var(--text-main)]">
            Select your data permissions:
          </h3>

          <div className="space-y-3">
            {permissionItems.map(item => {
              const checked = consent[item.key];
              const labelId = `consent-label-${item.key}`;
              return (
                <div
                  key={item.key}
                  onClick={() => updateConsent({ [item.key]: !checked })}
                  className={`flex items-center justify-between gap-4 p-4 min-h-[60px] rounded-2xl border cursor-pointer transition-colors ${
                    checked
                      ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                      : 'bg-[var(--surface)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div id={labelId} className="text-sm sm:text-base">
                    <span className="font-semibold text-[var(--text-main)] block">
                      {item.title}
                    </span>
                    <span
                      className={`text-xs sm:text-sm mt-0.5 block ${
                        item.required ? 'text-[var(--accent-text)] font-medium' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {item.sub}
                    </span>
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <AnimatedSwitch
                      checked={checked}
                      onChange={val => updateConsent({ [item.key]: val })}
                      labelId={labelId}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-[var(--card-alt)] border border-[var(--border-hairline)] flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
            <Info className="w-4 h-4 text-[var(--brand)] shrink-0 mt-1" />
            <span>{t.dataMinimisationNote}</span>
          </div>
        </div>
      </Reveal>

      {/* Continue Bar with animated disabled -> enabled button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <span className="text-xs sm:text-sm text-[var(--text-muted)] font-mono">
          {consent.timestamp ? `Recorded: ${new Date(consent.timestamp).toLocaleTimeString()}` : ''}
        </span>

        <motion.button
          type="button"
          onClick={handleContinue}
          disabled={!consent.processAnswers}
          animate={{
            scale: consent.processAnswers ? 1 : 0.985,
            opacity: consent.processAnswers ? 1 : 0.6,
          }}
          whileTap={consent.processAnswers && !reduced ? { scale: 0.98 } : undefined}
          transition={reduced ? { duration: 0 } : { duration: DURATIONS.fast, ease: HAYAT_EASE }}
          className={`w-full sm:w-auto px-8 min-h-[52px] rounded-2xl font-heading font-semibold text-base flex items-center justify-center gap-2 transition-colors ${
            consent.processAnswers
              ? 'bg-[var(--accent)] text-white shadow-sm cursor-pointer hover:opacity-95'
              : 'bg-[var(--brand-soft)] text-[var(--text-muted)] cursor-not-allowed'
          }`}
        >
          <span>{t.btnUnderstandContinue}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </motion.button>
      </div>
    </div>
  );
};
