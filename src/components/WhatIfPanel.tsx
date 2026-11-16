import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AssessmentAnswers, AssessmentResult, RiskBand } from '../types';
import { assessRisk } from '../engine/riskEngine';
import { HAYAT_EASE, DURATIONS, usePrefersReducedMotion } from '../motion';
import { SlidersHorizontal, RotateCcw, ArrowRight, Info, ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

interface WhatIfPanelProps {
  baseAnswers: AssessmentAnswers;
  baseResult: AssessmentResult;
}

const bandStyle: Record<RiskBand, { color: string; bg: string; border: string; Icon: React.ElementType }> = {
  Low: { color: 'var(--risk-low)', bg: 'var(--risk-low-bg)', border: 'var(--risk-low-border)', Icon: ShieldCheck },
  Moderate: { color: 'var(--risk-mod)', bg: 'var(--risk-mod-bg)', border: 'var(--risk-mod-border)', Icon: Info },
  Elevated: { color: 'var(--risk-elev)', bg: 'var(--risk-elev-bg)', border: 'var(--risk-elev-border)', Icon: AlertCircle },
  Urgent: { color: 'var(--risk-urg)', bg: 'var(--risk-urg-bg)', border: 'var(--risk-urg-border)', Icon: AlertTriangle },
};

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({ baseAnswers, baseResult }) => {
  const shouldReduceMotion = usePrefersReducedMotion();

  const [simExercise, setSimExercise] = useState<number>(baseAnswers.exerciseDays ?? 3);
  const [simSleep, setSimSleep] = useState<number>(baseAnswers.sleepHours ?? 7);
  const [simStress, setSimStress] = useState<number>(baseAnswers.stressLevel ?? 3);
  const [simSmoking, setSimSmoking] = useState<NonNullable<AssessmentAnswers['smoking']>>(
    baseAnswers.smoking || 'never'
  );
  const [simAlcohol, setSimAlcohol] = useState<NonNullable<AssessmentAnswers['alcohol']>>(
    baseAnswers.alcohol || 'none'
  );
  const [simHeatHotBaths, setSimHeatHotBaths] = useState<boolean>(
    (baseAnswers.heatExposure || []).includes('hot_baths')
  );
  const [simHeatLaptop, setSimHeatLaptop] = useState<boolean>(
    (baseAnswers.heatExposure || []).includes('laptop_lap')
  );

  // Sync if baseAnswers change (e.g. switching demo persona)
  useEffect(() => {
    setSimExercise(baseAnswers.exerciseDays ?? 3);
    setSimSleep(baseAnswers.sleepHours ?? 7);
    setSimStress(baseAnswers.stressLevel ?? 3);
    setSimSmoking(baseAnswers.smoking || 'never');
    setSimAlcohol(baseAnswers.alcohol || 'none');
    setSimHeatHotBaths((baseAnswers.heatExposure || []).includes('hot_baths'));
    setSimHeatLaptop((baseAnswers.heatExposure || []).includes('laptop_lap'));
  }, [baseAnswers]);

  const handleReset = () => {
    setSimExercise(baseAnswers.exerciseDays ?? 3);
    setSimSleep(baseAnswers.sleepHours ?? 7);
    setSimStress(baseAnswers.stressLevel ?? 3);
    setSimSmoking(baseAnswers.smoking || 'never');
    setSimAlcohol(baseAnswers.alcohol || 'none');
    setSimHeatHotBaths((baseAnswers.heatExposure || []).includes('hot_baths'));
    setSimHeatLaptop((baseAnswers.heatExposure || []).includes('laptop_lap'));
  };

  const simulatedResult = useMemo(() => {
    const existingOtherHeat = (baseAnswers.heatExposure || []).filter(
      h => h !== 'hot_baths' && h !== 'laptop_lap' && h !== 'none'
    );
    const nextHeat = [
      ...existingOtherHeat,
      ...(simHeatHotBaths ? ['hot_baths'] : []),
      ...(simHeatLaptop ? ['laptop_lap'] : []),
    ];

    const simulatedAnswers: AssessmentAnswers = {
      ...baseAnswers,
      exerciseDays: simExercise,
      sleepHours: simSleep,
      stressLevel: simStress,
      smoking: simSmoking,
      alcohol: simAlcohol,
      heatExposure: nextHeat.length > 0 ? nextHeat : ['none'],
    };

    return assessRisk(simulatedAnswers);
  }, [baseAnswers, simExercise, simSleep, simStress, simSmoking, simAlcohol, simHeatHotBaths, simHeatLaptop]);

  const beforeMeta = bandStyle[baseResult.band];
  const afterMeta = bandStyle[simulatedResult.band];
  const BeforeIcon = beforeMeta.Icon;
  const AfterIcon = afterMeta.Icon;
  const delta = simulatedResult.score - baseResult.score;

  return (
    <div className="paper-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)] flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[var(--text-main)]">
              Explore What-If Scenarios
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Adjust everyday modifiable habits below to see how our rule-based score responds on your device.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="min-h-[44px] px-3.5 rounded-xl border border-[var(--border-hairline)] hover:border-[var(--border-strong)] text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to yours</span>
        </button>
      </div>

      {/* Before -> After Live Comparison Banner */}
      <div className="surface-panel p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Before */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <div className="text-center sm:text-start">
            <span className="text-xs font-medium text-[var(--text-muted)] block">Current Screening</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                style={{
                  color: beforeMeta.color,
                  backgroundColor: beforeMeta.bg,
                  borderColor: beforeMeta.border,
                }}
              >
                <BeforeIcon className="w-3.5 h-3.5" />
                <span>{baseResult.band}</span>
              </span>
              <span className="text-2xl font-extrabold font-heading text-[var(--text-main)] tabular-nums">
                {baseResult.score}
              </span>
            </div>
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-[var(--brand)] shrink-0 rotate-90 sm:rotate-0 rtl:sm:rotate-180" />

        {/* After */}
        <motion.div
          key={`${simulatedResult.band}-${simulatedResult.score}`}
          initial={shouldReduceMotion ? false : { scale: 0.96, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25 }}
          className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end"
        >
          <div className="text-center sm:text-end">
            <span className="text-xs font-medium text-[var(--text-muted)] block">What-If Scenario</span>
            <div className="flex items-center gap-2 mt-1 justify-center sm:justify-end">
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                style={{
                  color: afterMeta.color,
                  backgroundColor: afterMeta.bg,
                  borderColor: afterMeta.border,
                }}
              >
                <AfterIcon className="w-3.5 h-3.5" />
                <span>{simulatedResult.band}</span>
              </span>
              <span className="text-2xl font-extrabold font-heading text-[var(--text-main)] tabular-nums">
                {simulatedResult.score}
              </span>
              {delta !== 0 && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: delta < 0 ? 'var(--risk-low)' : 'var(--risk-elev)',
                    backgroundColor: delta < 0 ? 'var(--risk-low-bg)' : 'var(--risk-elev-bg)',
                  }}
                >
                  {delta > 0 ? `+${delta}` : delta} pts
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Exercise slider */}
        <div className="p-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface)] space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="whatif-exercise" className="font-semibold text-[var(--text-main)]">
              Exercise Frequency
            </label>
            <span className="font-mono font-bold text-[var(--accent-text)]">{simExercise} days / wk</span>
          </div>
          <input
            id="whatif-exercise"
            type="range"
            min="0"
            max="7"
            step="1"
            value={simExercise}
            onChange={e => setSimExercise(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-lg cursor-pointer accent-[var(--accent)]"
          />
          <div className="flex justify-between text-xs text-[var(--text-muted)]">
            <span>0 (Sedentary)</span>
            <span>3-4 Active</span>
            <span>7 Daily</span>
          </div>
        </div>

        {/* Sleep slider */}
        <div className="p-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface)] space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="whatif-sleep" className="font-semibold text-[var(--text-main)]">
              Average Sleep
            </label>
            <span className="font-mono font-bold text-[var(--accent-text)]">{simSleep} hrs / night</span>
          </div>
          <input
            id="whatif-sleep"
            type="range"
            min="4"
            max="10"
            step="0.5"
            value={simSleep}
            onChange={e => setSimSleep(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg cursor-pointer accent-[var(--accent)]"
          />
          <div className="flex justify-between text-xs text-[var(--text-muted)]">
            <span>4h</span>
            <span>7-8h Typical</span>
            <span>10h</span>
          </div>
        </div>

        {/* Smoking selector */}
        <div className="p-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface)] space-y-2.5">
          <span className="text-sm font-semibold text-[var(--text-main)] block">Smoking or Vaping</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'never', label: 'Never' },
              { id: 'past', label: 'Quit' },
              { id: 'occasional', label: 'Occas.' },
              { id: 'daily', label: 'Daily' },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSimSmoking(opt.id as any)}
                className={`min-h-[44px] px-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  simSmoking === opt.id
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-text)]'
                    : 'bg-[var(--card)] border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alcohol selector */}
        <div className="p-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface)] space-y-2.5">
          <span className="text-sm font-semibold text-[var(--text-main)] block">Alcohol Intake</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'none', label: 'None' },
              { id: 'light', label: 'Light' },
              { id: 'moderate', label: 'Mod.' },
              { id: 'heavy', label: 'Heavy' },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSimAlcohol(opt.id as any)}
                className={`min-h-[44px] px-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  simAlcohol === opt.id
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-text)]'
                    : 'bg-[var(--card)] border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stress 1-5 selector */}
        <div className="p-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface)] space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[var(--text-main)]">Daily Stress Level</span>
            <span className="font-mono text-xs text-[var(--text-muted)]">1 Low – 5 High</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSimStress(lvl)}
                className={`min-h-[44px] rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                  simStress === lvl
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-text)]'
                    : 'bg-[var(--card)] border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Heat exposure toggles */}
        <div className="p-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface)] space-y-2.5">
          <span className="text-sm font-semibold text-[var(--text-main)] block">Heat Exposure Habits</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSimHeatHotBaths(!simHeatHotBaths)}
              className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                simHeatHotBaths
                  ? 'bg-[var(--risk-elev-bg)] border-[var(--risk-elev-border)] text-[var(--risk-elev)]'
                  : 'bg-[var(--card)] border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Hot baths / saunas: {simHeatHotBaths ? 'Yes' : 'No'}
            </button>
            <button
              type="button"
              onClick={() => setSimHeatLaptop(!simHeatLaptop)}
              className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                simHeatLaptop
                  ? 'bg-[var(--risk-elev-bg)] border-[var(--risk-elev-border)] text-[var(--risk-elev)]'
                  : 'bg-[var(--card)] border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Laptop on lap: {simHeatLaptop ? 'Yes' : 'No'}
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory disclaimer */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)] pt-1">
        <Info className="w-4 h-4 text-[var(--brand)] shrink-0" />
        <span>
          <strong className="text-[var(--text-main)]">Illustration only, not medical advice.</strong> Real health changes happen gradually and should be reviewed with a qualified doctor.
        </span>
      </div>
    </div>
  );
};
