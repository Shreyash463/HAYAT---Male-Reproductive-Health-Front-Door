import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { MOCK_CLINICS } from '../data/syntheticCohort';
import { bookTeleconsult } from '../services/api';
import { Reveal, TiltCard, DURATIONS, HAYAT_EASE, usePrefersReducedMotion } from '../motion';
import {
  Stethoscope,
  MapPin,
  Video,
  Calendar,
  CheckCircle2,
  Check,
  Phone,
  X,
  AlertCircle,
} from 'lucide-react';

export const CareNavigatorPage: React.FC = () => {
  const { t, result, referralStep, setReferralStep, addLog } = useApp();
  const reduced = usePrefersReducedMotion();

  const [maleFriendlyOnly, setMaleFriendlyOnly] = useState(false);
  const [privateEntranceOnly, setPrivateEntranceOnly] = useState(false);

  const [selectedDate, setSelectedDate] = useState('2026-11-09');
  const [selectedTime, setSelectedTime] = useState('18:30 (Evening)');
  const [discreetLabel] = useState(true);
  const [bookingConfirmed, setBookingConfirmed] = useState<{ id: string } | null>(null);
  const [demoClinicModalOpen, setDemoClinicModalOpen] = useState(false);

  const filteredClinics = MOCK_CLINICS.filter(clinic => {
    if (maleFriendlyOnly && !clinic.features.maleFriendly) return false;
    if (privateEntranceOnly && !clinic.features.privateEntrance) return false;
    return true;
  });

  const handleBookTeleconsult = async (clinicId: string) => {
    const res = await bookTeleconsult({
      clinicId,
      date: selectedDate,
      time: selectedTime,
      discreetLabel,
    });
    setBookingConfirmed({ id: res.bookingId });
    setReferralStep(1);
    addLog('Teleconsultation Requested', `Booking ref: ${res.bookingId} (Discreet billing: ${discreetLabel})`);
  };

  const currentTriage = result?.triage || 'Primary care';

  const pathwaySteps = [
    { title: 'Screened', desc: 'Completed private assessment' },
    { title: 'Booked', desc: 'Consultation slot requested' },
    { title: 'Assessed', desc: 'Clinical exam with doctor' },
    { title: 'Follow-up', desc: 'Review tests or progress' },
  ];

  const progressRatio = referralStep / (pathwaySteps.length - 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <Reveal>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-xs font-mono font-semibold border border-[var(--border-hairline)]">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Care Navigation Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[var(--text-main)]">
            {t.careNavTitle}
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            {t.careNavSub}
          </p>
        </div>
      </Reveal>

      {/* Recommended Pathway Card */}
      <Reveal delay={0.05}>
        <div className="paper-card p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[var(--text-main)]">
              Your Recommended Pathway:{' '}
              <span className="text-[var(--accent-text)]">{currentTriage}</span>
            </h2>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border-hairline)] text-[var(--text-muted)]">
              Standardized Guidance
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="surface-panel p-4 sm:p-5 space-y-1.5">
              <span className="text-base font-bold text-[var(--text-main)] block">{t.whatToExpect}</span>
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                A private, non-judgemental conversation covering health history, timeline, and routine blood or semen checks.
              </p>
            </div>

            <div className="surface-panel p-4 sm:p-5 space-y-1.5">
              <span className="text-base font-bold text-[var(--text-main)] block">{t.typicalVisit}</span>
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                Around 30 minutes initially. If a physical exam is suggested, your comfort and privacy come first.
              </p>
            </div>

            <div className="surface-panel p-4 sm:p-5 space-y-1.5">
              <span className="text-base font-bold text-[var(--text-main)] block">{t.howToPrepare}</span>
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                Bring your HAYAT Clinician Summary, note questions, and allow 2–5 days abstinence if a semen test is planned.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Animated 4-Step Stepper Timeline with filling progress line */}
      <Reveal delay={0.07}>
        <div className="paper-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
              {t.referralTracker}
            </h2>
            <span className="text-sm font-mono font-semibold text-[var(--accent-text)]">
              Step {referralStep + 1} of 4
            </span>
          </div>

          {/* Filling horizontal progress rail (desktop/tablet) */}
          <div className="relative hidden sm:block px-8 pt-2">
            <div className="h-1.5 w-full rounded-full bg-[var(--gauge-track)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)] origin-left rtl:origin-right"
                initial={false}
                animate={{ scaleX: progressRatio }}
                transition={{
                  duration: reduced ? 0.12 : DURATIONS.base,
                  ease: HAYAT_EASE,
                }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-3">
            {pathwaySteps.map((step, idx) => {
              const isCompleted = referralStep >= idx;
              const isCurrent = referralStep === idx;

              return (
                <motion.button
                  key={step.title}
                  type="button"
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  onClick={() => setReferralStep(idx)}
                  className={`text-start p-4 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between min-h-[116px] ${
                    isCompleted
                      ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                      : 'bg-[var(--surface)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-base font-bold text-[var(--text-main)]">
                      {idx + 1}. {step.title}
                    </span>
                    <motion.span
                      animate={
                        isCurrent && !reduced
                          ? { scale: [1, 1.1, 1] }
                          : { scale: 1 }
                      }
                      transition={{ duration: 0.45, ease: HAYAT_EASE }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-[var(--accent)] text-white'
                          : 'border border-[var(--border-strong)] bg-[var(--card)]'
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                    </motion.span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-2 leading-snug">{step.desc}</p>
                  <span className="text-xs font-semibold text-[var(--accent-text)] mt-2">
                    {isCurrent ? 'Current stage' : isCompleted ? 'Completed' : 'Tap to mark'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Discreet Teleconsultation (Mock Booking — zero personal fields) */}
      <Reveal delay={0.09}>
        <div className="paper-card p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)] flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
                    {t.privateTeleconsult}
                  </h2>
                  <span
                    className="text-xs font-mono uppercase font-semibold px-2.5 py-0.5 rounded-full border"
                    style={{
                      color: 'var(--risk-mod)',
                      backgroundColor: 'var(--risk-mod-bg)',
                      borderColor: 'var(--risk-mod-border)',
                    }}
                  >
                    Mock booking (demo)
                  </span>
                </div>
                <p className="text-sm sm:text-base text-[var(--text-muted)]">
                  Preview a discreet appointment slot without entering any personal details.
                </p>
              </div>
            </div>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full border w-fit shrink-0"
              style={{
                color: 'var(--risk-low)',
                backgroundColor: 'var(--risk-low-bg)',
                borderColor: 'var(--risk-low-border)',
              }}
            >
              No personal fields required
            </span>
          </div>

          {bookingConfirmed ? (
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATIONS.fast, ease: HAYAT_EASE }}
              className="p-5 rounded-2xl border text-sm sm:text-base space-y-2"
              style={{
                backgroundColor: 'var(--risk-low-bg)',
                borderColor: 'var(--risk-low-border)',
                color: 'var(--text-main)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-base" style={{ color: 'var(--risk-low)' }}>
                <CheckCircle2 className="w-5 h-5" />
                <span>Mock Teleconsultation Slot Reserved (Demo Only)</span>
              </div>
              <p>
                Demo reference ID: <strong className="font-mono">{bookingConfirmed.id}</strong> for {selectedDate} at {selectedTime}.
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Simulated discreet billing label: &ldquo;Health Wellness Consultation&rdquo;. No personal data was collected or sent.
              </p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label htmlFor="teleconsult-date" className="text-sm font-medium text-[var(--text-muted)] block">
                  Select Demo Date
                </label>
                <select
                  id="teleconsult-date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full min-h-[48px] px-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] text-sm sm:text-base text-[var(--text-main)]"
                >
                  <option value="2026-11-09">Mon, Nov 9</option>
                  <option value="2026-11-10">Tue, Nov 10</option>
                  <option value="2026-11-12">Thu, Nov 12</option>
                  <option value="2026-11-14">Sat, Nov 14 (Weekend)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="teleconsult-time" className="text-sm font-medium text-[var(--text-muted)] block">
                  Select Demo Time Slot
                </label>
                <select
                  id="teleconsult-time"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  className="w-full min-h-[48px] px-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] text-sm sm:text-base text-[var(--text-main)]"
                >
                  <option value="18:30 (Evening)">18:30 (Discreet Evening)</option>
                  <option value="19:15 (Evening)">19:15 (Discreet Evening)</option>
                  <option value="20:00 (Late)">20:00 (Discreet Late)</option>
                  <option value="12:30 (Lunch)">12:30 (Midday Break)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleBookTeleconsult('clinic-1')}
                className="w-full min-h-[48px] rounded-2xl bg-[var(--accent)] text-white text-base font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.bookSlot} (Demo)</span>
              </button>
            </div>
          )}
        </div>
      </Reveal>

      {/* Sample Clinics (Demo Data) */}
      <div className="space-y-5">
        <Reveal delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold font-heading text-[var(--text-main)]">
                  Sample clinics (demo data)
                </h2>
                <span
                  className="text-xs font-mono uppercase font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{
                    color: 'var(--risk-mod)',
                    backgroundColor: 'var(--risk-mod-bg)',
                    borderColor: 'var(--risk-mod-border)',
                  }}
                >
                  Sample data
                </span>
              </div>
              <p className="text-sm sm:text-base text-[var(--text-muted)] mt-1">
                Fictional clinics with illustrative distances showing privacy-conscious intake options and amenities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => setMaleFriendlyOnly(!maleFriendlyOnly)}
                className={`min-h-[44px] px-4 rounded-2xl border font-medium transition-colors cursor-pointer ${
                  maleFriendlyOnly
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-text)]'
                    : 'bg-[var(--card)] border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {t.filterMaleFriendly}
              </button>
              <button
                type="button"
                onClick={() => setPrivateEntranceOnly(!privateEntranceOnly)}
                className={`min-h-[44px] px-4 rounded-2xl border font-medium transition-colors cursor-pointer ${
                  privateEntranceOnly
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-text)]'
                    : 'bg-[var(--card)] border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {t.filterPrivateEntrance}
              </button>
            </div>
          </div>
        </Reveal>

        {filteredClinics.length === 0 ? (
          <div className="paper-card p-8 text-center space-y-3">
            <p className="text-base font-semibold text-[var(--text-main)]">
              No sample clinics match both active filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setMaleFriendlyOnly(false);
                setPrivateEntranceOnly(false);
              }}
              className="px-5 min-h-[44px] rounded-2xl bg-[var(--accent)] text-white text-sm font-semibold cursor-pointer"
            >
              Reset clinic filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredClinics.map((clinic, idx) => (
              <Reveal key={clinic.id} delay={0.05 * idx}>
                <TiltCard maxTilt={3} className="h-full">
                  <div className="paper-card p-6 space-y-4 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span
                            className="inline-block text-[11px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full border"
                            style={{
                              color: 'var(--risk-mod)',
                              backgroundColor: 'var(--risk-mod-bg)',
                              borderColor: 'var(--risk-mod-border)',
                            }}
                          >
                            Sample data
                          </span>
                          <h3 className="font-heading font-bold text-base text-[var(--text-main)]">
                            {clinic.name}
                          </h3>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-muted)] shrink-0 bg-[var(--surface)] border border-[var(--border-hairline)] px-2.5 py-1 rounded-full">
                          {clinic.distance} (illustrative)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mt-2">
                        <MapPin className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                        <span>{clinic.location}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {clinic.features.privateEntrance && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--surface)] text-[var(--text-main)] border border-[var(--border-hairline)]">
                            Private Entrance
                          </span>
                        )}
                        {clinic.features.maleClinicianAvailable && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--border-hairline)]">
                            Male Consultant
                          </span>
                        )}
                        {clinic.features.telehealthAvailable && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--brand-soft)] text-[var(--brand)] border border-[var(--border-hairline)]">
                            Telehealth
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-sm text-[var(--text-muted)]">
                        <strong className="text-[var(--text-main)]">Services:</strong> {clinic.services.join(' • ')}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between gap-2 text-sm">
                      <span className="text-xs sm:text-sm text-[var(--text-muted)] font-mono">
                        ~{clinic.waitDays} days wait (illustrative)
                      </span>
                      <button
                        type="button"
                        onClick={() => setDemoClinicModalOpen(true)}
                        className="px-4 min-h-[44px] rounded-xl bg-[var(--surface)] hover:bg-[var(--card-alt)] border border-[var(--border-hairline)] text-[var(--text-main)] text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-4 h-4 text-[var(--accent-text)]" />
                        <span>Call Discreetly</span>
                      </button>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Demo Clinic Notice Modal */}
      {demoClinicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="paper-card max-w-sm w-full p-6 space-y-4 shadow-xl border border-[var(--border-strong)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-base font-bold font-heading text-[var(--text-main)]">
                <AlertCircle className="w-5 h-5 text-[var(--accent-text)]" />
                <span>Demo Only</span>
              </div>
              <button
                type="button"
                onClick={() => setDemoClinicModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Demo only. These are sample clinics, not real providers.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDemoClinicModalOpen(false)}
                className="px-5 min-h-[40px] rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-95 cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
