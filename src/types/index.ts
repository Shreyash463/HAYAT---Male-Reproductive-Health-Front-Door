export type Language = 'en' | 'hi' | 'ar';
export type Theme = 'dark' | 'light';

export type RiskBand = 'Low' | 'Moderate' | 'Elevated' | 'Urgent';

export type TriageLevel = 
  | 'Self-care'
  | 'Primary care'
  | 'Andrology/Urology'
  | 'Fertility service'
  | 'Urgent assessment';

export interface ConsentSettings {
  processAnswers: boolean; // Required
  saveOnDevice: boolean;
  shareAnonymisedResearch: boolean;
  createClinicianSummary: boolean;
  useAiExplanation?: boolean;
  timestamp?: string;
}

export interface OutboundCallLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  payloadSummary: string;
  status: 'success' | 'fallback' | 'failed' | 'offline';
  responseSummary?: string;
}

export interface AssessmentAnswers {
  // Step 1: About you
  ageRange?: '18-24' | '25-29' | '30-34' | '35-39' | '40-44' | '45+' | 'prefer_not_to_say';
  familyPlanning?: 'not_now' | 'planning' | 'trying' | 'prefer_not_to_say';

  // Step 2: Journey
  tryingDuration?: 'under_3' | '3_6' | '6_12' | 'over_12' | 'prefer_not_to_say';
  partnerAssessed?: 'yes' | 'no' | 'not_applicable' | 'prefer_not_to_say';
  earlierTests?: 'none' | 'semen' | 'hormone' | 'other' | 'prefer_not_to_say';

  // Step 3: Daily life
  smoking?: 'never' | 'past' | 'occasional' | 'daily' | 'prefer_not_to_say';
  alcohol?: 'none' | 'light' | 'moderate' | 'heavy' | 'prefer_not_to_say';
  sleepHours?: number; // slider 4 - 10
  exerciseDays?: number; // slider 0 - 7
  stressLevel?: number; // 1 - 5
  heatExposure?: string[]; // 'hot_baths', 'laptop_lap', 'hot_work', 'none'
  supplementsSteroids?: 'none' | 'past' | 'current' | 'prefer_not_to_say';
  recreationalSubstances?: 'none' | 'occasional' | 'regular' | 'prefer_not_to_say';

  // Step 4: Body & Metabolic
  heightCm?: number;
  weightKg?: number;
  conditions?: string[]; // 'diabetes', 'hypertension', 'thyroid', 'cholesterol', 'none'
  waistConcern?: 'yes' | 'no' | 'prefer_not_to_say';

  // Step 5: History & Symptoms
  pastMumps?: 'yes' | 'no' | 'not_sure' | 'prefer_not_to_say';
  pastInfection?: 'yes' | 'no' | 'not_sure' | 'prefer_not_to_say';
  pastSurgeryInjury?: 'yes' | 'no' | 'not_sure' | 'prefer_not_to_say';
  undescendedTesticle?: 'yes' | 'no' | 'not_sure' | 'prefer_not_to_say';
  currentSymptoms?: string[]; // 'heaviness_veins', 'lump', 'dull_ache', 'low_libido', 'erection_difficulty', 'none'
  redFlagSymptoms?: string[]; // 'severe_pain', 'rapid_swelling', 'fever_pain', 'blood_in_semen', 'hard_painless_lump', 'none'

  // Step 6: Test Results (optional)
  hasSemenAnalysis?: boolean;
  semenVolume?: number; // mL
  spermConcentration?: number; // million / mL
  totalMotility?: number; // %
  progressiveMotility?: number; // %
  hormoneFsh?: number; // mIU/mL
  hormoneTestosterone?: number; // ng/dL
}

export interface RiskFactor {
  id: string;
  label: string;
  direction: 'raises' | 'lowers' | 'neutral';
  weight: number;
  modifiable: boolean;
  userValue: string;
  explanation: string;
}

export interface AssessmentResult {
  score: number; // 0 - 100
  band: RiskBand;
  triage: TriageLevel;
  triageReason: string;
  summary: string;
  factors: RiskFactor[];
  favourableFactors: RiskFactor[];
  redFlags: string[];
  missingInfoNote?: string;
  actions: string[];
  doctorQuestions: string[];
  calculatedAt: string;
  aiExplanation?: string;
  aiUsed?: boolean;
}

export interface AccessLogItem {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
}

export interface Clinic {
  id: string;
  name: string;
  distance: string;
  location: string;
  services: string[];
  features: {
    maleFriendly: boolean;
    privateEntrance: boolean;
    maleClinicianAvailable: boolean;
    femaleClinicianAvailable: boolean;
    telehealthAvailable: boolean;
  };
  phone: string;
  waitDays: number;
}

export interface AssumptionItem {
  id: string;
  label: string;
  value: string;
  description: string;
}

export interface SyntheticCohortMetrics {
  totalCases: number;
  completionRate: number; // e.g. 91
  medianTimeWithoutHayatMonths: number; // 7.5
  medianTimeWithHayatMonths: number; // 2.5
  referralCompletionRate: number; // 68
  trustScore: number; // 4.5
  redFlagRecall: number; // 100
  redFlagKpiLabel?: string;
  completionFunnel: { step: string; completionRate: number }[];
  timeComparison: { group: string; months: number }[];
  triageDistribution: { level: string; percentage: number; count: number }[];
  fairnessByAge: { ageGroup?: string; group?: string; completion: number; triageAccuracy?: number; consistencyRate?: number; trust: number }[];
  fairnessByLanguage: { language?: string; group?: string; completion: number; triageAccuracy?: number; consistencyRate?: number; trust: number }[];
  maxGapPercentage: number;
  consistencyAchieved: boolean;
  parityAchieved?: boolean;
  assumptions?: AssumptionItem[];
}
