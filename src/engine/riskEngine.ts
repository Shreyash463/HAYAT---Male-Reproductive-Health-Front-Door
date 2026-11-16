import { AssessmentAnswers, AssessmentResult, RiskBand, TriageLevel, RiskFactor } from '../types';
import { formatLabel } from '../utils/formatters';

/**
 * HAYAT Transparent Risk Screening Engine
 * Rule-based, fully explainable, clinically bounded.
 * Strictly a screening aid; never an automated diagnosis.
 * Uses cautious, plain-language wording ("may be associated with", "can influence").
 */

export function calculateBmi(heightCm?: number, weightKg?: number): number | undefined {
  if (!heightCm || !weightKg || heightCm < 50 || weightKg < 20) return undefined;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function assessRisk(answers: AssessmentAnswers): AssessmentResult {
  const redFlags: string[] = [];
  const factors: RiskFactor[] = [];
  const favourableFactors: RiskFactor[] = [];
  const actions: string[] = [];
  const doctorQuestions: string[] = [];

  // 1. RED FLAGS: Checked FIRST and override everything
  const redFlagList = (answers.redFlagSymptoms || []).filter(s => s !== 'none');
  if (redFlagList.includes('severe_pain')) {
    redFlags.push('Sudden severe testicular pain (requires immediate rule-out of testicular torsion)');
  }
  if (redFlagList.includes('rapid_swelling')) {
    redFlags.push('Rapid swelling of the scrotum or testicle');
  }
  if (redFlagList.includes('fever_pain')) {
    redFlags.push('Fever combined with acute scrotal or testicular tenderness');
  }
  if (redFlagList.includes('blood_in_semen')) {
    redFlags.push('Visible blood in semen (hematospermia)');
  }
  if (redFlagList.includes('hard_painless_lump')) {
    redFlags.push('A firm or hard non-tender testicular lump (requires prompt clinical exam & ultrasound)');
  }

  let totalRiskScore = 0;

  // 2. Journey & Trying Duration
  // CRITICAL REQUIREMENT: Only count tryingDuration if familyPlanning === 'trying'
  if (answers.familyPlanning === 'trying') {
    if (answers.tryingDuration === 'over_12') {
      totalRiskScore += 24;
      factors.push({
        id: 'trying_12m',
        label: 'Trying to conceive for 12+ months',
        direction: 'raises',
        weight: 24,
        modifiable: false,
        userValue: 'Over 12 months',
        explanation: 'Clinical guidelines recommend checking in with a clinician when conception has not occurred after 12 months of regular timing.'
      });
      doctorQuestions.push('What initial diagnostic timeline do you recommend for both of us?');
    } else if (answers.tryingDuration === '6_12') {
      totalRiskScore += 14;
      factors.push({
        id: 'trying_6_12m',
        label: 'Trying to conceive for 6 to 12 months',
        direction: 'raises',
        weight: 14,
        modifiable: false,
        userValue: '6 to 12 months',
        explanation: 'Approaching the 1-year clinical evaluation window; proactive metabolic and lifestyle habits may be helpful.'
      });
    } else if (answers.tryingDuration === 'under_3' || answers.tryingDuration === '3_6') {
      favourableFactors.push({
        id: 'trying_early',
        label: 'Early in family planning journey',
        direction: 'lowers',
        weight: -8,
        modifiable: false,
        userValue: answers.tryingDuration === 'under_3' ? 'Under 3 months' : '3 to 6 months',
        explanation: 'Most couples achieve pregnancy within 12 months. Early awareness allows comfortable time for natural adjustments.'
      });
    }
  } else if (answers.familyPlanning === 'planning' || answers.familyPlanning === 'not_now') {
    favourableFactors.push({
      id: 'proactive_planning',
      label: 'Proactive early check-in',
      direction: 'lowers',
      weight: -5,
      modifiable: false,
      userValue: formatLabel(answers.familyPlanning),
      explanation: 'Checking in ahead of time helps build steady, long-term habits before active conception.'
    });
  }

  // 3. Age Factors (Cautious phrasing)
  if (answers.ageRange === '45+') {
    totalRiskScore += 12;
    factors.push({
      id: 'age_45',
      label: 'Age 45 or older',
      direction: 'raises',
      weight: 12,
      modifiable: false,
      userValue: '45 years or older',
      explanation: 'Paternal age above 45 can be associated with gradual changes in semen volume and cellular markers.'
    });
  } else if (answers.ageRange === '40-44') {
    totalRiskScore += 8;
    factors.push({
      id: 'age_40_44',
      label: 'Age between 40 and 44',
      direction: 'raises',
      weight: 8,
      modifiable: false,
      userValue: '40 to 44 years',
      explanation: 'Mild gradual shifts in metabolic and reproductive markers may occur; general wellness check-ins are helpful.'
    });
  } else if (answers.ageRange === '18-24' || answers.ageRange === '25-29' || answers.ageRange === '30-34') {
    favourableFactors.push({
      id: 'age_protective',
      label: 'Younger age bracket',
      direction: 'lowers',
      weight: -5,
      modifiable: false,
      userValue: formatLabel(answers.ageRange),
      explanation: 'Age profile typically aligns with favorable natural biological resilience.'
    });
  }

  // 4. Daily Life & Lifestyle
  // Smoking
  if (answers.smoking === 'daily') {
    totalRiskScore += 16;
    factors.push({
      id: 'smoking_daily',
      label: 'Daily cigarette or vaping use',
      direction: 'raises',
      weight: 16,
      modifiable: true,
      userValue: 'Daily',
      explanation: 'Tobacco and nicotine generate oxidative stress that may influence sperm count and cellular integrity.'
    });
    actions.push('Reducing or stopping nicotine can support sperm quality over a 72-90 day cycle.');
    doctorQuestions.push('Would you recommend any antioxidant or smoking cessation support?');
  } else if (answers.smoking === 'occasional') {
    totalRiskScore += 8;
    factors.push({
      id: 'smoking_occasional',
      label: 'Occasional smoking or vaping',
      direction: 'raises',
      weight: 8,
      modifiable: true,
      userValue: 'Occasional',
      explanation: 'Even intermittent exposure may introduce oxidative stress to reproductive tissues.'
    });
    actions.push('Aim to minimize nicotine exposure during periods when you are planning a family.');
  } else if (answers.smoking === 'never') {
    favourableFactors.push({
      id: 'non_smoker',
      label: 'Non-smoker',
      direction: 'lowers',
      weight: -8,
      modifiable: true,
      userValue: 'Never',
      explanation: 'Avoids oxidative stress and heavy metal exposures linked with smoking.'
    });
  }

  // Alcohol
  if (answers.alcohol === 'heavy') {
    totalRiskScore += 15;
    factors.push({
      id: 'alcohol_heavy',
      label: 'Heavy alcohol intake',
      direction: 'raises',
      weight: 15,
      modifiable: true,
      userValue: 'Heavy',
      explanation: 'Higher alcohol consumption can affect hormone signals and metabolic liver processing.'
    });
    actions.push('Moderating alcohol intake often supports healthy hormone balance within 2 to 3 months.');
  } else if (answers.alcohol === 'moderate') {
    totalRiskScore += 6;
    factors.push({
      id: 'alcohol_moderate',
      label: 'Moderate alcohol consumption',
      direction: 'raises',
      weight: 6,
      modifiable: true,
      userValue: 'Moderate',
      explanation: 'Regular moderate drinking may mildly impact sleep architecture and oxidative balance.'
    });
  } else if (answers.alcohol === 'none') {
    favourableFactors.push({
      id: 'alcohol_none',
      label: 'No alcohol consumption',
      direction: 'lowers',
      weight: -5,
      modifiable: true,
      userValue: 'None',
      explanation: 'Supports natural liver metabolism and steady cellular recovery.'
    });
  }

  // Sleep
  if (answers.sleepHours !== undefined) {
    if (answers.sleepHours < 6) {
      totalRiskScore += 8;
      factors.push({
        id: 'sleep_short',
        label: 'Short sleep duration (less than 6 hours)',
        direction: 'raises',
        weight: 8,
        modifiable: true,
        userValue: `${answers.sleepHours} hours / night`,
        explanation: 'Much of daily testosterone synthesis occurs during undisturbed deep sleep; short sleep may disrupt endocrine balance.'
      });
      actions.push('Prioritise 7-8 hours of sleep per night to support natural nocturnal recovery.');
    } else if (answers.sleepHours >= 7 && answers.sleepHours <= 9) {
      favourableFactors.push({
        id: 'sleep_optimal',
        label: 'Healthy sleep duration',
        direction: 'lowers',
        weight: -6,
        modifiable: true,
        userValue: `${answers.sleepHours} hours / night`,
        explanation: 'Consistent 7-9 hours sleep supports physiological endocrine rhythms.'
      });
    }
  }

  // Stress Level (1-5)
  if (answers.stressLevel !== undefined) {
    if (answers.stressLevel >= 4) {
      totalRiskScore += 7;
      factors.push({
        id: 'stress_high',
        label: 'High psychological or work stress',
        direction: 'raises',
        weight: 7,
        modifiable: true,
        userValue: `${answers.stressLevel} of 5`,
        explanation: 'Higher stress levels may elevate cortisol and subtly suppress reproductive hormone signals.'
      });
      actions.push('Incorporate daily decompression (e.g. 15 minutes walking, breathwork, or deliberate rest).');
    } else if (answers.stressLevel <= 2) {
      favourableFactors.push({
        id: 'stress_low',
        label: 'Low everyday stress level',
        direction: 'lowers',
        weight: -4,
        modifiable: true,
        userValue: `${answers.stressLevel} of 5`,
        explanation: 'Lower perceived stress is associated with stable endocrine regulation.'
      });
    }
  }

  // Exercise
  if (answers.exerciseDays !== undefined) {
    if (answers.exerciseDays >= 3) {
      favourableFactors.push({
        id: 'exercise_regular',
        label: 'Regular physical activity (3+ days/week)',
        direction: 'lowers',
        weight: -8,
        modifiable: true,
        userValue: `${answers.exerciseDays} days / week`,
        explanation: 'Supports insulin sensitivity, pelvic blood circulation, and antioxidant defenses.'
      });
    } else if (answers.exerciseDays === 0) {
      totalRiskScore += 6;
      factors.push({
        id: 'exercise_sedentary',
        label: 'Sedentary routine',
        direction: 'raises',
        weight: 6,
        modifiable: true,
        userValue: '0 days / week',
        explanation: 'Prolonged sitting can increase scrotal temperature and slow metabolic clearance.'
      });
      actions.push('Begin with 20 minutes of brisk walking 3-4 days a week to stimulate blood flow.');
    }
  }

  // Heat Exposure
  const heatList = (answers.heatExposure || []).filter(h => h !== 'none');
  if (heatList.length > 0) {
    const pts = heatList.length * 6;
    totalRiskScore += pts;
    factors.push({
      id: 'heat_exposure',
      label: 'Frequent scrotal heat exposure',
      direction: 'raises',
      weight: pts,
      modifiable: true,
      userValue: heatList.map(h => formatLabel(h)).join(', '),
      explanation: 'Sperm production is sensitive to heat. Frequent saunas or hot laptops on the lap can elevate local temperature.'
    });
    actions.push('Avoid prolonged hot tubs or saunas, and avoid resting laptops directly on the lap for the next 3 months.');
  }

  // Anabolic Steroids / Testosterone
  if (answers.supplementsSteroids === 'current') {
    totalRiskScore += 35;
    factors.push({
      id: 'steroids_current',
      label: 'Current testosterone or anabolic compound use',
      direction: 'raises',
      weight: 35,
      modifiable: true,
      userValue: 'Currently using',
      explanation: 'Exogenous testosterone signals the brain to pause its own LH and FSH signals, which may significantly reduce sperm production.'
    });
    actions.push('Discuss a medically supervised cessation plan with an andrologist or endocrinologist.');
    doctorQuestions.push('What is the safest protocol to evaluate my natural LH and FSH recovery?');
  } else if (answers.supplementsSteroids === 'past') {
    totalRiskScore += 12;
    factors.push({
      id: 'steroids_past',
      label: 'Past testosterone or anabolic use',
      direction: 'raises',
      weight: 12,
      modifiable: false,
      userValue: 'Past use',
      explanation: 'Natural hormone recovery can take several months depending on past history and duration.'
    });
    doctorQuestions.push('Can we check my baseline LH, FSH, and testosterone levels?');
  }

  // Recreational Substances
  if (answers.recreationalSubstances === 'regular') {
    totalRiskScore += 14;
    factors.push({
      id: 'substances_regular',
      label: 'Regular substance use',
      direction: 'raises',
      weight: 14,
      modifiable: true,
      userValue: 'Regular use',
      explanation: 'Certain substances may interact with reproductive receptors and sperm membrane integrity.'
    });
    actions.push('Reducing or stopping recreational substance use supports cellular recovery.');
  } else if (answers.recreationalSubstances === 'occasional') {
    totalRiskScore += 7;
    factors.push({
      id: 'substances_occasional',
      label: 'Occasional substance use',
      direction: 'raises',
      weight: 7,
      modifiable: true,
      userValue: 'Occasional',
      explanation: 'Mild impact on the seminal fluid environment.'
    });
  }

  // 5. Body & Metabolic (BMI & Waist concern)
  const bmi = calculateBmi(answers.heightCm, answers.weightKg);
  if (bmi !== undefined) {
    if (bmi >= 30) {
      totalRiskScore += 15;
      factors.push({
        id: 'bmi_obesity',
        label: 'Higher BMI range (30+)',
        direction: 'raises',
        weight: 15,
        modifiable: true,
        userValue: `BMI ${bmi}`,
        explanation: 'Higher body fat levels can increase aromatase activity, converting more testosterone into estrogen.'
      });
      actions.push('Gradual lifestyle adjustments and 5-10% weight changes often improve hormone ratios.');
      doctorQuestions.push('Would a metabolic check (blood sugar and lipid panel) be helpful?');
    } else if (bmi >= 25 && bmi < 30) {
      totalRiskScore += 7;
      factors.push({
        id: 'bmi_overweight',
        label: 'Slightly elevated BMI (25 to 29.9)',
        direction: 'raises',
        weight: 7,
        modifiable: true,
        userValue: `BMI ${bmi}`,
        explanation: 'Mild metabolic factor that can be supported through balanced nutrition and movement.'
      });
    } else if (bmi >= 18.5 && bmi < 25) {
      favourableFactors.push({
        id: 'bmi_normal',
        label: 'Typical BMI range (18.5 to 24.9)',
        direction: 'lowers',
        weight: -7,
        modifiable: true,
        userValue: `BMI ${bmi}`,
        explanation: 'Helps maintain balanced metabolic hormone conversion.'
      });
    }
  }

  // Waist concern
  if (answers.waistConcern === 'yes') {
    totalRiskScore += 6;
    factors.push({
      id: 'waist_concern',
      label: 'Waist circumference concern noted',
      direction: 'raises',
      weight: 6,
      modifiable: true,
      userValue: 'Concern noted',
      explanation: 'Central body fat can be an indicator of metabolic load and insulin sensitivity.'
    });
  }

  // Conditions
  const conditions = (answers.conditions || []).filter(c => c !== 'none');
  if (conditions.includes('diabetes')) {
    totalRiskScore += 14;
    factors.push({
      id: 'condition_diabetes',
      label: 'Diabetes or elevated blood sugar',
      direction: 'raises',
      weight: 14,
      modifiable: true,
      userValue: 'Reported',
      explanation: 'Elevated blood sugar may increase oxidative stress and can influence sperm DNA integrity.'
    });
    actions.push('Work closely with your doctor on blood glucose optimization.');
  }
  if (conditions.includes('hypertension')) {
    totalRiskScore += 8;
    factors.push({
      id: 'condition_hypertension',
      label: 'High blood pressure',
      direction: 'raises',
      weight: 8,
      modifiable: true,
      userValue: 'Reported',
      explanation: 'Cardiovascular health and certain blood pressure medications can impact vascular blood flow.'
    });
  }
  if (conditions.includes('thyroid')) {
    totalRiskScore += 9;
    factors.push({
      id: 'condition_thyroid',
      label: 'Thyroid condition',
      direction: 'raises',
      weight: 9,
      modifiable: true,
      userValue: 'Reported',
      explanation: 'Thyroid hormones help regulate general cellular metabolism and reproductive hormone binding.'
    });
  }

  // 6. Medical History & Symptoms
  if (answers.undescendedTesticle === 'yes') {
    totalRiskScore += 16;
    factors.push({
      id: 'history_cryptorchidism',
      label: 'History of undescended testicle in infancy',
      direction: 'raises',
      weight: 16,
      modifiable: false,
      userValue: 'Yes in childhood',
      explanation: 'Even when corrected early in childhood, a baseline semen check is standard and helpful.'
    });
    doctorQuestions.push('Could my childhood history have any bearing on my semen test?');
  }
  if (answers.pastInfection === 'yes') {
    totalRiskScore += 12;
    factors.push({
      id: 'history_infection',
      label: 'History of urinary or genital infection',
      direction: 'raises',
      weight: 12,
      modifiable: false,
      userValue: 'Yes',
      explanation: 'Past infections can sometimes leave mild residual inflammation in the reproductive tract.'
    });
    doctorQuestions.push('Would you recommend a routine semen culture to rule out lingering inflammation?');
  }
  if (answers.pastMumps === 'yes') {
    totalRiskScore += 10;
    factors.push({
      id: 'history_mumps',
      label: 'History of mumps',
      direction: 'raises',
      weight: 10,
      modifiable: false,
      userValue: 'Yes',
      explanation: 'Mumps in adolescence can occasionally cause orchitis that affects testicular tubules.'
    });
  }
  if (answers.pastSurgeryInjury === 'yes') {
    totalRiskScore += 8;
    factors.push({
      id: 'history_surgery_injury',
      label: 'Past hernia/scrotal surgery or injury',
      direction: 'raises',
      weight: 8,
      modifiable: false,
      userValue: 'Yes',
      explanation: 'Surgeries or injuries in the groin area can sometimes influence local blood supply.'
    });
  }

  // Symptoms
  const symptoms = (answers.currentSymptoms || []).filter(s => s !== 'none');
  if (symptoms.includes('heaviness_veins')) {
    totalRiskScore += 16;
    factors.push({
      id: 'symptom_varicocele',
      label: 'Feeling of heaviness or swollen veins (possible varicocele sign)',
      direction: 'raises',
      weight: 16,
      modifiable: true,
      userValue: 'Heaviness or vein fullness',
      explanation: 'A varicocele (enlarged scrotal veins) is very common and often correctable. An in-person check can verify if one is present.'
    });
    actions.push('Schedule a physical examination and scrotal ultrasound with a doctor.');
    doctorQuestions.push('Could my symptoms indicate a varicocele, and would an ultrasound help confirm?');
  }
  if (symptoms.includes('dull_ache')) {
    totalRiskScore += 8;
    factors.push({
      id: 'symptom_ache',
      label: 'Dull ache or discomfort',
      direction: 'raises',
      weight: 8,
      modifiable: true,
      userValue: 'Dull ache',
      explanation: 'A dull ache can be linked with congestion or mild structural factors that are easily checked by a clinician.'
    });
  }
  if (symptoms.includes('low_libido') || symptoms.includes('erection_difficulty')) {
    totalRiskScore += 10;
    factors.push({
      id: 'symptom_sexual',
      label: 'Changes in libido or erection firmness',
      direction: 'raises',
      weight: 10,
      modifiable: true,
      userValue: 'Reported',
      explanation: 'Can relate to sleep deficits, stress, general vascular health, or hormone levels.'
    });
    actions.push('Ask your doctor about a routine morning hormone check.');
  }

  // 7. Optional Semen Analysis (WHO 2021 Reference Limits)
  if (answers.hasSemenAnalysis) {
    if (answers.semenVolume !== undefined && answers.semenVolume < 1.4) {
      totalRiskScore += 14;
      factors.push({
        id: 'semen_volume_low',
        label: 'Semen volume below standard reference limit (<1.4 mL)',
        direction: 'raises',
        weight: 14,
        modifiable: true,
        userValue: `${answers.semenVolume} mL`,
        explanation: 'WHO 2021 lower normal limit is 1.4 mL. Lower volumes can occur from incomplete collection or short abstinence.'
      });
      doctorQuestions.push('Should we repeat the semen test after a standardized abstinence period?');
    }
    if (answers.spermConcentration !== undefined && answers.spermConcentration < 16) {
      totalRiskScore += 22;
      factors.push({
        id: 'semen_concentration_low',
        label: 'Sperm concentration below standard reference limit (<16 M/mL)',
        direction: 'raises',
        weight: 22,
        modifiable: true,
        userValue: `${answers.spermConcentration} M/mL`,
        explanation: 'WHO 2021 lower normal limit is 16 million/mL. A repeat test in 4-6 weeks is standard practice before drawing conclusions.'
      });
      doctorQuestions.push('What is the recommended interval for a confirmatory repeat semen test?');
    }
    if (answers.totalMotility !== undefined && answers.totalMotility < 42) {
      totalRiskScore += 14;
      factors.push({
        id: 'semen_total_motility_low',
        label: 'Total motility below reference limit (<42%)',
        direction: 'raises',
        weight: 14,
        modifiable: true,
        userValue: `${answers.totalMotility}%`,
        explanation: 'WHO 2021 lower reference limit is 42%. Lifestyle habits and cooling often support positive improvements.'
      });
    }
    if (answers.progressiveMotility !== undefined && answers.progressiveMotility < 30) {
      totalRiskScore += 14;
      factors.push({
        id: 'semen_prog_motility_low',
        label: 'Progressive motility below reference limit (<30%)',
        direction: 'raises',
        weight: 14,
        modifiable: true,
        userValue: `${answers.progressiveMotility}%`,
        explanation: 'WHO 2021 lower limit is 30%. Progressive movement is important for sperm travel.'
      });
    }
  }

  // Cap score 0 - 100
  let finalScore = Math.min(100, Math.max(0, totalRiskScore));

  // Determine Risk Band
  let band: RiskBand;
  if (redFlags.length > 0) {
    band = 'Urgent';
  } else if (finalScore >= 50) {
    band = 'Elevated';
  } else if (finalScore >= 25) {
    band = 'Moderate';
  } else {
    band = 'Low';
  }

  // Determine Triage Level
  let triage: TriageLevel;
  let triageReason: string;

  if (redFlags.length > 0) {
    triage = 'Urgent assessment';
    triageReason = 'One or more symptoms flagged could represent time-critical conditions requiring same-day physical assessment.';
  } else if (
    (answers.familyPlanning === 'trying' && answers.tryingDuration === 'over_12') ||
    (answers.hasSemenAnalysis && answers.spermConcentration !== undefined && answers.spermConcentration < 16)
  ) {
    triage = 'Fertility service';
    triageReason = 'Trying for over 12 months or having semen metrics below reference limits warrants dedicated reproductive medicine and couples evaluation.';
  } else if (band === 'Elevated' || (answers.currentSymptoms && answers.currentSymptoms.includes('heaviness_veins'))) {
    triage = 'Andrology/Urology';
    triageReason = 'Identified anatomical or notable endocrine signals (such as vein swelling or hormonal compound history) are best evaluated by a male reproductive specialist.';
  } else if (band === 'Moderate') {
    triage = 'Primary care';
    triageReason = 'General practitioner / family physician evaluation is ideal to address metabolic, lifestyle, and basic hormone parameters in a supportive setting.';
  } else {
    triage = 'Self-care';
    // REQUIREMENT 4: Consistent wording with factors found!
    if (factors.length > 0) {
      triageReason = 'A few modifiable factors were found; small everyday changes may help support your overall reproductive wellness.';
    } else {
      triageReason = 'Low risk profile with reassuring everyday habits. Proactive self-care and ongoing healthy lifestyle choices are recommended.';
    }
  }

  // Summary text consistent with factors
  let summary = '';
  if (band === 'Urgent') {
    summary = 'Important symptoms were noted that require same-day clinical evaluation by a medical doctor.';
  } else if (band === 'Elevated') {
    summary = 'Several identifiable factors were found that can influence reproductive health. Many of these are modifiable or treatable under medical guidance.';
  } else if (band === 'Moderate') {
    summary = 'Your assessment shows a moderate number of areas where lifestyle or general metabolic adjustments can actively support your reproductive vitality.';
  } else {
    if (factors.length > 0) {
      summary = 'Your assessment indicates a low overall risk pattern, though a few modifiable factors were noted where small changes may help.';
    } else {
      summary = 'Your assessment indicates a low risk pattern with reassuring protective habits and no immediate clinical red flags.';
    }
  }

  // Default actions if empty
  if (actions.length === 0) {
    actions.push('Maintain balanced nutrition rich in zinc, selenium, CoQ10, and leafy greens.');
    actions.push('Keep testicles cool by avoiding prolonged hot baths and tight synthetic clothing.');
    actions.push('Stay active with 3-4 days of moderate aerobic exercise and adequate sleep.');
  }

  // Default doctor questions if empty
  if (doctorQuestions.length === 0) {
    doctorQuestions.push('Are there any baseline tests or vitamins you would suggest based on our family timeline?');
    doctorQuestions.push('How frequently should we monitor my overall metabolic and reproductive parameters?');
  }

  const missingInfo = !answers.hasSemenAnalysis || answers.sleepHours === undefined || answers.heightCm === undefined;
  const missingInfoNote = missingInfo
    ? 'This screening is based on the information you shared. Additional details (such as a laboratory semen analysis or metabolic lab values) can make future guidance even more precise.'
    : undefined;

  return {
    score: finalScore,
    band,
    triage,
    triageReason,
    summary,
    factors: factors.sort((a, b) => b.weight - a.weight),
    favourableFactors,
    redFlags,
    missingInfoNote,
    actions,
    doctorQuestions,
    calculatedAt: new Date().toISOString()
  };
}
