import { AssessmentAnswers } from '../types';

export interface DemoPersona {
  id: 'low' | 'moderate' | 'urgent';
  name: string;
  badge: string;
  description: string;
  answers: AssessmentAnswers;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'low',
    name: 'Low Risk Case',
    badge: 'Low Band • Self-Care',
    description: '29-year-old, non-smoker, active runner, 7.5h sleep, planning a family in the next year.',
    answers: {
      ageRange: '25-29',
      familyPlanning: 'planning',
      partnerAssessed: 'not_applicable',
      earlierTests: 'none',
      smoking: 'never',
      alcohol: 'none',
      sleepHours: 8,
      exerciseDays: 4,
      stressLevel: 2,
      heatExposure: ['none'],
      supplementsSteroids: 'none',
      recreationalSubstances: 'none',
      heightCm: 178,
      weightKg: 73,
      conditions: ['none'],
      waistConcern: 'no',
      pastMumps: 'no',
      pastInfection: 'no',
      pastSurgeryInjury: 'no',
      undescendedTesticle: 'no',
      currentSymptoms: ['none'],
      redFlagSymptoms: ['none'],
      hasSemenAnalysis: false
    }
  },
  {
    id: 'moderate',
    name: 'Moderate Risk Case',
    badge: 'Moderate Band • Primary Care',
    description: '36-year-old, trying for 8 months, occasional smoker, BMI 28.2, high work stress.',
    answers: {
      ageRange: '35-39',
      familyPlanning: 'trying',
      tryingDuration: '6_12',
      partnerAssessed: 'yes',
      earlierTests: 'none',
      smoking: 'occasional',
      alcohol: 'moderate',
      sleepHours: 5,
      exerciseDays: 1,
      stressLevel: 4,
      heatExposure: ['laptop_lap', 'hot_baths'],
      supplementsSteroids: 'none',
      recreationalSubstances: 'none',
      heightCm: 175,
      weightKg: 86,
      conditions: ['cholesterol'],
      waistConcern: 'yes',
      pastMumps: 'not_sure',
      pastInfection: 'no',
      pastSurgeryInjury: 'no',
      undescendedTesticle: 'no',
      currentSymptoms: ['dull_ache'],
      redFlagSymptoms: ['none'],
      hasSemenAnalysis: false
    }
  },
  {
    id: 'urgent',
    name: 'Urgent Red-Flag Case',
    badge: 'Urgent Band • Same-Day Assessment',
    description: '31-year-old experiencing acute sudden testicular pain and rapid swelling.',
    answers: {
      ageRange: '30-34',
      familyPlanning: 'not_now',
      partnerAssessed: 'not_applicable',
      earlierTests: 'none',
      smoking: 'never',
      alcohol: 'light',
      sleepHours: 7,
      exerciseDays: 2,
      stressLevel: 3,
      heatExposure: ['none'],
      supplementsSteroids: 'none',
      recreationalSubstances: 'none',
      heightCm: 180,
      weightKg: 77,
      conditions: ['none'],
      waistConcern: 'no',
      pastMumps: 'no',
      pastInfection: 'no',
      pastSurgeryInjury: 'no',
      undescendedTesticle: 'no',
      currentSymptoms: ['none'],
      redFlagSymptoms: ['severe_pain', 'rapid_swelling'],
      hasSemenAnalysis: false
    }
  }
];
