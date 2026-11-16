import fs from 'fs';
import path from 'path';
import { assessRisk } from '../src/engine/riskEngine';
import { AssessmentAnswers } from '../src/types';

function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = createSeededRandom(133742);

const ageOptions: AssessmentAnswers['ageRange'][] = ['18-24', '25-29', '30-34', '35-39', '40-44', '45+'];
const planOptions: AssessmentAnswers['familyPlanning'][] = ['not_now', 'planning', 'trying'];
const durOptions: AssessmentAnswers['tryingDuration'][] = ['under_3', '3_6', '6_12', 'over_12'];
const smokeOptions: AssessmentAnswers['smoking'][] = ['never', 'past', 'occasional', 'daily'];
const alcoholOptions: AssessmentAnswers['alcohol'][] = ['none', 'light', 'moderate', 'heavy'];
const steroidOptions: AssessmentAnswers['supplementsSteroids'][] = ['none', 'past', 'current'];
const substanceOptions: AssessmentAnswers['recreationalSubstances'][] = ['none', 'occasional', 'regular'];
const redFlagsList = ['severe_pain', 'rapid_swelling', 'fever_pain', 'blood_in_semen', 'hard_painless_lump'];

const cases: Array<{ id: number; answers: AssessmentAnswers; expected: { score: number; band: string; triage: string } }> = [];

for (let i = 0; i < 500; i++) {
  const isUrgent = i < 30; // First 30 cases have guaranteed red flags
  const redFlags: string[] = [];
  if (isUrgent) {
    const rfIdx = i % redFlagsList.length;
    redFlags.push(redFlagsList[rfIdx]);
    if (i % 3 === 0) {
      redFlags.push(redFlagsList[(rfIdx + 1) % redFlagsList.length]);
    }
  } else if (rng() < 0.05) {
    redFlags.push(redFlagsList[Math.floor(rng() * redFlagsList.length)]);
  }

  const familyPlanning = planOptions[Math.floor(rng() * planOptions.length)];
  const tryingDuration = familyPlanning === 'trying' ? durOptions[Math.floor(rng() * durOptions.length)] : undefined;

  const hasSemen = rng() < 0.45;
  const semenVolume = hasSemen ? Number((0.5 + rng() * 4).toFixed(1)) : undefined;
  const spermConcentration = hasSemen ? Math.floor(rng() * 80) : undefined;
  const totalMotility = hasSemen ? Math.floor(10 + rng() * 70) : undefined;
  const progressiveMotility = hasSemen ? Math.floor(5 + rng() * 55) : undefined;

  const heatExposure: string[] = [];
  if (rng() < 0.25) heatExposure.push('hot_baths');
  if (rng() < 0.25) heatExposure.push('laptop_lap');
  if (rng() < 0.15) heatExposure.push('hot_work');

  const conditions: string[] = [];
  if (rng() < 0.15) conditions.push('diabetes');
  if (rng() < 0.2) conditions.push('hypertension');
  if (rng() < 0.1) conditions.push('thyroid');

  const symptoms: string[] = [];
  if (rng() < 0.2) symptoms.push('heaviness_veins');
  if (rng() < 0.15) symptoms.push('dull_ache');
  if (rng() < 0.1) symptoms.push('low_libido');
  if (rng() < 0.08) symptoms.push('erection_difficulty');

  const answers: AssessmentAnswers = {
    ageRange: ageOptions[Math.floor(rng() * ageOptions.length)],
    familyPlanning,
    tryingDuration,
    smoking: smokeOptions[Math.floor(rng() * smokeOptions.length)],
    alcohol: alcoholOptions[Math.floor(rng() * alcoholOptions.length)],
    sleepHours: rng() < 0.9 ? Number((4.5 + rng() * 5).toFixed(1)) : undefined,
    exerciseDays: rng() < 0.9 ? Math.floor(rng() * 8) : undefined,
    stressLevel: rng() < 0.9 ? Math.floor(1 + rng() * 5) : undefined,
    heatExposure: heatExposure.length > 0 ? heatExposure : ['none'],
    supplementsSteroids: steroidOptions[Math.floor(rng() * steroidOptions.length)],
    recreationalSubstances: substanceOptions[Math.floor(rng() * substanceOptions.length)],
    heightCm: rng() < 0.85 ? Math.floor(155 + rng() * 45) : undefined,
    weightKg: rng() < 0.85 ? Math.floor(50 + rng() * 70) : undefined,
    waistConcern: rng() < 0.3 ? 'yes' : 'no',
    conditions: conditions.length > 0 ? conditions : ['none'],
    pastMumps: rng() < 0.1 ? 'yes' : 'no',
    pastInfection: rng() < 0.15 ? 'yes' : 'no',
    pastSurgeryInjury: rng() < 0.12 ? 'yes' : 'no',
    undescendedTesticle: rng() < 0.08 ? 'yes' : 'no',
    currentSymptoms: symptoms.length > 0 ? symptoms : ['none'],
    redFlagSymptoms: redFlags.length > 0 ? redFlags : ['none'],
    hasSemenAnalysis: hasSemen,
    semenVolume,
    spermConcentration,
    totalMotility,
    progressiveMotility,
  };

  const tsResult = assessRisk(answers);
  cases.push({
    id: i + 1,
    answers,
    expected: {
      score: tsResult.score,
      band: tsResult.band,
      triage: tsResult.triage,
    },
  });
}

const outDir = path.resolve(import.meta.dirname || '.', '../backend/tests');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'parity_cases.json');
fs.writeFileSync(outPath, JSON.stringify(cases, null, 2));
console.log(`Generated 500 parity test cases at: ${outPath}`);
