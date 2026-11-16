import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../store/AppContext';
import { DEMO_PERSONAS } from '../data/personas';
import { assessRisk } from '../engine/riskEngine';
import { HeroWaveWrapper } from '../components/HeroWaveWrapper';
import {
  Reveal,
  SplitText,
  Magnetic,
  TiltCard,
  DURATIONS,
  HAYAT_EASE,
  usePrefersReducedMotion,
  useDeviceCapabilities,
} from '../motion';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Sparkles,
  Clock,
  HeartHandshake,
  Activity,
  FileCheck,
  ChevronRight,
  HelpCircle,
  Stethoscope,
  AlertTriangle,
  Info,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const { t, language, setAllAnswers, setResult, updateConsent } = useApp();
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const { isMobileViewport, isCoarsePointer } = useDeviceCapabilities();

  const pinSectionRef = useRef<HTMLDivElement>(null);
  const longBarRef = useRef<HTMLDivElement>(null);
  const shortBarRef = useRef<HTMLDivElement>(null);
  const [activeBeat, setActiveBeat] = useState(0);

  const shouldPinStory = !reduced && !isMobileViewport && !isCoarsePointer;

  // GSAP ScrollTrigger pinned 4-beat story (desktop only; clean stacked fallback on mobile / reduced motion)
  useEffect(() => {
    if (!shouldPinStory || !pinSectionRef.current) {
      setActiveBeat(3);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSectionRef.current,
          start: 'top 14%',
          end: '+=1500',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: self => {
            const p = self.progress;
            if (p < 0.22) setActiveBeat(0);
            else if (p < 0.52) setActiveBeat(1);
            else if (p < 0.82) setActiveBeat(2);
            else setActiveBeat(3);
          },
        },
      });

      if (longBarRef.current) {
        tl.fromTo(
          longBarRef.current,
          { scaleX: 0.12 },
          { scaleX: 1, duration: 0.45, ease: 'power2.out' },
          0.15
        );
      }

      if (shortBarRef.current) {
        tl.fromTo(
          shortBarRef.current,
          { scaleX: 0.92, opacity: 0.5 },
          { scaleX: 0.32, opacity: 1, duration: 0.45, ease: 'power2.out' },
          0.55
        );
      }
    }, pinSectionRef);

    return () => ctx.revert();
  }, [shouldPinStory]);

  const handleLaunchDemo = (personaId: 'low' | 'moderate' | 'urgent') => {
    const persona = DEMO_PERSONAS.find(p => p.id === personaId);
    if (!persona) return;

    updateConsent({ processAnswers: true, createClinicianSummary: true });
    setAllAnswers(persona.answers);
    const computedResult = assessRisk(persona.answers);
    setResult(computedResult);
    navigate('/results');
  };

  const heroSegments =
    language === 'en'
      ? [
          { text: 'A ' },
          {
            text: 'private first step',
            className: 'font-serif-accent italic font-normal text-[var(--brand)]',
          },
          { text: " for men's reproductive health." },
        ]
      : [{ text: t.heroTitle }];

  const trustPills = [
    { icon: Lock, text: t.trustNoAccount, tone: 'text-[var(--accent-text)]' },
    { icon: ShieldCheck, text: t.trustDataControl, tone: 'text-[var(--text-main)]', iconTone: 'text-[var(--brand)]' },
    { icon: Sparkles, text: t.trustExplainable, tone: 'text-[var(--accent-text)]' },
  ];

  const beats = [
    {
      num: '01',
      title: 'Today: men often enter the fertility pathway late',
      desc: 'Many men wait months or years before a simple first check, delaying modifiable lifestyle or medical steps.',
    },
    {
      num: '02',
      title: 'Long wait before first answers',
      desc: 'Without a calm starting point, navigating appointments and stigma often takes ~7.5 months (illustrative / simulated).',
    },
    {
      num: '03',
      title: 'With a private first step',
      desc: 'Checking in privately from home highlights next steps earlier—narrowing the path to ~2.4 months (illustrative / simulated).',
    },
    {
      num: '04',
      title: 'Start on your own terms',
      desc: 'Anonymous, explainable, and in your control from the very first tap.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Full-Width Hero with WebGL / Static Dotted Wave */}
      <section className="relative w-full min-h-[540px] sm:min-h-[600px] flex items-center justify-center py-16 sm:py-24 px-4 overflow-hidden">
        <HeroWaveWrapper />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Staggered Trust Pills */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-full bg-[var(--card)]/90 border border-[var(--border-hairline)] shadow-xs text-xs sm:text-sm text-[var(--text-muted)]">
            {trustPills.map((pill, idx) => {
              const PillIcon = pill.icon;
              return (
                <React.Fragment key={pill.text}>
                  {idx > 0 && (
                    <span className="text-[var(--border-strong)]" aria-hidden="true">
                      •
                    </span>
                  )}
                  <motion.span
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduced
                        ? { duration: 0.2 }
                        : { duration: DURATIONS.base, delay: 0.08 * idx, ease: HAYAT_EASE }
                    }
                    className={`flex items-center gap-1.5 font-medium ${pill.tone}`}
                  >
                    <PillIcon className={`w-3.5 h-3.5 shrink-0 ${pill.iconTone || ''}`} />
                    <span>{pill.text}</span>
                  </motion.span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Line/word reveal hero headline with accessible SR text */}
          <SplitText
            as="h1"
            segments={heroSegments}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-main)] font-heading leading-[1.12] max-w-3xl mx-auto"
          />

          <motion.p
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0.2 }
                : { duration: DURATIONS.base, delay: 0.22, ease: HAYAT_EASE }
            }
            className="text-base sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {t.heroSub}
          </motion.p>

          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0.2 }
                : { duration: DURATIONS.base, delay: 0.3, ease: HAYAT_EASE }
            }
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Magnetic className="w-full sm:w-auto">
              <Link
                to="/consent"
                className="w-full sm:w-auto px-8 min-h-[52px] rounded-2xl font-heading font-semibold text-base
                           bg-[var(--accent)] text-white shadow-sm hover:opacity-95 active:scale-[0.985]
                           transition-all flex items-center justify-center gap-2 group"
              >
                <span>{t.startCheck}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 rtl:rotate-180 transition-transform" />
              </Link>
            </Magnetic>

            <Magnetic className="w-full sm:w-auto">
              <Link
                to="/how-it-works"
                className="w-full sm:w-auto px-6 min-h-[52px] rounded-2xl font-heading font-medium text-base
                           bg-[var(--card)] text-[var(--text-main)] border border-[var(--border-strong)]
                           hover:bg-[var(--surface)] active:scale-[0.985] transition-all flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-[var(--brand)]" />
                <span>{t.howItWorks}</span>
              </Link>
            </Magnetic>
          </motion.div>
        </div>
      </section>

      {/* PINNED 4-BEAT SCROLL STORY (GSAP ScrollTrigger on desktop, clean stacked fallback on mobile/reduced-motion) */}
      <section className="max-w-5xl mx-auto px-4">
        <div ref={pinSectionRef} className="paper-card p-6 sm:p-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-text)] font-semibold">
                Why timing matters · 4-step story
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-main)] mt-1">
                From silent delay to a calm first step
              </h2>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border-hairline)] text-[var(--text-muted)]">
              Illustrative / simulated timelines
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left: 4 Beats List */}
            <div className="lg:col-span-6 space-y-3">
              {beats.map((beat, idx) => {
                const isActive = !shouldPinStory || activeBeat === idx;
                const isPast = shouldPinStory && activeBeat > idx;

                return (
                  <div
                    key={beat.num}
                    className={`p-4 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                        : isPast
                        ? 'bg-[var(--surface)] border-[var(--border-hairline)] opacity-85'
                        : 'bg-[var(--surface)] border-[var(--border-hairline)] opacity-55'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg mt-0.5 shrink-0 ${
                          isActive
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border-hairline)]'
                        }`}
                      >
                        {beat.num}
                      </span>
                      <div>
                        <h3 className="font-heading font-bold text-base text-[var(--text-main)]">
                          {beat.title}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                          {beat.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Timeline Compression Visual + Beat 4 CTA */}
            <div className="lg:col-span-6 space-y-6">
              <div className="surface-panel p-6 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[var(--text-main)]">
                      Typical entry without front door
                    </span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      ~7.5 months (illustrative / simulated)
                    </span>
                  </div>
                  <div className="h-3.5 w-full rounded-full overflow-hidden bg-[var(--gauge-track)]">
                    <div
                      ref={longBarRef}
                      className="h-full rounded-full origin-left rtl:origin-right"
                      style={{
                        backgroundColor: 'var(--brand)',
                        width: '100%',
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[var(--accent-text)]">
                      With HAYAT private first step
                    </span>
                    <span className="font-mono text-xs font-semibold text-[var(--accent-text)]">
                      ~2.4 months (illustrative / simulated)
                    </span>
                  </div>
                  <div className="h-3.5 w-full rounded-full overflow-hidden bg-[var(--gauge-track)]">
                    <div
                      ref={shortBarRef}
                      className="h-full rounded-full origin-left rtl:origin-right"
                      style={{
                        backgroundColor: 'var(--accent)',
                        width: shouldPinStory ? '100%' : '32%',
                      }}
                    />
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] pt-1">
                  Illustrative / simulated values for design demonstration only; individual clinical timelines vary.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)]">
                <div>
                  <span className="font-heading font-bold text-base text-[var(--text-main)] block">
                    Ready when you are
                  </span>
                  <span className="text-sm text-[var(--text-muted)]">
                    No account. Under 4 minutes.
                  </span>
                </div>
                <Link
                  to="/consent"
                  className="w-full sm:w-auto px-6 min-h-[48px] rounded-2xl bg-[var(--accent)] text-white font-semibold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.985] transition-all shrink-0"
                >
                  <span>{t.startCheck}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Personas Row */}
      <section className="max-w-5xl mx-auto px-4">
        <Reveal>
          <div className="paper-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-[var(--accent-text)] font-semibold">
                  Instant Walkthrough
                </span>
                <h2 className="text-lg sm:text-xl font-heading font-bold text-[var(--text-main)] mt-0.5">
                  {t.tryDemoCase}
                </h2>
              </div>
              <p className="text-sm text-[var(--text-muted)] max-w-md">
                Explore live rule-based screening outcomes with zero typing. Pre-fills sample inputs and opens the explainable results story.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {DEMO_PERSONAS.map(persona => {
                const isUrgent = persona.id === 'urgent';
                const isMod = persona.id === 'moderate';
                const tone = isUrgent
                  ? { color: 'var(--risk-urg)', bg: 'var(--risk-urg-bg)', border: 'var(--risk-urg-border)', Icon: AlertTriangle }
                  : isMod
                  ? { color: 'var(--risk-mod)', bg: 'var(--risk-mod-bg)', border: 'var(--risk-mod-border)', Icon: Info }
                  : { color: 'var(--risk-low)', bg: 'var(--risk-low-bg)', border: 'var(--risk-low-border)', Icon: ShieldCheck };
                const ToneIcon = tone.Icon;

                return (
                  <motion.button
                    key={persona.id}
                    type="button"
                    onClick={() => handleLaunchDemo(persona.id)}
                    whileHover={reduced ? undefined : { y: -3 }}
                    whileTap={reduced ? undefined : { scale: 0.985 }}
                    transition={{ duration: DURATIONS.fast, ease: HAYAT_EASE }}
                    className="text-start p-5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--card-alt)] transition-colors flex flex-col justify-between cursor-pointer min-h-[170px]"
                  >
                    <div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-3 border"
                        style={{ color: tone.color, backgroundColor: tone.bg, borderColor: tone.border }}
                      >
                        <ToneIcon className="w-3.5 h-3.5" />
                        <span>{persona.badge}</span>
                      </span>
                      <h3 className="font-heading font-bold text-base text-[var(--text-main)]">
                        {persona.name}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                        {persona.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-sm text-[var(--accent-text)] font-semibold">
                      <span>Inspect Pathway</span>
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Why Earlier Matters */}
      <section className="max-w-5xl mx-auto px-4">
        <Reveal>
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-main)]">
              {t.whyEarlierTitle}
            </h2>
            <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">
              Checking male factors early helps reduce prolonged uncertainty and supports timely everyday improvements.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Activity, title: t.whyModifiableTitle, desc: t.whyModifiableDesc, accent: true },
            { icon: Clock, title: t.whyEarlyBeatsLateTitle, desc: t.whyEarlyBeatsLateDesc, accent: false },
            { icon: Lock, title: t.whyFromHomeTitle, desc: t.whyFromHomeDesc, accent: true },
          ].map((card, i) => {
            const CardIcon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 0.08}>
                <TiltCard className="h-full">
                  <div className="paper-card paper-card-hover p-6 sm:p-7 space-y-3 h-full">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border border-[var(--border-hairline)] ${
                        card.accent
                          ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                          : 'bg-[var(--brand-soft)] text-[var(--brand)]'
                      }`}
                    >
                      <CardIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-[var(--text-main)]">
                      {card.title}
                    </h3>
                    <p className="text-base text-[var(--text-muted)] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Built Around Trust & Dignity */}
      <section className="max-w-5xl mx-auto px-4">
        <Reveal>
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-main)]">
              {t.builtAroundTrustTitle}
            </h2>
            <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">
              Conceived for the UAE and Middle Eastern context with calm, respectful design.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, title: t.trustPrivateTitle, desc: t.trustPrivateDesc, accent: true },
            { icon: HeartHandshake, title: t.trustCulturalTitle, desc: t.trustCulturalDesc, accent: false },
            { icon: FileCheck, title: t.trustClinicalTitle, desc: t.trustClinicalDesc, accent: true },
            { icon: Stethoscope, title: t.trustHumanTitle, desc: t.trustHumanDesc, accent: false },
          ].map((card, i) => {
            const CardIcon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 0.06}>
                <TiltCard className="h-full">
                  <div className="paper-card p-6 space-y-2.5 h-full">
                    <CardIcon className={`w-6 h-6 ${card.accent ? 'text-[var(--accent-text)]' : 'text-[var(--brand)]'}`} />
                    <h3 className="font-heading font-bold text-base text-[var(--text-main)]">{card.title}</h3>
                    <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">{card.desc}</p>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-3xl mx-auto px-4 text-center">
        <Reveal>
          <div className="paper-card p-8 sm:p-10 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-main)]">
              Ready to explore your reproductive health in complete confidence?
            </h2>
            <p className="text-base text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
              Take 4 minutes to gain clarity. You control what is stored, who sees it, and when to delete it.
            </p>
            <div className="pt-2 flex justify-center">
              <Magnetic>
                <Link
                  to="/consent"
                  className="inline-flex items-center justify-center gap-2 px-8 min-h-[52px] rounded-2xl font-heading font-semibold text-base
                             bg-[var(--accent)] text-white hover:opacity-95 active:scale-[0.985] shadow-sm transition-all"
                >
                  <span>{t.startCheck}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
