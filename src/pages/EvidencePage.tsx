import React, { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';
import { getEvidence } from '../services/api';
import { SyntheticCohortMetrics } from '../types';
import { Reveal, CountUp, usePrefersReducedMotion } from '../motion';
import { PageSkeleton } from '../components/PageSkeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  LabelList,
  CartesianGrid,
} from 'recharts';
import {
  Activity,
  CheckCircle2,
  Scale,
  FileCheck,
  AlertCircle,
  ChevronDown,
  Sliders,
} from 'lucide-react';

export const EvidencePage: React.FC = () => {
  const { t } = useApp();
  const reduced = usePrefersReducedMotion();
  const [metrics, setMetrics] = useState<SyntheticCohortMetrics | null>(null);

  useEffect(() => {
    getEvidence().then(setMetrics);
  }, []);

  if (!metrics) {
    return <PageSkeleton />;
  }

  const triageColors: Record<string, string> = {
    'Self-care': 'var(--risk-low)',
    'Primary care': 'var(--risk-mod)',
    'Andrology/Urology': 'var(--risk-elev)',
    'Fertility service': 'var(--accent)',
    'Urgent assessment': 'var(--risk-urg)',
  };

  const tooltipStyle = {
    backgroundColor: 'var(--card)',
    borderColor: 'var(--border-strong)',
    borderRadius: '14px',
    color: 'var(--text-main)',
    fontSize: '13px',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <Reveal>
        <div className="space-y-2">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-semibold border"
            style={{
              color: 'var(--risk-mod)',
              backgroundColor: 'var(--risk-mod-bg)',
              borderColor: 'var(--risk-mod-border)',
            }}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Simulated evaluation, not real patients</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[var(--text-main)]">
            {t.evidenceTitle}
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            500 synthetic cases run directly through the rule-based screening engine to inspect rule consistency across demographic groups.
          </p>
        </div>
      </Reveal>

      {/* KPI Row with CountUp */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Reveal delay={0.03}>
          <div className="paper-card p-5 space-y-1 h-full">
            <span className="text-xs sm:text-sm text-[var(--text-muted)] block">{t.kpiCompletion}</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--accent-text)]">
              <CountUp value={metrics.completionRate} decimals={1} suffix="%" />
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono">500 simulated</span>
          </div>
        </Reveal>

        <Reveal delay={0.07}>
          <div className="paper-card p-5 space-y-1 h-full">
            <span className="text-xs sm:text-sm text-[var(--text-muted)] block">{t.kpiTime}</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--brand)]">
              <CountUp value={metrics.medianTimeWithHayatMonths} decimals={1} suffix=" mo" />
            </div>
            <span className="text-xs font-mono" style={{ color: 'var(--risk-low)' }}>
              vs 7.5 mo baseline
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.11}>
          <div className="paper-card p-5 space-y-1 h-full">
            <span className="text-xs sm:text-sm text-[var(--text-muted)] block">{t.kpiReferral}</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--accent-text)]">
              <CountUp value={metrics.referralCompletionRate} decimals={1} suffix="%" />
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono">Simulated follow-up</span>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="paper-card p-5 space-y-1 h-full">
            <span className="text-xs sm:text-sm text-[var(--text-muted)] block">{t.kpiTrust}</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-heading" style={{ color: 'var(--risk-low)' }}>
              <CountUp value={metrics.trustScore} decimals={1} suffix=" / 5.0" />
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono">Simulated feedback</span>
          </div>
        </Reveal>

        <Reveal delay={0.19} className="col-span-2 md:col-span-1">
          <div
            className="paper-card p-5 space-y-1 border h-full"
            style={{
              backgroundColor: 'var(--risk-urg-bg)',
              borderColor: 'var(--risk-urg-border)',
            }}
          >
            <span className="text-xs sm:text-sm font-semibold block" style={{ color: 'var(--risk-urg)' }}>
              Red-Flag Safety Rule
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-heading" style={{ color: 'var(--risk-urg)' }}>
              <CountUp value={100} suffix="%" />
            </div>
            <span className="text-xs text-[var(--text-main)] leading-snug block">
              20/20 urgent synthetic cases triggered Urgent Assessment override.
            </span>
          </div>
        </Reveal>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Reveal delay={0.06}>
          <div className="paper-card p-6 sm:p-7 space-y-4">
            <div>
              <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
                Assessment Completion Funnel
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Simulated retention across steps stays above 91%.
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.completionFunnel}
                  layout="vertical"
                  margin={{ left: 10, right: 44, top: 8, bottom: 8 }}
                >
                  <CartesianGrid horizontal={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--chart-axis)" fontSize={12} unit="%" />
                  <YAxis
                    dataKey="step"
                    type="category"
                    stroke="var(--chart-axis)"
                    fontSize={12}
                    width={138}
                    tickLine={false}
                  />
                  <Tooltip formatter={(val: unknown) => [`${val}%`, 'Completion']} contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="completionRate"
                    fill="var(--accent)"
                    radius={[0, 6, 6, 0]}
                    isAnimationActive={!reduced}
                    animationDuration={650}
                  >
                    <LabelList
                      dataKey="completionRate"
                      position="right"
                      formatter={(v: unknown) => `${v}%`}
                      style={{ fill: 'var(--chart-axis)', fontSize: 12, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="paper-card p-6 sm:p-7 space-y-4">
            <div>
              <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
                Median Months to Specialist Evaluation
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Simulated care-pathway timing vs historical delay baseline.
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.timeComparison} margin={{ top: 24, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                  <XAxis dataKey="group" stroke="var(--chart-axis)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--chart-axis)" fontSize={12} unit=" mo" />
                  <Tooltip formatter={(val: unknown) => [`${val} months`, 'Median Duration']} contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="months"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={76}
                    isAnimationActive={!reduced}
                    animationDuration={650}
                  >
                    {metrics.timeComparison.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--brand)' : 'var(--accent)'} />
                    ))}
                    <LabelList
                      dataKey="months"
                      position="top"
                      formatter={(v: unknown) => `${v} mo`}
                      style={{ fill: 'var(--chart-axis)', fontSize: 12, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Triage Distribution */}
      <Reveal delay={0.08}>
        <div className="paper-card p-6 sm:p-7 space-y-4">
          <div>
            <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
              Triage Distribution Across 500 Simulated Cases
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Live output distribution produced by the deterministic rule engine.
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.triageDistribution} margin={{ top: 24, right: 20, left: 10, bottom: 16 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="level"
                  stroke="var(--chart-axis)"
                  fontSize={12}
                  tickLine={false}
                  interval={0}
                />
                <YAxis stroke="var(--chart-axis)" fontSize={12} unit="%" />
                <Tooltip formatter={(val: unknown) => [`${val}%`, 'Share of cases']} contentStyle={tooltipStyle} />
                <Bar
                  dataKey="percentage"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={68}
                  isAnimationActive={!reduced}
                  animationDuration={650}
                >
                  {metrics.triageDistribution.map((entry, index) => (
                    <Cell key={`triage-${index}`} fill={triageColors[entry.level] || 'var(--accent)'} />
                  ))}
                  <LabelList
                    dataKey="percentage"
                    position="top"
                    formatter={(v: unknown) => `${v}%`}
                    style={{ fill: 'var(--chart-axis)', fontSize: 12, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Reveal>

      {/* Fairness & Consistency Check */}
      <Reveal delay={0.08}>
        <div className="paper-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[var(--accent-text)]" />
                <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
                  Demographic Fairness &amp; Consistency Check
                </h2>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Checking rule consistency across age groups and interface languages.
              </p>
            </div>

            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-semibold w-fit"
              style={{
                color: 'var(--risk-low)',
                backgroundColor: 'var(--risk-low-bg)',
                borderColor: 'var(--risk-low-border)',
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Max gap: {metrics.maxGapPercentage} percentage points (&lt; 5 pp target)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="surface-panel p-4 sm:p-5 space-y-3">
              <h3 className="text-sm font-bold text-[var(--text-main)]">Simulated Consistency by Age Bracket</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.fairnessByAge} margin={{ top: 14, right: 12, left: 0, bottom: 5 }}>
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" stroke="var(--chart-axis)" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="var(--chart-axis)" fontSize={12} unit="%" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="completion"
                      fill="var(--accent)"
                      name="Completion Rate"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={!reduced}
                      animationDuration={650}
                    />
                    <Bar
                      dataKey="triageAccuracy"
                      fill="var(--brand)"
                      name="Rule Consistency"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={!reduced}
                      animationDuration={650}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="surface-panel p-4 sm:p-5 space-y-3">
              <h3 className="text-sm font-bold text-[var(--text-main)]">Simulated Consistency by Language</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.fairnessByLanguage} margin={{ top: 14, right: 12, left: 0, bottom: 5 }}>
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                    <XAxis dataKey="language" stroke="var(--chart-axis)" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="var(--chart-axis)" fontSize={12} unit="%" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="completion"
                      fill="var(--accent)"
                      name="Completion Rate"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={!reduced}
                      animationDuration={650}
                    />
                    <Bar
                      dataKey="triageAccuracy"
                      fill="var(--brand)"
                      name="Rule Consistency"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={!reduced}
                      animationDuration={650}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Model Assumptions Accordion */}
      {metrics.assumptions && metrics.assumptions.length > 0 && (
        <Reveal delay={0.08}>
          <div className="paper-card p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--accent-text)]" />
                <h2 className="text-lg font-bold font-heading text-[var(--text-main)]">
                  {t.assumptionsTitle}
                </h2>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface)] px-2.5 py-1 rounded-full border border-[var(--border-hairline)]">
                {metrics.assumptions.length} documented assumptions
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Transparently stating our simulation parameters, benchmark references, and clinical boundaries.
            </p>

            <div className="space-y-3 pt-2">
              {metrics.assumptions.map(item => (
                <details
                  key={item.id}
                  className="group rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] overflow-hidden"
                >
                  <summary className="p-4 flex items-center justify-between cursor-pointer list-none select-none hover:bg-[var(--card-alt)] transition-colors">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-semibold text-sm sm:text-base text-[var(--text-main)]">{item.label}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--border-hairline)]">
                        {item.value}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 group-open:rotate-180 shrink-0" />
                  </summary>
                  <div className="p-4 pt-0 text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-hairline)] bg-[var(--card)]">
                    {item.description}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Honest Method and Limits Panel */}
      <Reveal delay={0.08}>
        <div className="paper-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-[var(--text-main)]">
            <FileCheck className="w-5 h-5 text-[var(--accent-text)] shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold font-heading">
              Method and limits
            </h2>
          </div>

          <div className="p-4 rounded-2xl surface-panel flex items-start gap-3 text-sm sm:text-base text-[var(--text-main)]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--risk-mod)' }} />
            <p className="leading-relaxed">
              <strong>Important honesty note:</strong> These simulated figures illustrate how the HAYAT rule set behaves across 500 synthetic profiles and{' '}
              <strong>do not establish real-world clinical performance, diagnostic sensitivity, or patient outcomes.</strong>
            </p>
          </div>

          <div className="space-y-2.5 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            <p>
              • Each of the 500 profiles was generated deterministically with seeded distributions and evaluated on-device by{' '}
              <code className="text-[var(--accent-text)] font-mono">assessRisk</code>.
            </p>
            <p>
              • Every simulated case carrying an acute symptom (20/20) triggered the deterministic Urgent Assessment override by design.
            </p>
            <p>
              • Prospective clinical studies with real patient cohorts and licensed clinicians would be required before any clinical deployment.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
};
