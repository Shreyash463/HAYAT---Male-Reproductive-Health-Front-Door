import { describe, it, expect } from 'vitest';
import { assessRisk, calculateBmi } from './riskEngine';
import { AssessmentAnswers } from '../types';

describe('HAYAT Risk Engine - Core Scoring & Triage', () => {
  it('correctly assesses a healthy low-risk profile', () => {
    const answers: AssessmentAnswers = {
      ageRange: '25-29',
      familyPlanning: 'planning',
      smoking: 'never',
      alcohol: 'none',
      sleepHours: 8,
      exerciseDays: 4,
      stressLevel: 2,
      heatExposure: ['none'],
      supplementsSteroids: 'none',
      recreationalSubstances: 'none',
      heightCm: 178,
      weightKg: 72,
      conditions: ['none'],
      waistConcern: 'no',
      pastMumps: 'no',
      pastInfection: 'no',
      pastSurgeryInjury: 'no',
      undescendedTesticle: 'no',
      currentSymptoms: ['none'],
      redFlagSymptoms: ['none']
    };

    const res = assessRisk(answers);
    expect(res.score).toBeLessThan(25);
    expect(res.band).toBe('Low');
    expect(res.triage).toBe('Self-care');
    expect(res.redFlags).toHaveLength(0);
    expect(res.favourableFactors.length).toBeGreaterThan(0);
  });

  it('correctly assesses a moderate risk profile (score 25-49, Primary Care)', () => {
    const answers: AssessmentAnswers = {
      ageRange: '30-34',
      familyPlanning: 'planning',
      smoking: 'occasional',
      alcohol: 'none',
      sleepHours: 6,
      exerciseDays: 2,
      stressLevel: 3,
      heatExposure: ['laptop_lap'],
      supplementsSteroids: 'none',
      recreationalSubstances: 'none',
      heightCm: 175,
      weightKg: 84, // BMI 27.4 overweight (+7)
      conditions: ['none'],
      waistConcern: 'yes',
      pastMumps: 'no',
      pastInfection: 'no',
      pastSurgeryInjury: 'no',
      undescendedTesticle: 'no',
      currentSymptoms: ['none'],
      redFlagSymptoms: ['none']
    };

    const res = assessRisk(answers);
    expect(res.score).toBeGreaterThanOrEqual(25);
    expect(res.score).toBeLessThan(50);
    expect(res.band).toBe('Moderate');
    expect(res.triage).toBe('Primary care');
    expect(res.redFlags).toHaveLength(0);
  });

  it('correctly assesses elevated risk directing to Andrology/Urology', () => {
    const answers: AssessmentAnswers = {
      ageRange: '35-39',
      familyPlanning: 'planning',
      smoking: 'daily',
      alcohol: 'heavy',
      sleepHours: 5,
      exerciseDays: 0,
      stressLevel: 4,
      heatExposure: ['laptop_lap'],
      supplementsSteroids: 'none',
      recreationalSubstances: 'none',
      heightCm: 175,
      weightKg: 95,
      conditions: ['diabetes'],
      currentSymptoms: ['heaviness_veins'],
      redFlagSymptoms: ['none']
    };

    const res = assessRisk(answers);
    expect(res.score).toBeGreaterThanOrEqual(50);
    expect(res.band).toBe('Elevated');
    expect(res.triage).toBe('Andrology/Urology');
  });

  it('correctly routes prolonged difficulty (>12m) to Fertility Service', () => {
    const answers: AssessmentAnswers = {
      ageRange: '35-39',
      familyPlanning: 'trying',
      tryingDuration: 'over_12',
      smoking: 'never',
      sleepHours: 7,
      exerciseDays: 3,
      redFlagSymptoms: ['none']
    };

    const res = assessRisk(answers);
    expect(res.triage).toBe('Fertility service');
    expect(res.triageReason).toContain('over 12 months');
  });

  describe('Red Flag Safety Overrides (100% Sensitivity Contract)', () => {
    const urgentSymptoms = [
      { key: 'severe_pain', label: 'Severe sudden pain' },
      { key: 'rapid_swelling', label: 'Rapid swelling' },
      { key: 'fever_pain', label: 'Fever with testicular pain' },
      { key: 'blood_in_semen', label: 'Blood in semen' },
      { key: 'hard_painless_lump', label: 'Hard painless lump' }
    ];

    urgentSymptoms.forEach(({ key, label }) => {
      it(`triggers immediate Urgent assessment override for: ${label}`, () => {
        const answers: AssessmentAnswers = {
          ageRange: '25-29',
          smoking: 'never',
          sleepHours: 8,
          redFlagSymptoms: [key]
        };

        const res = assessRisk(answers);
        expect(res.band).toBe('Urgent');
        expect(res.triage).toBe('Urgent assessment');
        expect(res.redFlags.length).toBeGreaterThanOrEqual(1);
        expect(res.triageReason.toLowerCase()).toContain('time-critical');
      });
    });
  });

  describe('Safety & Medical Framing Compliance', () => {
    it('never outputs diagnostic statements or shaming words in generated summaries', () => {
      const answers: AssessmentAnswers = {
        ageRange: '45+',
        familyPlanning: 'trying',
        tryingDuration: 'over_12',
        smoking: 'daily',
        alcohol: 'heavy',
        currentSymptoms: ['heaviness_veins'],
        redFlagSymptoms: ['severe_pain']
      };

      const res = assessRisk(answers);
      const textToAudit = `${res.summary} ${res.triageReason} ${res.factors.map(f => f.explanation).join(' ')}`.toLowerCase();

      // Prohibited clinical diagnostic and stigmatizing terms
      const forbidden = [
        'you are diagnosed',
        'we diagnose',
        'you are infertile',
        'you are sterile',
        'you are impotent',
        'diagnostic proof',
        'accuracy proven'
      ];

      forbidden.forEach(term => {
        expect(textToAudit).not.toContain(term);
      });
    });

    it('always bounds risk score between 0 and 100', () => {
      const emptyRes = assessRisk({});
      expect(emptyRes.score).toBeGreaterThanOrEqual(0);
      expect(emptyRes.score).toBeLessThanOrEqual(100);

      const maxRes = assessRisk({
        ageRange: '45+',
        smoking: 'daily',
        alcohol: 'heavy',
        conditions: ['diabetes', 'hypertension', 'thyroid', 'cholesterol'],
        currentSymptoms: ['lump', 'heaviness_veins', 'dull_ache']
      });
      expect(maxRes.score).toBeGreaterThanOrEqual(0);
      expect(maxRes.score).toBeLessThanOrEqual(100);
    });
  });

  describe('BMI Calculation Utility', () => {
    it('computes correct BMI values and bounds', () => {
      expect(calculateBmi(180, 75)).toBeCloseTo(23.15, 1);
      expect(calculateBmi(170, 90)).toBeCloseTo(31.14, 1);
      expect(calculateBmi(undefined, 80)).toBeUndefined();
      expect(calculateBmi(180, undefined)).toBeUndefined();
    });
  });

  describe('Counterfactual Modifiability Simulation', () => {
    it('demonstrates that modifying lifestyle factors reduces the score', () => {
      const baseAnswers: AssessmentAnswers = {
        ageRange: '35-39',
        smoking: 'daily',
        sleepHours: 5,
        exerciseDays: 0,
        heightCm: 175,
        weightKg: 95
      };

      const initialResult = assessRisk(baseAnswers);
      const improvedResult = assessRisk({
        ...baseAnswers,
        smoking: 'never',
        sleepHours: 8,
        exerciseDays: 4
      });

      expect(improvedResult.score).toBeLessThan(initialResult.score);
    });
  });
});
