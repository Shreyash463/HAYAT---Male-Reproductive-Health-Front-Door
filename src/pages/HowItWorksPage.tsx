import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal, DURATIONS, HAYAT_EASE, useDeviceCapabilities, usePrefersReducedMotion } from '../motion';
import {
  HelpCircle,
  ChevronDown,
  AlertTriangle,
  Heart,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface StepVisualProps {
  stepIndex: number;
  reduced: boolean;
}

const StepDiagram: React.FC<StepVisualProps> = ({ stepIndex, reduced }) => {
  return (
    <div className="w-full flex items-center justify-center p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)]">
      {stepIndex === 0 && (
        <svg viewBox="0 0 240 130" className="w-full max-w-[230px] h-auto" aria-hidden="true">
          <rect x="64" y="14" width="112" height="102" rx="16" fill="var(--card)" stroke="var(--accent)" strokeWidth="2" />
          <circle cx="120" cy="48" r="16" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.75" />
          <motion.path
            d="M 113 48 L 118 53 L 128 42"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, ease: HAYAT_EASE }}
          />
          <rect x="82" y="76" width="76" height="8" rx="4" fill="var(--brand-soft)" />
          <rect x="92" y="92" width="56" height="8" rx="4" fill="var(--gauge-track)" />
        </svg>
      )}
      {stepIndex === 1 && (
        <svg viewBox="0 0 240 130" className="w-full max-w-[230px] h-auto" aria-hidden="true">
          <rect x="26" y="24" width="58" height="32" rx="10" fill="var(--card)" stroke="var(--brand)" strokeWidth="1.75" />
          <rect x="26" y="72" width="58" height="32" rx="10" fill="var(--card)" stroke="var(--accent)" strokeWidth="1.75" />
          <motion.path
            d="M 84 40 L 126 65 M 84 88 L 126 65"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: HAYAT_EASE }}
          />
          <circle cx="164" cy="65" r="34" fill="var(--card)" stroke="var(--accent)" strokeWidth="2.2" />
          <text x="164" y="69" textAnchor="middle" fill="var(--accent-text)" fontSize="12" fontWeight="700">
            Rules
          </text>
        </svg>
      )}
      {stepIndex === 2 && (
        <svg viewBox="0 0 240 130" className="w-full max-w-[230px] h-auto" aria-hidden="true">
          <rect x="30" y="20" width="180" height="24" rx="8" fill="var(--card)" stroke="var(--border-strong)" strokeWidth="1.25" />
          <motion.rect
            x="38"
            y="28"
            height="8"
            rx="4"
            fill="var(--risk-mod)"
            initial={{ width: reduced ? 110 : 12 }}
            animate={{ width: 110 }}
            transition={{ duration: 0.55, ease: HAYAT_EASE }}
          />
          <rect x="30" y="54" width="180" height="24" rx="8" fill="var(--card)" stroke="var(--border-strong)" strokeWidth="1.25" />
          <motion.rect
            x="38"
            y="62"
            height="8"
            rx="4"
            fill="var(--risk-low)"
            initial={{ width: reduced ? 138 : 12 }}
            animate={{ width: 138 }}
            transition={{ duration: 0.65, ease: HAYAT_EASE }}
          />
          <rect x="30" y="88" width="180" height="24" rx="8" fill="var(--card)" stroke="var(--border-strong)" strokeWidth="1.25" />
          <motion.rect
            x="38"
            y="96"
            height="8"
            rx="4"
            fill="var(--accent)"
            initial={{ width: reduced ? 88 : 12 }}
            animate={{ width: 88 }}
            transition={{ duration: 0.5, ease: HAYAT_EASE }}
          />
        </svg>
      )}
      {stepIndex === 3 && (
        <svg viewBox="0 0 240 130" className="w-full max-w-[230px] h-auto" aria-hidden="true">
          {[32, 66, 100].map((y, idx) => (
            <g key={y}>
              <circle
                cx="64"
                cy={y}
                r="10"
                fill={idx === 1 ? 'var(--accent)' : 'var(--card)'}
                stroke={idx === 1 ? 'var(--accent)' : 'var(--border-strong)'}
                strokeWidth="2"
              />
              <rect
                x="88"
                y={y - 7}
                width={idx === 1 ? 116 : 92}
                height="14"
                rx="7"
                fill={idx === 1 ? 'var(--accent-soft)' : 'var(--card)'}
                stroke={idx === 1 ? 'var(--accent)' : 'var(--border-hairline)'}
                strokeWidth="1.25"
              />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
};

export const HowItWorksPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  const reduced = usePrefersReducedMotion();
  const { isMobileViewport, isCoarsePointer } = useDeviceCapabilities();
  const pinSectionRef = useRef<HTMLDivElement>(null);

  const shouldPinSteps = !reduced && !isMobileViewport && !isCoarsePointer;

  useEffect(() => {
    if (!shouldPinSteps || !pinSectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinSectionRef.current,
        start: 'top 14%',
        end: '+=1200',
        pin: true,
        scrub: 0.4,
        anticipatePin: 1,
        onUpdate: self => {
          const idx = Math.min(3, Math.floor(self.progress * 4));
          setActiveStep(idx);
        },
      });
    }, pinSectionRef);

    return () => ctx.revert();
  }, [shouldPinSteps]);

  const steps = [
    {
      num: '01',
      title: 'Private Intake',
      desc: 'Answer questions on lifestyle, journey, and symptoms anonymously on your device without login.',
      detail: 'Every question has a "Why we ask" explanation and can be skipped cleanly.',
    },
    {
      num: '02',
      title: 'Rule-Based Engine',
      desc: 'Transparent scoring informed by clinical guidelines surfaces modifiable factors and red flags.',
      detail: 'Deterministic rules compute signals right inside your browser with zero external calls.',
    },
    {
      num: '03',
      title: 'Explainable Guidance',
      desc: 'Plain-language breakdown showing exactly why each factor raised or lowered your screening score.',
      detail: 'Test potential lifestyle changes live with the interactive What-If explorer.',
    },
    {
      num: '04',
      title: 'Targeted Triage',
      desc: 'Calm guidance toward self-care, primary care, discreet teleconsultation, or urgent evaluation.',
      detail: 'Generate a printable summary for your clinician only if and when you choose.',
    },
  ];

  const ruleCategories = [
    { title: 'Conception Timeline', weight: 'High', desc: '12+ months actively trying triggers recommendation for concurrent partner & male evaluation.' },
    { title: 'Lifestyle & Heat Exposure', weight: 'High (Modifiable)', desc: 'Nicotine, alcohol, short sleep, high stress, and frequent heat exposure may raise oxidative stress.' },
    { title: 'Metabolic & Endocrine Balance', weight: 'Moderate', desc: 'BMI, waist concern, blood glucose, and thyroid balance are associated with hormone signaling.' },
    { title: 'Anatomical & Physical Signals', weight: 'High', desc: 'Vein heaviness (possible varicocele) or childhood history guide toward specialist physical exam.' },
    { title: 'Semen Analysis (WHO 2021)', weight: 'Direct Reference', desc: 'Compares optional lab values against 2021 WHO 6th edition lower reference limits.' },
  ];

  const faqs = [
    {
      q: 'Is HAYAT a medical diagnosis?',
      a: 'No. HAYAT is strictly a risk-screening and guidance tool. Only a qualified doctor with physical exam and laboratory testing can make a clinical diagnosis.',
    },
    {
      q: 'Who can see my data?',
      a: 'Only you. HAYAT does not ask for your name, phone number, or email. Answers stay in browser memory unless you clear them or save locally.',
    },
    {
      q: 'Why do you ask about lifestyle and sleep?',
      a: 'Sperm development takes roughly 72 to 90 days. Habits like sleep, cooling, stress, and nicotine avoidance can meaningfully support cellular quality.',
    },
    {
      q: 'What if I do not have semen test results?',
      a: 'You can skip that step completely. HAYAT provides an initial screening from your lifestyle, history, and symptoms alone.',
    },
    {
      q: 'How does the Quick Hide feature work?',
      a: 'Clicking Quick Hide, double-tapping the HAYAT logo, or pressing Esc immediately replaces the screen with a neutral wellness journal without losing your progress.',
    },
    {
      q: 'What are clinical red flags?',
      a: 'Red flags include sudden severe testicular pain, rapid swelling, fever with testicular ache, blood in semen, or a firm painless lump. These require same-day urgent medical evaluation.',
    },
    {
      q: 'Can partners complete this together?',
      a: 'Yes. Language is neutral and respectful, and can be used privately or together to prepare questions before a visit.',
    },
    {
      q: 'How does HAYAT protect cultural sensitivities?',
      a: 'Word choices avoid blame or assumptions, and full Arabic RTL and Hindi translations support accessibility across diverse backgrounds.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-10">
      {/* Header */}
      <Reveal>
        <div className="space-y-2.5 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-xs font-mono font-semibold border border-[var(--border-hairline)]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Operational Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[var(--text-main)]">
            How HAYAT Works &amp; Safety Boundaries
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            A transparent, rule-based screening system designed to lower stigma without sacrificing clinical clarity.
          </p>
        </div>
      </Reveal>

      {/* Pinned 4-step animated explainer on desktop, clean stacked cards on mobile/reduced motion */}
      {shouldPinSteps ? (
        <section ref={pinSectionRef} className="paper-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-text)] font-semibold">
              Step-by-Step Walkthrough (Scroll or Select)
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Step 0{activeStep + 1} / 04
            </span>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-2.5">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-start p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--accent-soft)] border-[var(--accent)] shadow-xs'
                        : 'bg-[var(--surface)] border-[var(--border-hairline)] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-xs font-mono font-bold text-[var(--accent-text)]">{step.num}</span>
                      <h2 className="font-heading font-bold text-base text-[var(--text-main)]">{step.title}</h2>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">{step.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="md:col-span-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: DURATIONS.fast, ease: HAYAT_EASE }}
                  className="surface-panel p-5 space-y-4"
                >
                  <StepDiagram stepIndex={activeStep} reduced={reduced} />
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-[var(--accent-text)]">
                      {steps[activeStep].num} • {steps[activeStep].title}
                    </span>
                    <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed">
                      {steps[activeStep].detail}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {steps.map((step, idx) => (
            <Reveal key={step.num} delay={idx * 0.05}>
              <div className="paper-card p-6 space-y-4 h-full">
                <StepDiagram stepIndex={idx} reduced={reduced} />
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-[var(--accent-text)] block">{step.num}</span>
                  <h2 className="font-heading font-bold text-base text-[var(--text-main)]">{step.title}</h2>
                  <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* Rule categories */}
      <Reveal delay={0.05}>
        <div className="paper-card p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[var(--text-main)]">
              Transparent Risk Rule Categories
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] mt-0.5">
              HAYAT uses deterministic, inspectable rules rather than opaque black-box models.
            </p>
          </div>

          <div className="space-y-3">
            {ruleCategories.map((cat, idx) => (
              <div key={idx} className="surface-panel p-4 sm:p-5 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-base font-bold text-[var(--text-main)]">{cat.title}</span>
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)]">
                    {cat.weight}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Compact Safety & Limits */}
      <Reveal delay={0.06}>
        <div
          className="paper-card p-6 sm:p-7 space-y-3.5 border-2"
          style={{
            backgroundColor: 'var(--risk-urg-bg)',
            borderColor: 'var(--risk-urg-border)',
          }}
        >
          <div className="flex items-center gap-2.5" style={{ color: 'var(--risk-urg)' }}>
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="text-lg font-bold font-heading">
              Safety and limits
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed">
            If you ever experience sudden severe testicular pain, rapid swelling, fever with groin ache, blood in semen, or a firm painless lump, do not wait for routine appointments. Seek same-day in-person medical evaluation.
          </p>

          <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border-hairline)] text-sm text-[var(--text-main)]">
            <strong className="text-[var(--brand)]">Human-in-the-loop boundary:</strong>{' '}
            Only licensed clinicians make diagnoses, order tests, or prescribe treatment.
          </div>
        </div>
      </Reveal>

      {/* Cultural respect */}
      <Reveal delay={0.07}>
        <div className="paper-card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-[var(--brand)]">
            <Heart className="w-5 h-5" />
            <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
              Cultural Respect &amp; Non-Stigmatising Design
            </h2>
          </div>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            Reproductive health can carry unnecessary shame or silence. HAYAT uses respectful, everyday language with full Arabic RTL and Hindi support so men can take a first step privately.
          </p>
        </div>
      </Reveal>

      {/* Smooth Height-Animated FAQ Accordion */}
      <Reveal delay={0.08}>
        <div className="paper-card p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold font-heading text-[var(--text-main)]">
            Frequently Asked Questions (FAQ)
          </h2>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-[var(--border-hairline)] rounded-2xl overflow-hidden bg-[var(--surface)]">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-start px-4 min-h-[52px] hover:bg-[var(--card-alt)] flex items-center justify-between gap-3 text-base font-semibold text-[var(--text-main)] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: reduced ? 0.05 : DURATIONS.fast, ease: HAYAT_EASE }}
                    >
                      <ChevronDown className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                        exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0.1 : DURATIONS.fast, ease: HAYAT_EASE }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 text-sm sm:text-base text-[var(--text-muted)] bg-[var(--card)] leading-relaxed border-t border-[var(--border-hairline)]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </div>
  );
};
