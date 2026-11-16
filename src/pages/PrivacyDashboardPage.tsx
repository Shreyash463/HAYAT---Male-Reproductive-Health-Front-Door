import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { exportData } from '../services/api';
import { getHumanReadableInventory } from '../utils/formatters';
import { Reveal, DURATIONS, HAYAT_EASE, usePrefersReducedMotion } from '../motion';
import {
  ShieldCheck,
  Trash2,
  Download,
  Clock,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Database,
  GlobeLock,
  Lock,
} from 'lucide-react';

const EXPORT_NOTICE = 'This file contains sensitive health information. Store it carefully.';

export const PrivacyDashboardPage: React.FC = () => {
  const {
    t,
    consent,
    updateConsent,
    answers,
    result,
    clearAllData,
    accessLogs,
    addLog,
    outboundCalls,
  } = useApp();

  const reduced = usePrefersReducedMotion();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  const performDownloadExport = async () => {
    const rawJsonStr = await exportData(answers, result, consent);
    const parsed = JSON.parse(rawJsonStr);
    const payloadWithNotice = {
      _notice: EXPORT_NOTICE,
      ...parsed,
    };
    const finalJsonStr = JSON.stringify(payloadWithNotice, null, 2);

    const blob = new Blob([finalJsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hayat-privacy-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('Data Exported', 'Full JSON archive downloaded with sensitivity notice');
    setShowExportModal(false);
  };

  const handleWipe = () => {
    setShowWipeModal(false);
    if (reduced) {
      clearAllData();
      setWipeSuccess(true);
      setTimeout(() => setWipeSuccess(false), 5000);
      return;
    }

    // Calm particle dissolve effect on inventory rows before clearing state
    setIsDissolving(true);
    setTimeout(() => {
      clearAllData();
      setIsDissolving(false);
      setWipeSuccess(true);
      setTimeout(() => setWipeSuccess(false), 5000);
    }, 600);
  };

  const inventoryItems = getHumanReadableInventory(answers);
  const researchOptIn = consent.shareAnonymisedResearch;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <Reveal>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-xs font-mono font-semibold border border-[var(--border-hairline)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>You&apos;re in control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[var(--text-main)]">
            {t.privacyTitle}
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            {t.privacySub}
          </p>
        </div>
      </Reveal>

      <AnimatePresence>
        {wipeSuccess && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATIONS.fast, ease: HAYAT_EASE }}
            className="p-4 rounded-2xl border text-base flex items-center gap-2.5"
            style={{
              backgroundColor: 'var(--risk-low-bg)',
              borderColor: 'var(--risk-low-border)',
              color: 'var(--risk-low)',
            }}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>All answers, screening results, and local storage entries were completely deleted from this device.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated SVG "What left your device" data-flow diagram */}
      <Reveal delay={0.05}>
        <div className="paper-card p-6 sm:p-8 space-y-5 border-s-4" style={{ borderInlineStartColor: 'var(--accent)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[var(--accent-text)]">
              <GlobeLock className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
                What left your device
              </h2>
            </div>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs sm:text-sm font-semibold"
              style={
                researchOptIn
                  ? {
                      color: 'var(--risk-mod)',
                      backgroundColor: 'var(--risk-mod-bg)',
                      borderColor: 'var(--risk-mod-border)',
                    }
                  : {
                      color: 'var(--risk-low)',
                      backgroundColor: 'var(--risk-low-bg)',
                      borderColor: 'var(--risk-low-border)',
                    }
              }
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {researchOptIn
                  ? 'Nothing sent yet (research preference is simulated offline)'
                  : 'Nothing left your device'}
              </span>
            </span>
          </div>

          {/* Animated SVG Data Flow */}
          <div className="surface-panel p-4 sm:p-5 overflow-hidden">
            <svg
              viewBox="0 0 640 156"
              className="w-full h-auto max-h-40"
              role="img"
              aria-label={
                researchOptIn
                  ? 'Diagram showing local device processing with simulated anonymised research preference toggled on'
                  : 'Diagram showing health inputs staying inside your browser device with nothing transmitted externally'
              }
            >
              {/* Node 1: Your Browser */}
              <rect
                x="18"
                y="34"
                width="156"
                height="88"
                rx="16"
                fill="var(--card)"
                stroke="var(--accent)"
                strokeWidth="1.75"
              />
              <text x="96" y="72" textAnchor="middle" fill="var(--text-main)" fontSize="13" fontWeight="700">
                Your Browser
              </text>
              <text x="96" y="94" textAnchor="middle" fill="var(--text-muted)" fontSize="11">
                On-device scoring
              </text>

              {/* Local loop path: stays inside device */}
              <motion.path
                d="M 174 78 L 282 78"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeDasharray="6 5"
                animate={reduced ? undefined : { strokeDashoffset: [22, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              />

              {/* Node 2: Privacy Boundary */}
              <rect
                x="282"
                y="34"
                width="148"
                height="88"
                rx="16"
                fill="var(--card)"
                stroke="var(--risk-low)"
                strokeWidth="1.75"
              />
              <text x="356" y="70" textAnchor="middle" fill="var(--risk-low)" fontSize="13" fontWeight="700">
                Privacy Shield
              </text>
              <text x="356" y="92" textAnchor="middle" fill="var(--text-muted)" fontSize="11">
                {consent.saveOnDevice ? 'Saved locally only' : 'Memory only'}
              </text>

              {/* Path toward external/research */}
              <path
                d="M 430 78 L 494 78"
                fill="none"
                stroke={researchOptIn ? 'var(--risk-mod)' : 'var(--border-strong)'}
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity={researchOptIn ? 0.9 : 0.4}
              />

              {/* Boundary stop / research badge */}
              <rect
                x="494"
                y="34"
                width="128"
                height="88"
                rx="16"
                fill={researchOptIn ? 'var(--risk-mod-bg)' : 'var(--surface)'}
                stroke={researchOptIn ? 'var(--risk-mod)' : 'var(--border-hairline)'}
                strokeWidth="1.5"
                strokeDasharray={researchOptIn ? undefined : '4 4'}
              />
              <text
                x="558"
                y="70"
                textAnchor="middle"
                fill={researchOptIn ? 'var(--risk-mod)' : 'var(--text-muted)'}
                fontSize="12.5"
                fontWeight="700"
              >
                {researchOptIn ? 'Research Opt-In' : 'External Servers'}
              </text>
              <text x="558" y="92" textAnchor="middle" fill="var(--text-muted)" fontSize="11">
                {researchOptIn ? 'Simulated (0 bytes sent)' : 'Nothing transmitted'}
              </text>
            </svg>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base">
            <div className="surface-panel p-4">
              <strong className="text-[var(--text-main)] block mb-1">Personal Health Answers</strong>
              <p className="text-[var(--text-muted)]">
                <strong style={{ color: 'var(--risk-low)' }}>Nothing left this device.</strong> All scoring and What-If calculations run locally inside your browser.
              </p>
            </div>
            <div className="surface-panel p-4">
              <strong className="text-[var(--text-main)] block mb-1">Network &amp; Third-Party Trackers</strong>
              <p className="text-[var(--text-muted)]">
                Zero ad pixels, zero analytics cookies, and zero external data collection.
              </p>
            </div>
          </div>

          {/* Outbound Network Transmission Live Audit */}
          <div className="space-y-3 pt-3 border-t border-[var(--border-hairline)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <GlobeLock className="w-4 h-4 text-[var(--accent-text)]" />
                <span>{t.whatLeftDeviceTableTitle}</span>
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface)] px-2.5 py-0.5 rounded-full border border-[var(--border-hairline)]">
                {outboundCalls.length} transmissions logged
              </span>
            </div>

            {outboundCalls.length === 0 ? (
              <div
                className="p-4 rounded-2xl border text-sm sm:text-base flex items-center gap-3"
                style={{
                  backgroundColor: 'var(--risk-low-bg)',
                  borderColor: 'var(--risk-low-border)',
                  color: 'var(--risk-low)',
                }}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <strong className="block">{t.whatLeftDeviceEmpty}</strong>
                  <span className="text-xs text-[var(--text-muted)] block mt-0.5">{t.whatLeftDeviceZeroNetwork}</span>
                </div>
              </div>
            ) : (
              <div className="border border-[var(--border-hairline)] rounded-2xl overflow-x-auto bg-[var(--surface)]">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead className="bg-[var(--card-alt)] text-[var(--text-main)] border-b border-[var(--border-hairline)]">
                    <tr>
                      <th className="p-3 font-bold text-start">Timestamp</th>
                      <th className="p-3 font-bold text-start">Endpoint</th>
                      <th className="p-3 font-bold text-start">Status</th>
                      <th className="p-3 font-bold text-start">Transmitted Payload</th>
                      <th className="p-3 font-bold text-start">Response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {outboundCalls.map(call => (
                      <tr key={call.id} className="hover:bg-[var(--card)] transition-colors">
                        <td className="p-3 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {new Date(call.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3 font-mono text-xs font-semibold text-[var(--text-main)] whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-[var(--card)] border text-[11px] me-1.5 font-bold">
                            {call.method}
                          </span>
                          {call.endpoint}
                        </td>
                        <td className="p-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: call.status === 'success' ? 'var(--risk-low-bg)' : 'var(--risk-mod-bg)',
                              color: call.status === 'success' ? 'var(--risk-low)' : 'var(--risk-mod)',
                            }}
                          >
                            {call.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs text-[var(--text-main)] max-w-xs truncate">
                          {call.payloadSummary}
                        </td>
                        <td className="p-3 text-xs text-[var(--text-muted)] max-w-xs truncate">
                          {call.responseSummary || 'Completed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Export & Purge Controls */}
      <Reveal delay={0.07}>
        <div className="paper-card p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-md">
            <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">Export or Delete Your Data</h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] mt-0.5">
              Download a portable JSON copy or erase every stored value immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-5 min-h-[48px] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--card-alt)] text-sm sm:text-base font-semibold text-[var(--text-main)] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[var(--accent-text)]" />
              <span>{t.exportJson}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWipeModal(true)}
              className="px-5 min-h-[48px] rounded-2xl border text-sm sm:text-base font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              style={{
                color: 'var(--risk-urg)',
                backgroundColor: 'var(--risk-urg-bg)',
                borderColor: 'var(--risk-urg-border)',
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.deleteEverything}</span>
            </button>
          </div>
        </div>
      </Reveal>

      {/* Plain-Language Data Inventory with calm particle dissolve animation */}
      <Reveal delay={0.08}>
        <div className="paper-card p-6 sm:p-8 space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[var(--accent-text)]" />
              <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
                {t.dataInventory}
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border-hairline)] px-3 py-1 rounded-full">
              Storage: {consent.saveOnDevice ? 'Local browser storage (authorized)' : 'Ephemeral session memory only'}
            </span>
          </div>

          <div className="border border-[var(--border-hairline)] rounded-2xl overflow-x-auto bg-[var(--surface)] relative">
            <table className="w-full text-start text-sm sm:text-base">
              <thead className="bg-[var(--card-alt)] text-[var(--text-main)] border-b border-[var(--border-hairline)]">
                <tr>
                  <th className="p-4 font-bold text-start">Topic</th>
                  <th className="p-4 font-bold text-start">Your Answer</th>
                  <th className="p-4 font-bold text-start">Where It Lives</th>
                  <th className="p-4 font-bold text-start">Why We Ask</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {inventoryItems.map((item, idx) => (
                  <motion.tr
                    key={`${item.field}-${idx}`}
                    animate={
                      isDissolving && !reduced
                        ? {
                            opacity: 0,
                            y: -14 - (idx % 3) * 6,
                            x: ((idx % 2 === 0 ? 1 : -1) * 18),
                            filter: 'blur(4px)',
                          }
                        : { opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }
                    }
                    transition={{
                      duration: 0.45,
                      delay: isDissolving ? idx * 0.035 : 0,
                      ease: HAYAT_EASE,
                    }}
                    className="hover:bg-[var(--card)] transition-colors"
                  >
                    <td className="p-4 font-semibold text-[var(--text-main)]">{item.field}</td>
                    <td className="p-4 font-medium text-[var(--accent-text)]">{item.val}</td>
                    <td className="p-4 text-sm text-[var(--text-muted)]">{item.storage}</td>
                    <td className="p-4 text-sm text-[var(--text-muted)] leading-relaxed">{item.purpose}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Calm particle burst overlay during wipe */}
            {isDissolving && !reduced && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
              >
                {Array.from({ length: 18 }).map((_, i) => {
                  const angle = (i / 18) * Math.PI * 2;
                  const dist = 48 + (i % 4) * 26;
                  return (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0.85, x: 0, y: 0, scale: 1 }}
                      animate={{
                        opacity: 0,
                        x: Math.cos(angle) * dist * 2,
                        y: Math.sin(angle) * dist - 20,
                        scale: 0.3,
                      }}
                      transition={{ duration: 0.55, ease: HAYAT_EASE }}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: i % 2 === 0 ? 'var(--accent)' : 'var(--brand)',
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Live Consent Toggles */}
      <Reveal delay={0.09}>
        <div className="paper-card p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
              Live Consent Settings
            </h2>
            <span className="text-xs sm:text-sm text-[var(--accent-text)] font-mono font-medium">
              Changes apply immediately
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                key: 'processAnswers' as const,
                title: t.consentOpt1,
                sub: 'Processes answers in browser memory to compute your results.',
              },
              {
                key: 'saveOnDevice' as const,
                title: t.consentOpt2,
                sub: 'Saves session in browser localStorage for later review.',
              },
              {
                key: 'shareAnonymisedResearch' as const,
                title: t.consentOpt3,
                sub: `Shares non-identifying aggregate statistics for fairness research. ${t.anonymisedResearchDisclaimer}`,
              },
              {
                key: 'createClinicianSummary' as const,
                title: t.consentOpt4,
                sub: 'Permits formatting of printable clinician summary documents.',
              },
              {
                key: 'useAiExplanation' as const,
                title: t.consentOptAi,
                sub: 'Sends non-identifying risk category codes to the AI service for simpler language explanations.',
              },
            ].map(item => {
              const checked = consent[item.key];
              return (
                <label
                  key={item.key}
                  className="flex items-center justify-between gap-4 p-4 min-h-[56px] rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] cursor-pointer hover:border-[var(--border-strong)] transition-colors"
                >
                  <div>
                    <span className="text-base font-semibold text-[var(--text-main)] block">
                      {item.title}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {item.sub}
                    </span>
                  </div>
                  <div className="relative shrink-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => updateConsent({ [item.key]: e.target.checked })}
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-7 rounded-full transition-colors duration-200 flex items-center px-1 ${
                        checked ? 'bg-[var(--accent)]' : 'bg-[var(--gauge-track)]'
                      }`}
                    >
                      <motion.span
                        layout
                        transition={{ duration: reduced ? 0.05 : 0.25, ease: HAYAT_EASE }}
                        className={`w-5 h-5 rounded-full bg-white shadow-xs ${
                          checked ? 'ms-auto' : 'me-auto'
                        }`}
                      />
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Device Access Log */}
      <Reveal delay={0.1}>
        <div className="paper-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--brand)]" />
              <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
                {t.accessLog}
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {accessLogs.length} events logged
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pe-1">
            {accessLogs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl surface-panel flex items-center justify-between gap-3 text-sm sm:text-base"
              >
                <div>
                  <span className="font-semibold text-[var(--text-main)]">{log.action}</span>
                  <span className="text-sm text-[var(--text-muted)] block mt-0.5">{log.detail}</span>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Protection Accordion */}
      <Reveal delay={0.1}>
        <div className="paper-card p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
            {t.howProtected}
          </h2>

          <div className="space-y-2.5">
            {[
              {
                title: 'Data Minimisation & Ephemerality',
                body: 'HAYAT never asks for identity markers (name, phone, national ID, or email). Evaluation happens strictly inside your browser session.',
              },
              {
                title: 'Zero Third-Party Trackers or Ad Cookies',
                body: 'We omit analytics SDKs, advertising identifiers, or tracking cookies. Nothing is profiled or sold.',
              },
              {
                title: 'Sandboxed Local Storage Option',
                body: 'Only if you explicitly check "Save on device" will preferences persist in your own browser storage.',
              },
              {
                title: 'Instant Full Wipe',
                body: 'Clicking "Delete everything now" clears all application state and browser storage keys immediately.',
              },
            ].map((item, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className="border border-[var(--border-hairline)] rounded-2xl overflow-hidden bg-[var(--surface)]">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full text-start px-4 min-h-[52px] hover:bg-[var(--card-alt)] flex items-center justify-between text-base font-semibold text-[var(--text-main)] transition-colors cursor-pointer"
                  >
                    <span>{item.title}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: reduced ? 0.05 : DURATIONS.fast, ease: HAYAT_EASE }}
                    >
                      <ChevronDown className="w-4 h-4 shrink-0" />
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
                          {item.body}
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

      {/* Export Sensitivity Warning Modal (shown BEFORE download) */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : DURATIONS.fast, ease: HAYAT_EASE }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: reduced ? 0.1 : DURATIONS.fast, ease: HAYAT_EASE }}
              className="max-w-md w-full p-6 sm:p-7 paper-card border-2 space-y-4"
              style={{ borderColor: 'var(--risk-mod-border)' }}
            >
              <div className="flex items-center gap-2.5" style={{ color: 'var(--risk-mod)' }}>
                <Lock className="w-5 h-5 shrink-0" />
                <h3 className="text-lg font-bold font-heading text-[var(--text-main)]">
                  Sensitive Health Export Notice
                </h3>
              </div>
              <div
                className="p-4 rounded-2xl border text-sm sm:text-base font-medium"
                style={{
                  backgroundColor: 'var(--risk-mod-bg)',
                  borderColor: 'var(--risk-mod-border)',
                  color: 'var(--text-main)',
                }}
              >
                {EXPORT_NOTICE}
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Your exported JSON file includes this notice at the top of the file alongside your current session inputs and screening summary.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 min-h-[44px] rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={performDownloadExport}
                  className="px-5 min-h-[44px] rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-95 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JSON</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wipe Modal */}
      <AnimatePresence>
        {showWipeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : DURATIONS.fast, ease: HAYAT_EASE }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: reduced ? 0.1 : DURATIONS.fast, ease: HAYAT_EASE }}
              className="max-w-md w-full p-6 sm:p-7 paper-card border-2 space-y-4"
              style={{ borderColor: 'var(--risk-urg-border)' }}
            >
              <div className="flex items-center gap-2" style={{ color: 'var(--risk-urg)' }}>
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-lg font-bold font-heading">Permanently Erase All Data?</h3>
              </div>
              <p className="text-base text-[var(--text-muted)] leading-relaxed">
                This will immediately wipe your answers, screening results, consent records, and audit events. This action cannot be reversed.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWipeModal(false)}
                  className="px-4 min-h-[44px] rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWipe}
                  className="px-5 min-h-[44px] rounded-xl text-white text-sm font-semibold hover:opacity-95 transition-opacity cursor-pointer"
                  style={{ backgroundColor: 'var(--risk-urg)' }}
                >
                  Erase Everything Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
