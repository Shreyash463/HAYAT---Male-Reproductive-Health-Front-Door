import { AssessmentAnswers } from '../types';

/**
 * Human-readable label mappings for all raw form & enum values.
 * Prevents raw keys like 'under_3', '18-24', 'daily', 'not_now' from leaking into UI.
 */
export const LABEL_MAP: Record<string, string> = {
  // Age
  '18-24': '18 to 24 years',
  '25-29': '25 to 29 years',
  '30-34': '30 to 34 years',
  '35-39': '35 to 39 years',
  '40-44': '40 to 44 years',
  '45+': '45 years or older',

  // Family planning
  'not_now': 'Not right now / General wellness',
  'planning': 'Planning for the future (next 1-2 years)',
  'trying': 'Actively trying currently',

  // Trying duration
  'under_3': 'Under 3 months',
  '3_6': '3 to 6 months',
  '6_12': '6 to 12 months',
  'over_12': 'Over 12 months',

  // Partner assessed & earlier tests
  'yes': 'Yes',
  'no': 'No',
  'not_applicable': 'Not applicable',
  'not_sure': 'Not sure',
  'prefer_not_to_say': 'Prefer not to say',
  'none': 'None reported',
  'semen': 'Semen analysis',
  'hormone': 'Blood hormone panel',
  'other': 'Other tests',

  // Lifestyle - Smoking
  'never': 'Never',
  'past': 'Past (quit)',
  'occasional': 'Occasional',
  'daily': 'Daily',

  // Lifestyle - Alcohol
  'light': 'Light (rare)',
  'moderate': 'Moderate (weekly)',
  'heavy': 'Heavy',

  // Supplements / Steroids
  'current': 'Currently using',

  // Heat exposure
  'hot_baths': 'Frequent hot baths or saunas',
  'laptop_lap': 'Laptop directly on lap',
  'hot_work': 'High-heat work environment',

  // Conditions
  'diabetes': 'Diabetes or elevated blood sugar',
  'hypertension': 'High blood pressure',
  'thyroid': 'Thyroid disorder',
  'cholesterol': 'Elevated lipids / cholesterol',

  // Symptoms
  'heaviness_veins': 'Feeling of heaviness or swollen veins',
  'dull_ache': 'Dull ache',
  'low_libido': 'Lower sex drive',
  'erection_difficulty': 'Difficulty with erections',

  // Red Flags
  'severe_pain': 'Sudden severe pain',
  'rapid_swelling': 'Rapid swelling',
  'fever_pain': 'Fever with scrotal ache',
  'blood_in_semen': 'Visible blood in semen',
  'hard_painless_lump': 'Hard painless lump',

  // Waist concern
  'waist_yes': 'Waist circumference concern noted',
  'waist_no': 'No waist circumference concern',

  // Substance use
  'regular': 'Regular use'
};

export function formatLabel(keyOrVal?: string | null): string {
  if (!keyOrVal) return 'Not provided';
  if (LABEL_MAP[keyOrVal]) return LABEL_MAP[keyOrVal];
  // If array formatted string
  if (keyOrVal.includes(',')) {
    return keyOrVal
      .split(',')
      .map(s => formatLabel(s.trim()))
      .join(', ');
  }
  // Replace underscores and capitalise
  return keyOrVal
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Formats user answers into human-friendly representation for Data Inventory
 */
export function getHumanReadableInventory(answers: AssessmentAnswers) {
  const items: { field: string; val: string; storage: string; purpose: string }[] = [];

  // Age
  items.push({
    field: 'Age Bracket',
    val: formatLabel(answers.ageRange),
    storage: 'Local browser memory',
    purpose: 'Helps contextualize baseline hormonal patterns for your age group.'
  });

  // Family planning
  items.push({
    field: 'Family Goal',
    val: formatLabel(answers.familyPlanning),
    storage: 'Local browser memory',
    purpose: 'Guides whether the review focuses on long-term wellness or active conception timelines.'
  });

  // Trying duration (ONLY if trying)
  if (answers.familyPlanning === 'trying') {
    items.push({
      field: 'Time Trying',
      val: formatLabel(answers.tryingDuration),
      storage: 'Local browser memory',
      purpose: 'Helps determine if clinical evaluation guidelines recommend a doctor check-in.'
    });
  }

  // Lifestyle
  items.push({
    field: 'Smoking & Nicotine',
    val: formatLabel(answers.smoking),
    storage: 'Local browser memory',
    purpose: 'Assesses lifestyle factors that may influence cellular wellness.'
  });

  items.push({
    field: 'Alcohol Intake',
    val: formatLabel(answers.alcohol),
    storage: 'Local browser memory',
    purpose: 'Checks habits that may affect hormonal balance and sleep quality.'
  });

  items.push({
    field: 'Sleep & Stress',
    val: `${answers.sleepHours !== undefined ? `${answers.sleepHours} hrs sleep` : 'Sleep not shared'}, ${answers.stressLevel !== undefined ? `Stress level ${answers.stressLevel}/5` : 'Stress not shared'}`,
    storage: 'Local browser memory',
    purpose: 'Assesses restorative rhythms that support day-to-day endocrine balance.'
  });

  if (answers.recreationalSubstances) {
    items.push({
      field: 'Recreational Substances',
      val: formatLabel(answers.recreationalSubstances),
      storage: 'Local browser memory',
      purpose: 'Checks substances that may interact with reproductive health.'
    });
  }

  // Body & Metabolic
  if (answers.heightCm && answers.weightKg) {
    items.push({
      field: 'Height & Weight (BMI)',
      val: `${answers.heightCm} cm, ${answers.weightKg} kg`,
      storage: 'Local browser memory',
      purpose: 'Calculates general metabolic proportion to identify supportive lifestyle habits.'
    });
  }

  if (answers.waistConcern) {
    items.push({
      field: 'Waist Size Concern',
      val: formatLabel(answers.waistConcern),
      storage: 'Local browser memory',
      purpose: 'Provides extra context on central metabolic health.'
    });
  }

  // Symptoms
  const symptoms = (answers.currentSymptoms || []).filter(s => s !== 'none');
  items.push({
    field: 'Physical Symptoms',
    val: symptoms.length > 0 ? symptoms.map(s => formatLabel(s)).join(', ') : 'None reported',
    storage: 'Local browser memory',
    purpose: 'Checks for signs that may warrant a comfortable in-person physical exam.'
  });

  // Red Flags
  const redFlags = (answers.redFlagSymptoms || []).filter(s => s !== 'none');
  items.push({
    field: 'Urgent Safety Signals',
    val: redFlags.length > 0 ? redFlags.map(s => formatLabel(s)).join(', ') : 'None reported',
    storage: 'Local browser memory',
    purpose: 'Ensures urgent symptoms receive immediate attention from a medical professional.'
  });

  // Semen analysis
  items.push({
    field: 'Lab Test Information',
    val: answers.hasSemenAnalysis ? 'Laboratory numbers provided' : 'None entered (skipped)',
    storage: 'Local browser memory',
    purpose: 'Compares laboratory values against standard clinical reference ranges when available.'
  });

  return items;
}
