import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { calculateBmi } from '../engine/riskEngine';
import { AssessmentAnswers } from '../types';
import { DURATIONS, HAYAT_EASE, usePrefersReducedMotion } from '../motion';
import {
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Info,
  AlertTriangle,
  Heart,
  SkipForward,
} from 'lucide-react';

type QuestionType =
  | 'single'
  | 'multi'
  | 'slider'
  | 'body_bmi'
  | 'journey_note'
  | 'semen_inputs';

interface SingleOption {
  id: string;
  label: string;
}

interface WizardQuestion {
  id: string;
  chapterIndex: number;
  chapterTitle: string;
  title: string;
  subtitle?: string;
  whyWeAsk: string;
  type: QuestionType;
  field?: keyof AssessmentAnswers;
  options?: SingleOption[];
  min?: number;
  max?: number;
  step?: number;
  unitLabel?: string;
  minLabel?: string;
  midLabel?: string;
  maxLabel?: string;
  defaultVal?: number;
  isRedFlag?: boolean;
}

const AnimatedCheckMark: React.FC<{ color?: string; reduced: boolean }> = ({
  color = 'var(--accent-text)',
  reduced,
}) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
    <motion.path
      d="M5 12.5 L10 17.5 L19 7.5"
      fill="none"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={reduced ? false : { pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.25, ease: HAYAT_EASE }}
    />
  </svg>
);

export const WizardPage: React.FC = () => {
  const { t, language, answers, setAnswer, consent } = useApp();
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const isRtl = language === 'ar';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [whyOpen, setWhyOpen] = useState(false);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const clearPendingAdvance = () => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearPendingAdvance();
  }, []);

  const questions: WizardQuestion[] = useMemo(() => {
    const list: WizardQuestion[] = [
      {
        id: 'ageRange',
        chapterIndex: 1,
        chapterTitle: t.step1Title,
        title: 'What is your age range?',
        subtitle: 'Baseline age helps contextualize typical hormonal and reproductive patterns.',
        whyWeAsk: 'Paternal age can subtly influence semen volume, cellular markers, and natural conception timelines.',
        type: 'single',
        field: 'ageRange',
        options: [
          { id: '18-24', label: '18 to 24 years' },
          { id: '25-29', label: '25 to 29 years' },
          { id: '30-34', label: '30 to 34 years' },
          { id: '35-39', label: '35 to 39 years' },
          { id: '40-44', label: '40 to 44 years' },
          { id: '45+', label: '45 years or older' },
        ],
      },
      {
        id: 'familyPlanning',
        chapterIndex: 1,
        chapterTitle: t.step1Title,
        title: 'Are you planning or trying for a family?',
        subtitle: 'There is no right or wrong answer—this simply shapes how we frame your guidance.',
        whyWeAsk: 'This tailors recommendations between general wellness, future preparation, or active conception timelines.',
        type: 'single',
        field: 'familyPlanning',
        options: [
          { id: 'not_now', label: 'Not right now / General wellness' },
          { id: 'planning', label: 'Planning for the future (next 1–2 years)' },
          { id: 'trying', label: 'Actively trying currently' },
        ],
      },
    ];

    if (answers.familyPlanning === 'trying') {
      list.push({
        id: 'tryingDuration',
        chapterIndex: 2,
        chapterTitle: t.step2Title,
        title: 'How long have you been actively trying to conceive?',
        subtitle: 'Conception timelines guide whether standard waiting or a specialist check-in is suggested.',
        whyWeAsk: 'International clinical guidelines use 12 months as a common threshold to suggest routine joint evaluation.',
        type: 'single',
        field: 'tryingDuration',
        options: [
          { id: 'under_3', label: 'Under 3 months' },
          { id: '3_6', label: '3 to 6 months' },
          { id: '6_12', label: '6 to 12 months' },
          { id: 'over_12', label: 'Over 12 months' },
        ],
      });
    } else {
      list.push({
        id: 'journeyNote',
        chapterIndex: 2,
        chapterTitle: t.step2Title,
        title:
          answers.familyPlanning === 'planning'
            ? 'Planning ahead is a great time to check in.'
            : 'Focusing on everyday reproductive wellness.',
        subtitle:
          answers.familyPlanning === 'planning'
            ? 'Optimizing everyday sleep, heat exposure, and metabolic habits 3+ months in advance gives your body a strong runway.'
            : 'Checking baseline habits early supports long-term energy, hormone balance, and future options.',
        whyWeAsk: 'Because you are not actively trying right now, we skip timing questions so your screening only weighs relevant factors.',
        type: 'journey_note',
      });
    }

    list.push(
      {
        id: 'partnerAssessed',
        chapterIndex: 2,
        chapterTitle: t.step2Title,
        title: 'Has a partner undergone medical fertility evaluation?',
        whyWeAsk: 'Fertility is shared. Checking male factors early prevents one-sided delays when both partners are planning.',
        type: 'single',
        field: 'partnerAssessed',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
          { id: 'not_applicable', label: 'Not applicable' },
        ],
      },
      {
        id: 'earlierTests',
        chapterIndex: 2,
        chapterTitle: t.step2Title,
        title: 'Have you had any earlier fertility or hormone tests yourself?',
        whyWeAsk: 'Knowing whether you have prior baseline bloodwork or semen testing helps focus next-step recommendations.',
        type: 'single',
        field: 'earlierTests',
        options: [
          { id: 'none', label: 'None yet' },
          { id: 'semen', label: 'Semen analysis' },
          { id: 'hormone', label: 'Blood hormone panel' },
          { id: 'other', label: 'Other tests' },
        ],
      },
      {
        id: 'smoking',
        chapterIndex: 3,
        chapterTitle: t.step3Title,
        title: 'Do you smoke or vape (cigarettes, shisha, or nicotine)?',
        whyWeAsk: 'Nicotine and smoke may raise oxidative stress, which can affect cellular markers over a 72–90 day cycle.',
        type: 'single',
        field: 'smoking',
        options: [
          { id: 'never', label: 'Never' },
          { id: 'past', label: 'Past (quit)' },
          { id: 'occasional', label: 'Occasional' },
          { id: 'daily', label: 'Daily' },
        ],
      },
      {
        id: 'alcohol',
        chapterIndex: 3,
        chapterTitle: t.step3Title,
        title: 'How would you describe your alcohol intake?',
        whyWeAsk: 'Higher alcohol intake is associated with shifts in sleep architecture, liver metabolism, and hormone balance.',
        type: 'single',
        field: 'alcohol',
        options: [
          { id: 'none', label: 'None' },
          { id: 'light', label: 'Light (rare)' },
          { id: 'moderate', label: 'Moderate (weekly)' },
          { id: 'heavy', label: 'Heavy' },
        ],
      },
      {
        id: 'sleepHours',
        chapterIndex: 3,
        chapterTitle: t.step3Title,
        title: 'How many hours of sleep do you typically get per night?',
        whyWeAsk: 'Most daily testosterone synthesis takes place during deep, uninterrupted nocturnal sleep.',
        type: 'slider',
        field: 'sleepHours',
        min: 4,
        max: 10,
        step: 0.5,
        defaultVal: 7,
        unitLabel: 'hours / night',
        minLabel: '4 hrs',
        midLabel: '7–8 hrs typical',
        maxLabel: '10 hrs',
      },
      {
        id: 'stressLevel',
        chapterIndex: 3,
        chapterTitle: t.step3Title,
        title: 'How would you rate your everyday stress level?',
        subtitle: '1 = Very calm & manageable, 5 = Consistently overwhelmed or high strain.',
        whyWeAsk: 'Sustained high stress can elevate cortisol levels, which may subtly dampen reproductive hormone signaling.',
        type: 'single',
        field: 'stressLevel',
        options: [
          { id: '1', label: '1 — Very low / calm' },
          { id: '2', label: '2 — Mild' },
          { id: '3', label: '3 — Moderate' },
          { id: '4', label: '4 — High' },
          { id: '5', label: '5 — Very high' },
        ],
      },
      {
        id: 'exerciseDays',
        chapterIndex: 3,
        chapterTitle: t.step3Title,
        title: 'How many days per week do you do moderate exercise?',
        whyWeAsk: 'Regular movement supports insulin sensitivity, circulation, and natural antioxidant defenses.',
        type: 'slider',
        field: 'exerciseDays',
        min: 0,
        max: 7,
        step: 1,
        defaultVal: 3,
        unitLabel: 'days / week',
        minLabel: '0 (Sedentary)',
        midLabel: '3–4 days Active',
        maxLabel: '7 Daily',
      },
      {
        id: 'recreationalSubstances',
        chapterIndex: 3,
        chapterTitle: t.step3Title,
        title: 'Any recreational substance use?',
        whyWeAsk: 'Certain substances may interact with reproductive receptors and cellular wellness. Answered privately without judgement.',
        type: 'single',
        field: 'recreationalSubstances',
        options: [
          { id: 'none', label: 'None' },
          { id: 'occasional', label: 'Occasional' },
          { id: 'regular', label: 'Regular' },
        ],
      },
      {
        id: 'heatExposure',
        chapterIndex: 3,
        chapterTitle: t.step3Title,
        title: 'Do you have frequent scrotal heat exposure?',
        subtitle: 'Select all that apply, then continue.',
        whyWeAsk: 'Healthy sperm development requires a temperature 2°C–4°C cooler than core body temperature.',
        type: 'multi',
        field: 'heatExposure',
        options: [
          { id: 'hot_baths', label: 'Frequent hot baths, jacuzzis, or saunas' },
          { id: 'laptop_lap', label: 'Resting a warm laptop directly on the lap' },
          { id: 'hot_work', label: 'Working in a high-heat environment' },
          { id: 'none', label: 'None of these apply' },
        ],
      },
      {
        id: 'supplementsSteroids',
        chapterIndex: 3,
        chapterTitle: t.step3Title,
        title: 'Have you used testosterone therapy or anabolic supplements?',
        whyWeAsk: 'External testosterone can signal the brain to pause natural LH/FSH signals, temporarily lowering sperm production.',
        type: 'single',
        field: 'supplementsSteroids',
        options: [
          { id: 'none', label: 'Never used' },
          { id: 'past', label: 'Used in the past' },
          { id: 'current', label: 'Currently using' },
        ],
      },
      {
        id: 'bodyBmi',
        chapterIndex: 4,
        chapterTitle: t.step4Title,
        title: 'What are your approximate height and weight?',
        subtitle: 'Completely optional—used gently on-device to estimate metabolic proportion.',
        whyWeAsk: 'Metabolic balance influences how the body processes androgens and estrogens.',
        type: 'body_bmi',
      },
      {
        id: 'waistConcern',
        chapterIndex: 4,
        chapterTitle: t.step4Title,
        title: 'Do you have any concern about waist circumference or central weight?',
        whyWeAsk: 'Central body fat can offer helpful extra context about insulin sensitivity and metabolic load.',
        type: 'single',
        field: 'waistConcern',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
      },
      {
        id: 'conditions',
        chapterIndex: 4,
        chapterTitle: t.step4Title,
        title: 'Have you been diagnosed with any of these metabolic conditions?',
        subtitle: 'Select all that apply.',
        whyWeAsk: 'Blood sugar, blood pressure, and thyroid levels all interact closely with reproductive hormone signaling.',
        type: 'multi',
        field: 'conditions',
        options: [
          { id: 'diabetes', label: 'Diabetes or elevated blood sugar' },
          { id: 'hypertension', label: 'High blood pressure' },
          { id: 'thyroid', label: 'Thyroid condition' },
          { id: 'cholesterol', label: 'Elevated cholesterol / lipids' },
          { id: 'none', label: 'None diagnosed' },
        ],
      },
      {
        id: 'pastMumps',
        chapterIndex: 5,
        chapterTitle: t.step5Title,
        title: 'Did you have mumps during adolescence or childhood?',
        whyWeAsk: 'Mumps after puberty can occasionally affect testicular tissue; sharing this helps guide routine baseline checks.',
        type: 'single',
        field: 'pastMumps',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
          { id: 'not_sure', label: 'Not sure' },
        ],
      },
      {
        id: 'pastInfection',
        chapterIndex: 5,
        chapterTitle: t.step5Title,
        title: 'Have you had a past urinary or genital tract infection?',
        whyWeAsk: 'Previous infections can occasionally leave mild inflammation that a doctor can check easily.',
        type: 'single',
        field: 'pastInfection',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
          { id: 'not_sure', label: 'Not sure' },
        ],
      },
      {
        id: 'pastSurgeryInjury',
        chapterIndex: 5,
        chapterTitle: t.step5Title,
        title: 'Any prior groin hernia repair, scrotal surgery, or sports injury?',
        whyWeAsk: 'Groin procedures or injuries can occasionally affect local blood supply or structural pathways.',
        type: 'single',
        field: 'pastSurgeryInjury',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
          { id: 'not_sure', label: 'Not sure' },
        ],
      },
      {
        id: 'undescendedTesticle',
        chapterIndex: 5,
        chapterTitle: t.step5Title,
        title: 'History of an undescended testicle in infancy or childhood?',
        whyWeAsk: 'Even when corrected early in childhood, clinicians often suggest a simple baseline semen check.',
        type: 'single',
        field: 'undescendedTesticle',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
          { id: 'not_sure', label: 'Not sure' },
        ],
      },
      {
        id: 'currentSymptoms',
        chapterIndex: 5,
        chapterTitle: t.step5Title,
        title: 'Are you experiencing any ongoing physical symptoms?',
        subtitle: 'Select any that apply.',
        whyWeAsk: 'Heaviness or swollen scrotal veins can point toward a common, treatable condition called a varicocele.',
        type: 'multi',
        field: 'currentSymptoms',
        options: [
          { id: 'heaviness_veins', label: 'Heaviness or swollen veins ("bag of worms" feeling)' },
          { id: 'dull_ache', label: 'Dull ache after standing or physical exertion' },
          { id: 'low_libido', label: 'Noticeable drop in sex drive' },
          { id: 'erection_difficulty', label: 'Difficulty achieving or maintaining erections' },
          { id: 'none', label: 'None of these symptoms' },
        ],
      },
      {
        id: 'redFlagSymptoms',
        chapterIndex: 5,
        chapterTitle: t.step5Title,
        title: 'Safety check: any urgent or sudden symptoms right now?',
        subtitle: 'If any apply, our safety rule prioritizes immediate same-day in-person care.',
        whyWeAsk: 'Sudden pain, rapid swelling, fever, or a firm painless lump need prompt physical exam by a doctor.',
        type: 'multi',
        field: 'redFlagSymptoms',
        isRedFlag: true,
        options: [
          { id: 'severe_pain', label: 'Sudden severe testicular pain' },
          { id: 'rapid_swelling', label: 'Rapid swelling of the scrotum' },
          { id: 'fever_pain', label: 'Fever accompanied by testicular ache' },
          { id: 'blood_in_semen', label: 'Visible blood in semen' },
          { id: 'hard_painless_lump', label: 'A hard, firm painless testicular lump' },
          { id: 'none', label: 'None of these red flags apply' },
        ],
      },
      {
        id: 'hasSemenAnalysis',
        chapterIndex: 6,
        chapterTitle: t.step6Title,
        title: 'Do you have semen analysis numbers you would like to include?',
        subtitle: 'Completely optional. If not, we generate your screening directly from your profile.',
        whyWeAsk: 'When available, we compare your lab values against WHO 2021 reference limits.',
        type: 'single',
        field: 'hasSemenAnalysis',
        options: [
          { id: 'yes', label: 'Yes — enter my lab numbers' },
          { id: 'no', label: 'No — finish my screening now' },
        ],
      }
    );

    if (answers.hasSemenAnalysis) {
      list.push({
        id: 'semenNumbers',
        chapterIndex: 6,
        chapterTitle: t.step6Title,
        title: 'Enter whichever semen analysis figures you have',
        subtitle: 'Leave any field blank if your lab report did not list it. Reference benchmarks follow WHO 2021 limits.',
        whyWeAsk: 'Multiple metrics together give better context than any single lab number alone.',
        type: 'semen_inputs',
      });
    }

    return list;
  }, [answers.familyPlanning, answers.hasSemenAnalysis, t]);

  const safeIdx = Math.min(currentIdx, questions.length - 1);
  const currentQ = questions[safeIdx];

  if (!consent.processAnswers) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center paper-card space-y-4">
        <Info className="w-9 h-9 text-[var(--accent-text)] mx-auto" />
        <h2 className="text-xl font-bold font-heading text-[var(--text-main)]">Consent is Required First</h2>
        <p className="text-base text-[var(--text-muted)]">
          Please review and accept processing terms so we can safely compute your screening.
        </p>
        <button
          type="button"
          onClick={() => navigate('/consent')}
          className="px-6 min-h-[48px] rounded-2xl bg-[var(--accent)] text-white text-base font-semibold hover:opacity-95 cursor-pointer"
        >
          Review Consent Terms
        </button>
      </div>
    );
  }

  const goToIndex = (nextIdx: number, dir: 1 | -1) => {
    clearPendingAdvance();
    setWhyOpen(false);
    setDirection(dir);
    if (nextIdx >= questions.length) {
      navigate('/analysing');
    } else if (nextIdx < 0) {
      navigate('/consent');
    } else {
      setCurrentIdx(nextIdx);
    }
  };

  const handleNext = () => {
    goToIndex(safeIdx + 1, 1);
  };

  const handleBack = () => {
    goToIndex(safeIdx - 1, -1);
  };

  const handleSingleSelect = (q: WizardQuestion, optionId: string) => {
    if (!q.field) return;

    if (q.id === 'stressLevel') {
      setAnswer('stressLevel', parseInt(optionId, 10));
    } else if (q.id === 'hasSemenAnalysis') {
      const wantsLab = optionId === 'yes';
      setAnswer('hasSemenAnalysis', wantsLab);
      clearPendingAdvance();
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        setWhyOpen(false);
        setDirection(1);
        if (wantsLab) {
          setCurrentIdx(safeIdx + 1);
        } else {
          navigate('/analysing');
        }
      }, 260);
      return;
    } else {
      setAnswer(q.field, optionId as any);
      if (q.id === 'familyPlanning' && optionId !== 'trying') {
        setAnswer('tryingDuration', undefined);
      }
    }

    clearPendingAdvance();
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      goToIndex(safeIdx + 1, 1);
    }, 260);
  };

  const handleSkipQuestion = (q: WizardQuestion) => {
    clearPendingAdvance();
    if (q.id === 'hasSemenAnalysis') {
      setAnswer('hasSemenAnalysis', false);
      navigate('/analysing');
      return;
    }
    if (q.id === 'bodyBmi') {
      setAnswer('heightCm', undefined);
      setAnswer('weightKg', undefined);
    } else if (q.id === 'semenNumbers') {
      setAnswer('semenVolume', undefined);
      setAnswer('spermConcentration', undefined);
      setAnswer('totalMotility', undefined);
      setAnswer('progressiveMotility', undefined);
    } else if (q.type === 'multi' && q.field) {
      setAnswer(q.field, ['none'] as any);
    } else if (q.id === 'sleepHours' || q.id === 'exerciseDays' || q.id === 'stressLevel') {
      if (q.field) setAnswer(q.field, undefined);
    } else if (q.field) {
      setAnswer(q.field, 'prefer_not_to_say' as any);
      if (q.id === 'familyPlanning') {
        setAnswer('tryingDuration', undefined);
      }
    }
    goToIndex(safeIdx + 1, 1);
  };

  const toggleMultiSelect = (
    key: 'heatExposure' | 'conditions' | 'currentSymptoms' | 'redFlagSymptoms',
    val: string
  ) => {
    const current = (answers[key] || []) as string[];
    if (val === 'none') {
      setAnswer(key, ['none'] as any);
      return;
    }
    const filtered = current.filter(item => item !== 'none');
    if (filtered.includes(val)) {
      const next = filtered.filter(item => item !== val);
      setAnswer(key, (next.length === 0 ? ['none'] : next) as any);
    } else {
      setAnswer(key, [...filtered, val] as any);
    }
  };

  // Keyboard shortcuts: STRICTLY disabled while any input, slider, select, or textarea is focused!
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const targetEl = e.target as HTMLElement | null;
      const checkEl = activeEl || targetEl;

      if (checkEl) {
        const tag = checkEl.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          checkEl.getAttribute('role') === 'slider' ||
          checkEl.isContentEditable
        ) {
          return;
        }
      }

      if (e.key >= '1' && e.key <= '9' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const optionIdx = parseInt(e.key, 10) - 1;
        if (currentQ.options && optionIdx < currentQ.options.length) {
          e.preventDefault();
          const chosen = currentQ.options[optionIdx];
          if (currentQ.type === 'single') {
            handleSingleSelect(currentQ, chosen.id);
          } else if (currentQ.type === 'multi' && currentQ.field) {
            toggleMultiSelect(currentQ.field as any, chosen.id);
          }
        }
      } else if (e.key === 'Enter' && targetEl?.tagName !== 'BUTTON' && targetEl?.tagName !== 'A') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const progressRatio = (safeIdx + 1) / questions.length;
  const bmi = calculateBmi(answers.heightCm, answers.weightKg);

  // RTL-aware slide direction: in LTR forward slides left (enter x: +28, exit x: -28); in RTL Arabic mirrors cleanly!
  const rtlSign = isRtl ? -1 : 1;
  const enterX = direction * 28 * rtlSign;
  const exitX = direction * -28 * rtlSign;

  const isOptionSelected = (q: WizardQuestion, optId: string): boolean => {
    if (!q.field) return false;
    if (q.id === 'stressLevel') {
      return answers.stressLevel === parseInt(optId, 10);
    }
    if (q.id === 'hasSemenAnalysis') {
      return (optId === 'yes' && answers.hasSemenAnalysis === true) || (optId === 'no' && answers.hasSemenAnalysis === false);
    }
    if (q.type === 'multi') {
      return ((answers[q.field] as string[]) || []).includes(optId);
    }
    return answers[q.field] === optId;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10 space-y-6">
      {/* Thin Wave-Line Progress Indicator (Mirrors cleanly in RTL) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-mono font-semibold text-[var(--accent-text)]">
            Question {safeIdx + 1} of {questions.length}
          </span>
          <span className="text-xs sm:text-sm font-medium px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border-hairline)] text-[var(--text-muted)]">
            Part {currentQ.chapterIndex} of 6 · {currentQ.chapterTitle}
          </span>
        </div>

        <div
          className="relative w-full h-5 flex items-center overflow-hidden"
          role="progressbar"
          aria-valuenow={safeIdx + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-label={`Question ${safeIdx + 1} of ${questions.length}`}
        >
          <svg
            viewBox="0 0 600 18"
            preserveAspectRatio="none"
            className="w-full h-4 overflow-visible rtl:scale-x-[-1]"
          >
            <defs>
              <clipPath id="hayat-wave-clip">
                <rect
                  x="0"
                  y="0"
                  width={Math.max(12, progressRatio * 600)}
                  height="18"
                  style={{
                    transition: reduced ? 'none' : 'width 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </clipPath>
            </defs>
            <path
              d="M0 9 Q 25 3, 50 9 T 100 9 T 150 9 T 200 9 T 250 9 T 300 9 T 350 9 T 400 9 T 450 9 T 500 9 T 550 9 T 600 9"
              fill="none"
              stroke="var(--gauge-track)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M0 9 Q 25 3, 50 9 T 100 9 T 150 9 T 200 9 T 250 9 T 300 9 T 350 9 T 400 9 T 450 9 T 500 9 T 550 9 T 600 9"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3.5"
              strokeLinecap="round"
              clipPath="url(#hayat-wave-clip)"
            />
          </svg>
        </div>
      </div>

      {/* Main Single-Question Paper Card */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentQ.id}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: enterX }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: exitX }}
          transition={
            reduced
              ? { duration: 0.16 }
              : { duration: DURATIONS.fast, ease: HAYAT_EASE }
          }
          className="paper-card p-6 sm:p-10 space-y-6"
        >
          <div className="space-y-3">
            {currentQ.isRedFlag && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                style={{
                  color: 'var(--risk-urg)',
                  backgroundColor: 'var(--risk-urg-bg)',
                  borderColor: 'var(--risk-urg-border)',
                }}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Safety Priority Check</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-main)] leading-snug">
              {currentQ.title}
            </h1>

            {currentQ.subtitle && (
              <p className="text-base text-[var(--text-muted)] leading-relaxed">
                {currentQ.subtitle}
              </p>
            )}

            <div>
              <button
                type="button"
                onClick={() => setWhyOpen(!whyOpen)}
                aria-expanded={whyOpen}
                className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold text-[var(--accent-text)] hover:underline cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>{t.whyWeAsk}</span>
              </button>
              <AnimatePresence initial={false}>
                {whyOpen && (
                  <motion.div
                    initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={reduced ? { duration: 0.15 } : { duration: 0.25, ease: HAYAT_EASE }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                      {currentQ.whyWeAsk}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {currentQ.type === 'single' && currentQ.options && (
            <div className="grid gap-3">
              {currentQ.options.map((opt, idx) => {
                const selected = isOptionSelected(currentQ, opt.id);
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileTap={reduced ? undefined : { scale: 0.99 }}
                    onClick={() => handleSingleSelect(currentQ, opt.id)}
                    className={`w-full min-h-[56px] px-5 py-3.5 rounded-2xl border text-start flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-main)] shadow-xs'
                        : 'bg-[var(--surface)] border-[var(--border-hairline)] text-[var(--text-main)] hover:border-[var(--border-strong)] hover:bg-[var(--card-alt)]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 border transition-colors ${
                          selected
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                            : 'bg-[var(--card)] text-[var(--text-muted)] border-[var(--border-hairline)]'
                        }`}
                        aria-hidden="true"
                      >
                        {idx + 1}
                      </span>
                      <span className="text-base font-medium">{opt.label}</span>
                    </div>
                    {selected && <AnimatedCheckMark reduced={reduced} />}
                  </motion.button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'multi' && currentQ.options && currentQ.field && (
            <div className="grid gap-3">
              {currentQ.options.map((opt, idx) => {
                const selected = isOptionSelected(currentQ, opt.id);
                const urgentChoice = currentQ.isRedFlag && opt.id !== 'none' && selected;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileTap={reduced ? undefined : { scale: 0.99 }}
                    onClick={() => toggleMultiSelect(currentQ.field as any, opt.id)}
                    className="w-full min-h-[56px] px-5 py-3.5 rounded-2xl border text-start flex items-center justify-between gap-3 transition-colors cursor-pointer"
                    style={
                      urgentChoice
                        ? {
                            backgroundColor: 'var(--risk-urg-bg)',
                            borderColor: 'var(--risk-urg)',
                            color: 'var(--text-main)',
                          }
                        : selected
                        ? {
                            backgroundColor: 'var(--accent-soft)',
                            borderColor: 'var(--accent)',
                            color: 'var(--text-main)',
                          }
                        : {
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border-hairline)',
                            color: 'var(--text-main)',
                          }
                    }
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 border transition-colors ${
                          selected
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                            : 'bg-[var(--card)] text-[var(--text-muted)] border-[var(--border-hairline)]'
                        }`}
                        aria-hidden="true"
                      >
                        {idx + 1}
                      </span>
                      <span className="text-base font-medium">{opt.label}</span>
                    </div>
                    {selected && (
                      <AnimatedCheckMark
                        color={urgentChoice ? 'var(--risk-urg)' : 'var(--accent-text)'}
                        reduced={reduced}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'slider' && currentQ.field && (
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] space-y-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-[var(--text-muted)]">Selected value</span>
                <span className="text-3xl font-extrabold font-heading text-[var(--accent-text)] tabular-nums">
                  {(answers[currentQ.field] as number | undefined) ?? currentQ.defaultVal}{' '}
                  <span className="text-base font-normal text-[var(--text-muted)]">{currentQ.unitLabel}</span>
                </span>
              </div>

              <input
                type="range"
                min={currentQ.min}
                max={currentQ.max}
                step={currentQ.step}
                value={(answers[currentQ.field] as number | undefined) ?? currentQ.defaultVal}
                onChange={e => setAnswer(currentQ.field!, parseFloat(e.target.value) as any)}
                aria-label={currentQ.title}
                className="w-full h-3 rounded-lg cursor-pointer accent-[var(--accent)]"
              />

              <div className="flex justify-between text-xs sm:text-sm text-[var(--text-muted)]">
                <span>{currentQ.minLabel}</span>
                <span>{currentQ.midLabel}</span>
                <span>{currentQ.maxLabel}</span>
              </div>
            </div>
          )}

          {currentQ.type === 'journey_note' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-hairline)] flex items-start gap-3.5">
              <Heart className="w-6 h-6 text-[var(--accent-text)] shrink-0 mt-0.5" />
              <div className="text-base text-[var(--text-main)] leading-relaxed">
                You are checking in at a great stage. Press <strong>Continue</strong> to review partner and prior test context.
              </div>
            </div>
          )}

          {currentQ.type === 'body_bmi' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="wizard-height" className="text-sm font-semibold text-[var(--text-main)] block">
                    Height (cm)
                  </label>
                  <input
                    id="wizard-height"
                    type="number"
                    placeholder="e.g. 178"
                    value={answers.heightCm || ''}
                    onChange={e => setAnswer('heightCm', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full min-h-[52px] px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] text-base text-[var(--text-main)] focus:border-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="wizard-weight" className="text-sm font-semibold text-[var(--text-main)] block">
                    Weight (kg)
                  </label>
                  <input
                    id="wizard-weight"
                    type="number"
                    placeholder="e.g. 78"
                    value={answers.weightKg || ''}
                    onChange={e => setAnswer('weightKg', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full min-h-[52px] px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] text-base text-[var(--text-main)] focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {bmi !== undefined && (
                <div className="p-4 rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-2 text-base">
                  <span className="text-[var(--text-muted)]">
                    Your BMI is about <strong className="text-[var(--text-main)]">{bmi}</strong>
                  </span>
                  <span className="font-semibold text-[var(--accent-text)]">
                    {bmi >= 30
                      ? 'In the higher range'
                      : bmi >= 25
                      ? 'Slightly above typical'
                      : 'In the typical range'}
                  </span>
                </div>
              )}
            </div>
          )}

          {currentQ.type === 'semen_inputs' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="semen-vol" className="text-sm font-semibold text-[var(--text-main)] block">
                  Ejaculate Volume (mL) <span className="text-xs font-normal text-[var(--text-muted)]">Ref ≥ 1.4</span>
                </label>
                <input
                  id="semen-vol"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={answers.semenVolume || ''}
                  onChange={e => setAnswer('semenVolume', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full min-h-[52px] px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] text-base text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="semen-conc" className="text-sm font-semibold text-[var(--text-main)] block">
                  Sperm Concentration (M/mL) <span className="text-xs font-normal text-[var(--text-muted)]">Ref ≥ 16</span>
                </label>
                <input
                  id="semen-conc"
                  type="number"
                  step="1"
                  placeholder="e.g. 35"
                  value={answers.spermConcentration || ''}
                  onChange={e => setAnswer('spermConcentration', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full min-h-[52px] px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] text-base text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="semen-tot-mot" className="text-sm font-semibold text-[var(--text-main)] block">
                  Total Motility (%) <span className="text-xs font-normal text-[var(--text-muted)]">Ref ≥ 42%</span>
                </label>
                <input
                  id="semen-tot-mot"
                  type="number"
                  step="1"
                  placeholder="e.g. 55"
                  value={answers.totalMotility || ''}
                  onChange={e => setAnswer('totalMotility', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full min-h-[52px] px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] text-base text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="semen-prog-mot" className="text-sm font-semibold text-[var(--text-main)] block">
                  Progressive Motility (%) <span className="text-xs font-normal text-[var(--text-muted)]">Ref ≥ 30%</span>
                </label>
                <input
                  id="semen-prog-mot"
                  type="number"
                  step="1"
                  placeholder="e.g. 40"
                  value={answers.progressiveMotility || ''}
                  onChange={e => setAnswer('progressiveMotility', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full min-h-[52px] px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-hairline)] text-base text-[var(--text-main)]"
                />
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="pt-5 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="min-h-[48px] px-4 rounded-2xl border border-[var(--border-hairline)] text-sm sm:text-base font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{t.back}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2.5 ms-auto">
              <button
                type="button"
                onClick={() => handleSkipQuestion(currentQ)}
                className="min-h-[48px] px-4 rounded-2xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border-hairline)] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>
                  {t.preferNotToSay} / {t.skipQuestion}
                </span>
              </button>

              {(currentQ.type !== 'single' || isOptionSelected(currentQ, String(answers[currentQ.field!] ?? ''))) && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-[48px] px-6 rounded-2xl bg-[var(--accent)] text-white text-sm sm:text-base font-semibold font-heading hover:opacity-95 active:scale-[0.985] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>
                    {safeIdx === questions.length - 1 ? t.seeScreening : 'Continue'}
                  </span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] hidden sm:block">
            Keyboard shortcuts: press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-hairline)] font-mono">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-hairline)] font-mono">9</kbd> to choose, <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-hairline)] font-mono">Enter</kbd> to continue, <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-hairline)] font-mono">Esc</kbd> for Quick Hide. (Paused automatically while typing in fields.)
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
