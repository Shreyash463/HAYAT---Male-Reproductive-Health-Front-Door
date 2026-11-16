import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { RiskGauge } from '../components/RiskGauge';
import { FactorBar } from '../components/FactorBar';
import { TriageLadder } from '../components/TriageLadder';
import { ClinicianSummaryModal } from '../components/ClinicianSummaryModal';
import { WhatIfPanel } from '../components/WhatIfPanel';
import { explain } from '../services/api';
import { Reveal, DURATIONS, HAYAT_EASE, usePrefersReducedMotion } from '../motion';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  FileText,
  Trash2,
  ArrowRight,
  ChevronRight,
  Info,
  Heart,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { result, answers, t, consent, updateConsent, clearAllData, language } = useApp();
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();

  const [detailedView, setDetailedView] = useState(false);
  const [showClinicianModal, setShowClinicianModal] = useState(false);
  const [showConsentPromptModal, setShowConsentPromptModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [explanationData, setExplanationData] = useState<{ explanation: string; aiUsed: boolean } | null>(null);
  const [showOriginalExplanation, setShowOriginalExplanation] = useState(false);

  useEffect(() => {
    if (!result) return;
    let isCurrent = true;
    explain(result, detailedView ? 'detailed' : 'simple', language, consent.useAiExplanation)
      .then(res => {
        if (isCurrent) setExplanationData(res);
      })
      .catch(() => {
        // Handled silently
      });
    return () => {
      isCurrent = false;
    };
  }, [result, detailedView, language, consent.useAiExplanation]);

  if (!result) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center paper-card space-y-4">
        <Sparkles className="w-9 h-9 text-[var(--accent-text)] mx-auto" />
        <h1 className="text-xl font-bold font-heading text-[var(--text-main)]">No Active Screening Found</h1>
        <p className="text-base text-[var(--text-muted)]">
          Complete the short private questionnaire or launch a demo scenario to view an explainable screening.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/consent"
            className="px-6 min-h-[48px] rounded-2xl bg-[var(--accent)] text-white text-base font-semibold inline-flex items-center justify-center"
          >
            Start Check
          </Link>
          <Link
            to="/"
            className="px-6 min-h-[48px] rounded-2xl border border-[var(--border-hairline)] text-base font-medium text-[var(--text-main)] inline-flex items-center justify-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isUrgent = result.band === 'Urgent';

  const bandIcons = {
    Low: ShieldCheck,
    Moderate: Info,
    Elevated: AlertCircle,
    Urgent: AlertTriangle,
  };
  const bandColors = {
    Low: { color: 'var(--risk-low)', bg: 'var(--risk-low-bg)', border: 'var(--risk-low-border)' },
    Moderate: { color: 'var(--risk-mod)', bg: 'var(--risk-mod-bg)', border: 'var(--risk-mod-border)' },
    Elevated: { color: 'var(--risk-elev)', bg: 'var(--risk-elev-bg)', border: 'var(--risk-elev-border)' },
    Urgent: { color: 'var(--risk-urg)', bg: 'var(--risk-urg-bg)', border: 'var(--risk-urg-border)' },
  };
  const BandIcon = bandIcons[result.band];
  const currentBandStyle = bandColors[result.band];

  const handleOpenSummary = () => {
    if (consent.createClinicianSummary) {
      setShowClinicianModal(true);
    } else {
      setShowConsentPromptModal(true);
    }
  };

  const handleEnableSummaryConsent = () => {
    updateConsent({ createClinicianSummary: true });
    setShowConsentPromptModal(false);
    setShowClinicianModal(true);
  };

  const handleConfirmDelete = () => {
    clearAllData();
    setShowDeleteConfirmModal(false);
    navigate('/');
  };

  return (
    <div className="relative">
      {/* Subtle band-colored ambient page tint at top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-55 transition-colors duration-500"
        style={{
          background: `linear-gradient(180deg, ${currentBandStyle.bg} 0%, transparent 100%)`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-8">
        {/* 1. SAFETY EXCEPTION: Red-flag card renders INSTANTLY with zero reveal delay or scroll-gating */}
        {isUrgent && (
          <section
            role="alert"
            className="paper-card p-6 sm:p-8 border-2 space-y-4"
            style={{
              backgroundColor: 'var(--risk-urg-bg)',
              borderColor: 'var(--risk-urg)',
            }}
          >
            <div className="flex items-start gap-3.5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white"
                style={{ backgroundColor: 'var(--risk-urg)' }}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-main)]">
                  {t.urgentCardTitle}
                </h2>
                <p className="text-base text-[var(--text-main)] mt-1.5 leading-relaxed">
                  {t.urgentCardBody}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--risk-urg-border)] text-sm sm:text-base text-[var(--text-main)] space-y-2">
              <span className="font-bold block text-xs uppercase tracking-wider" style={{ color: 'var(--risk-urg)' }}>
                Flagged Symptoms Requiring Medical Assessment Today:
              </span>
              <ul className="list-disc list-inside space-y-1">
                {result.redFlags.map((rf, i) => (
                  <li key={i}>{rf}</li>
                ))}
              </ul>
            </div>

            <div className="pt-1">
              <Link
                to="/care"
                className="inline-flex items-center justify-center gap-2 px-6 min-h-[48px] rounded-2xl text-white text-base font-semibold hover:opacity-95 transition-opacity"
                style={{ backgroundColor: 'var(--risk-urg)' }}
              >
                <span>{t.openCareNav} (Urgent Care Options)</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
          </section>
        )}

        {/* 2. Screening, Not Diagnosis Banner */}
        <Reveal delay={isUrgent ? 0 : 0.04}>
          <div
            className="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-sm sm:text-base"
            style={{
              backgroundColor: 'var(--risk-mod-bg)',
              borderColor: 'var(--risk-mod-border)',
              color: 'var(--text-main)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 shrink-0" style={{ color: 'var(--risk-mod)' }} />
              <span className="font-semibold">{t.screeningNotDiagnosis}</span>
            </div>
            <span
              className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--card)] border border-[var(--border-hairline)] uppercase whitespace-nowrap"
              style={{ color: 'var(--risk-mod)' }}
            >
              Rule-Based Screening
            </span>
          </div>
        </Reveal>

        {/* 3. Risk Band Gauge & Summary */}
        <Reveal delay={0.08}>
          <section
            className="paper-card p-6 sm:p-8 border-t-4"
            style={{ borderTopColor: currentBandStyle.color }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-start max-w-xl">
                <div
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-sm font-semibold"
                  style={{
                    color: currentBandStyle.color,
                    backgroundColor: currentBandStyle.bg,
                    borderColor: currentBandStyle.border,
                  }}
                >
                  <BandIcon className="w-4 h-4" />
                  <span>{result.band} Risk Band</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-main)] leading-snug">
                  {result.summary}
                </h1>

                <p className="text-base text-[var(--text-muted)] leading-relaxed">
                  Computed transparently from international clinical guidance. Review each signal below, test modifiable habits live, and explore next steps.
                </p>

                {result.missingInfoNote && (
                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] text-sm text-[var(--text-muted)] flex items-start gap-2.5 text-start">
                    <Info className="w-4 h-4 text-[var(--brand)] shrink-0 mt-1" />
                    <span>{result.missingInfoNote}</span>
                  </div>
                )}
              </div>

              <RiskGauge score={result.score} band={result.band} size={210} />
            </div>
          </section>
        </Reveal>

        {/* 4. Explainability Panel ("Why this result?") */}
        <Reveal delay={0.08}>
          <section className="paper-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-hairline)]">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-heading text-[var(--text-main)]">
                  {t.whyThisResult}
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-muted)] mt-0.5">
                  Zero black-box guessing. Review each factor that contributed to your screening.
                </p>
              </div>

              {/* Simple vs Detailed Toggle */}
              <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDetailedView(false)}
                  className={`px-4 min-h-[40px] text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                    !detailedView
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {t.simpleView}
                </button>
                <button
                  type="button"
                  onClick={() => setDetailedView(true)}
                  className={`px-4 min-h-[40px] text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                    detailedView
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {t.detailedView}
                </button>
              </div>
            </div>

            {/* Narrative Explanation Card with AI / Rule-based Badge & Toggle */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {explanationData?.aiUsed && !showOriginalExplanation ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--border-hairline)]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.aiExplanationBadge}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border-hairline)]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.standardExplanationBadge}</span>
                    </span>
                  )}
                </div>

                {/* If AI explanation was used, offer toggle to view original rule-based text */}
                {explanationData?.aiUsed && (
                  <button
                    type="button"
                    onClick={() => setShowOriginalExplanation(prev => !prev)}
                    className="text-xs font-medium text-[var(--accent-text)] hover:underline cursor-pointer"
                  >
                    {showOriginalExplanation ? t.showAiExplanation : t.showOriginalExplanation}
                  </button>
                )}
              </div>

              <p className="text-base text-[var(--text-main)] leading-relaxed">
                {showOriginalExplanation
                  ? result.triageReason
                  : (explanationData?.explanation || result.triageReason)}
              </p>

              {!explanationData?.aiUsed && (
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {t.standardExplanationNote}
                </p>
              )}
            </div>

            {/* Contributing Risk Factors */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[var(--text-main)]">
                Identified Factors ({result.factors.length})
              </h3>
              {result.factors.length > 0 ? (
                result.factors.map((factor, idx) => (
                  <FactorBar key={factor.id} factor={factor} detailed={detailedView} index={idx} />
                ))
              ) : (
                <div
                  className="p-4 rounded-2xl border text-base flex items-center gap-2.5"
                  style={{
                    backgroundColor: 'var(--risk-low-bg)',
                    borderColor: 'var(--risk-low-border)',
                    color: 'var(--risk-low)',
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="font-medium">No elevated risk factors were identified in your profile.</span>
                </div>
              )}
            </div>

            {/* Favourable Factors */}
            {result.favourableFactors.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[var(--border-hairline)]">
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--risk-low)' }}>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {t.favourableTitle} ({result.favourableFactors.length})
                  </span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.favourableFactors.map(factor => (
                    <div
                      key={factor.id}
                      className="p-4 rounded-2xl border text-sm sm:text-base space-y-1.5"
                      style={{
                        backgroundColor: 'var(--risk-low-bg)',
                        borderColor: 'var(--risk-low-border)',
                      }}
                    >
                      <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--risk-low)' }}>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{factor.label}</span>
                      </div>
                      <p className="text-sm text-[var(--text-main)] leading-relaxed">{factor.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What we did NOT use */}
            <div className="p-4 rounded-2xl surface-panel text-sm text-[var(--text-muted)] space-y-1">
              <strong className="text-[var(--text-main)] block">{t.notUsedTitle}</strong>
              <p>{t.notUsedList}</p>
            </div>
          </section>
        </Reveal>

        {/* 5. Interactive What-If Panel */}
        <Reveal delay={0.08}>
          <WhatIfPanel baseAnswers={answers} baseResult={result} />
        </Reveal>

        {/* 6. Screening vs Medical Diagnosis */}
        <Reveal delay={0.08}>
          <section className="paper-card p-6 sm:p-8 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--brand)] font-mono">
              {t.screeningVsDiagnosis}
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm sm:text-base text-[var(--text-muted)]">
              <div className="p-4 rounded-2xl surface-panel">
                <span className="font-bold text-[var(--text-main)] block mb-1">Signal, Not Disease</span>
                <span>{t.screeningVs1}</span>
              </div>
              <div className="p-4 rounded-2xl surface-panel">
                <span className="font-bold text-[var(--text-main)] block mb-1">Doctor-Confirmed</span>
                <span>{t.screeningVs2}</span>
              </div>
              <div className="p-4 rounded-2xl surface-panel">
                <span className="font-bold text-[var(--text-main)] block mb-1">Often Reversible</span>
                <span>{t.screeningVs3}</span>
              </div>
            </div>
          </section>
        </Reveal>

        {/* 7. Vertical Triage Ladder */}
        <Reveal delay={0.08}>
          <TriageLadder currentLevel={result.triage} reason={result.triageReason} />
        </Reveal>

        {/* 8. Action Plan & Questions to Ask Doctor */}
        <Reveal delay={0.08}>
          <section className="grid md:grid-cols-2 gap-5">
            <div className="paper-card p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 text-[var(--accent-text)]">
                <Heart className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base tracking-wide uppercase">
                  {t.actionPlanTitle}
                </h3>
              </div>
              <ul className="space-y-3 text-base text-[var(--text-main)]">
                {result.actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[var(--accent-text)] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="paper-card p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 text-[var(--brand)]">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base tracking-wide uppercase">
                  {t.questionsToAskDoctor}
                </h3>
              </div>
              <ul className="space-y-3 text-base text-[var(--text-main)]">
                {result.doctorQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <ChevronRight className="w-5 h-5 text-[var(--brand)] shrink-0 mt-0.5 rtl:rotate-180" />
                    <span className="leading-relaxed">&ldquo;{q}&rdquo;</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>

        {/* 9. Action Buttons */}
        <Reveal delay={0.08}>
          <section className="paper-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                to="/care"
                className="w-full sm:w-auto px-6 min-h-[48px] rounded-2xl bg-[var(--accent)] text-white text-base font-heading font-semibold hover:opacity-95 flex items-center justify-center gap-2 transition-opacity"
              >
                <span>{t.openCareNav}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>

              <button
                type="button"
                onClick={handleOpenSummary}
                className="w-full sm:w-auto px-5 min-h-[48px] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] text-base font-medium text-[var(--text-main)] hover:bg-[var(--card-alt)] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[var(--brand)]" />
                <span>{t.createClinicianSummary}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteConfirmModal(true)}
              className="text-sm sm:text-base font-medium flex items-center gap-2 min-h-[44px] px-3 rounded-xl hover:bg-[var(--risk-urg-bg)] transition-colors cursor-pointer"
              style={{ color: 'var(--risk-urg)' }}
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.deleteMyDataNow}</span>
            </button>
          </section>
        </Reveal>

        {/* Modals */}
        {showClinicianModal && (
          <ClinicianSummaryModal
            result={result}
            answers={answers}
            onClose={() => setShowClinicianModal(false)}
          />
        )}

        <AnimatePresence>
          {showConsentPromptModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.12 : DURATIONS.fast, ease: HAYAT_EASE }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: reduced ? 0.12 : DURATIONS.fast, ease: HAYAT_EASE }}
                className="max-w-md w-full p-6 sm:p-7 paper-card space-y-4"
              >
                <h3 className="text-lg font-bold font-heading text-[var(--text-main)]">Enable Clinician Summary</h3>
                <p className="text-base text-[var(--text-muted)] leading-relaxed">
                  To format your inputs into a printable summary for your clinician, confirm that you permit HAYAT to prepare this document on your device. You control who receives it.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConsentPromptModal(false)}
                    className="px-4 min-h-[44px] rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEnableSummaryConsent}
                    className="px-5 min-h-[44px] rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-95 cursor-pointer"
                  >
                    Allow & Open Summary
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.12 : DURATIONS.fast, ease: HAYAT_EASE }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: reduced ? 0.12 : DURATIONS.fast, ease: HAYAT_EASE }}
                className="max-w-md w-full p-6 sm:p-7 paper-card border-2 space-y-4"
                style={{ borderColor: 'var(--risk-urg-border)' }}
              >
                <div className="flex items-center gap-2" style={{ color: 'var(--risk-urg)' }}>
                  <Trash2 className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-heading">Delete All Data Immediately?</h3>
                </div>
                <p className="text-base text-[var(--text-muted)] leading-relaxed">
                  This will irreversibly purge your answers, screening score, and any device storage. No copies will remain anywhere.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmModal(false)}
                    className="px-4 min-h-[44px] rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    Keep my data
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-5 min-h-[44px] rounded-xl text-white text-sm font-semibold hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: 'var(--risk-urg)' }}
                  >
                    Yes, Purge Everything
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
