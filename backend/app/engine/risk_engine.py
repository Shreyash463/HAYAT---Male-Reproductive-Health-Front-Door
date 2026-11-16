import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

def calculate_bmi(height_cm: Optional[float], weight_kg: Optional[float]) -> Optional[float]:
    if not height_cm or not weight_kg or height_cm < 50 or weight_kg < 20:
        return None
    height_m = height_cm / 100.0
    return round(weight_kg / (height_m * height_m), 1)

def format_label(val: Optional[str]) -> str:
    if not val:
        return ""
    labels = {
        "not_now": "Not right now",
        "planning": "Planning for future",
        "trying": "Actively trying",
        "under_3": "Under 3 months",
        "3_6": "3 to 6 months",
        "6_12": "6 to 12 months",
        "over_12": "Over 12 months",
        "hot_baths": "Hot baths / saunas",
        "laptop_lap": "Laptop on lap",
        "hot_work": "High heat environment",
        "18-24": "18 to 24 years",
        "25-29": "25 to 29 years",
        "30-34": "30 to 34 years",
        "35-39": "35 to 39 years",
        "40-44": "40 to 44 years",
        "45+": "45 years or older",
    }
    return labels.get(val, val.replace("_", " ").title())

def assess_risk(answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Python mirror of TypeScript assessRisk engine in src/engine/riskEngine.ts.
    Maintains exact numerical, rule-weight, red-flag override, and triage parity.
    """
    red_flags: List[str] = []
    factors: List[Dict[str, Any]] = []
    favourable_factors: List[Dict[str, Any]] = []
    actions: List[str] = []
    doctor_questions: List[str] = []

    # 1. RED FLAGS: Checked FIRST and override everything
    raw_red_flags = answers.get("redFlagSymptoms") or answers.get("red_flag_symptoms") or []
    red_flag_list = [s for s in raw_red_flags if s != "none"]

    if "severe_pain" in red_flag_list:
        red_flags.append("Sudden severe testicular pain (requires immediate rule-out of testicular torsion)")
    if "rapid_swelling" in red_flag_list:
        red_flags.append("Rapid swelling of the scrotum or testicle")
    if "fever_pain" in red_flag_list:
        red_flags.append("Fever combined with acute scrotal or testicular tenderness")
    if "blood_in_semen" in red_flag_list:
        red_flags.append("Visible blood in semen (hematospermia)")
    if "hard_painless_lump" in red_flag_list:
        red_flags.append("A firm or hard non-tender testicular lump (requires prompt clinical exam & ultrasound)")

    total_risk_score = 0

    # 2. Journey & Trying Duration (CRITICAL: Only count tryingDuration if familyPlanning === 'trying')
    family_planning = answers.get("familyPlanning") or answers.get("family_planning")
    trying_duration = answers.get("tryingDuration") or answers.get("trying_duration")

    if family_planning == "trying":
        if trying_duration == "over_12":
            total_risk_score += 24
            factors.append({
                "id": "trying_12m",
                "label": "Trying to conceive for 12+ months",
                "direction": "raises",
                "weight": 24,
                "modifiable": False,
                "userValue": "Over 12 months",
                "explanation": "Clinical guidelines recommend checking in with a clinician when conception has not occurred after 12 months of regular timing."
            })
            doctor_questions.append("What initial diagnostic timeline do you recommend for both of us?")
        elif trying_duration == "6_12":
            total_risk_score += 14
            factors.append({
                "id": "trying_6_12m",
                "label": "Trying to conceive for 6 to 12 months",
                "direction": "raises",
                "weight": 14,
                "modifiable": False,
                "userValue": "6 to 12 months",
                "explanation": "Approaching the 1-year clinical evaluation window; proactive metabolic and lifestyle habits may be helpful."
            })
        elif trying_duration in ("under_3", "3_6"):
            favourable_factors.append({
                "id": "trying_early",
                "label": "Early in family planning journey",
                "direction": "lowers",
                "weight": -8,
                "modifiable": False,
                "userValue": "Under 3 months" if trying_duration == "under_3" else "3 to 6 months",
                "explanation": "Most couples achieve pregnancy within 12 months. Early awareness allows comfortable time for natural adjustments."
            })
    elif family_planning in ("planning", "not_now"):
        favourable_factors.append({
            "id": "proactive_planning",
            "label": "Proactive early check-in",
            "direction": "lowers",
            "weight": -5,
            "modifiable": False,
            "userValue": format_label(family_planning),
            "explanation": "Checking in ahead of time helps build steady, long-term habits before active conception."
        })

    # 3. Age Factors
    age_range = answers.get("ageRange") or answers.get("age_range")
    if age_range == "45+":
        total_risk_score += 12
        factors.append({
            "id": "age_45",
            "label": "Age 45 or older",
            "direction": "raises",
            "weight": 12,
            "modifiable": False,
            "userValue": "45 years or older",
            "explanation": "Paternal age above 45 can be associated with gradual changes in semen volume and cellular markers."
        })
    elif age_range == "40-44":
        total_risk_score += 8
        factors.append({
            "id": "age_40_44",
            "label": "Age between 40 and 44",
            "direction": "raises",
            "weight": 8,
            "modifiable": False,
            "userValue": "40 to 44 years",
            "explanation": "Mild gradual shifts in metabolic and reproductive markers may occur; general wellness check-ins are helpful."
        })
    elif age_range in ("18-24", "25-29", "30-34"):
        favourable_factors.append({
            "id": "age_protective",
            "label": "Younger age bracket",
            "direction": "lowers",
            "weight": -5,
            "modifiable": False,
            "userValue": format_label(age_range),
            "explanation": "Age profile typically aligns with favorable natural biological resilience."
        })

    # 4. Daily Life & Lifestyle
    smoking = answers.get("smoking")
    if smoking == "daily":
        total_risk_score += 16
        factors.append({
            "id": "smoking_daily",
            "label": "Daily cigarette or vaping use",
            "direction": "raises",
            "weight": 16,
            "modifiable": True,
            "userValue": "Daily",
            "explanation": "Tobacco and nicotine generate oxidative stress that may influence sperm count and cellular integrity."
        })
        actions.append("Reducing or stopping nicotine can support sperm quality over a 72-90 day cycle.")
        doctor_questions.append("Would you recommend any antioxidant or smoking cessation support?")
    elif smoking == "occasional":
        total_risk_score += 8
        factors.append({
            "id": "smoking_occasional",
            "label": "Occasional smoking or vaping",
            "direction": "raises",
            "weight": 8,
            "modifiable": True,
            "userValue": "Occasional",
            "explanation": "Even intermittent exposure may introduce oxidative stress to reproductive tissues."
        })
        actions.append("Aim to minimize nicotine exposure during periods when you are planning a family.")
    elif smoking == "never":
        favourable_factors.append({
            "id": "non_smoker",
            "label": "Non-smoker",
            "direction": "lowers",
            "weight": -8,
            "modifiable": True,
            "userValue": "Never",
            "explanation": "Avoids oxidative stress and heavy metal exposures linked with smoking."
        })

    # Alcohol
    alcohol = answers.get("alcohol")
    if alcohol == "heavy":
        total_risk_score += 15
        factors.append({
            "id": "alcohol_heavy",
            "label": "Heavy alcohol intake",
            "direction": "raises",
            "weight": 15,
            "modifiable": True,
            "userValue": "Heavy",
            "explanation": "Higher alcohol consumption can affect hormone signals and metabolic liver processing."
        })
        actions.append("Moderating alcohol intake often supports healthy hormone balance within 2 to 3 months.")
    elif alcohol == "moderate":
        total_risk_score += 6
        factors.append({
            "id": "alcohol_moderate",
            "label": "Moderate alcohol consumption",
            "direction": "raises",
            "weight": 6,
            "modifiable": True,
            "userValue": "Moderate",
            "explanation": "Regular moderate drinking may mildly impact sleep architecture and oxidative balance."
        })
    elif alcohol == "none":
        favourable_factors.append({
            "id": "alcohol_none",
            "label": "No alcohol consumption",
            "direction": "lowers",
            "weight": -5,
            "modifiable": True,
            "userValue": "None",
            "explanation": "Supports natural liver metabolism and steady cellular recovery."
        })

    # Sleep
    sleep_hours = answers.get("sleepHours") if answers.get("sleepHours") is not None else answers.get("sleep_hours")
    if sleep_hours is not None:
        if sleep_hours < 6:
            total_risk_score += 8
            factors.append({
                "id": "sleep_short",
                "label": "Short sleep duration (less than 6 hours)",
                "direction": "raises",
                "weight": 8,
                "modifiable": True,
                "userValue": f"{sleep_hours} hours / night",
                "explanation": "Much of daily testosterone synthesis occurs during undisturbed deep sleep; short sleep may disrupt endocrine balance."
            })
            actions.append("Prioritise 7-8 hours of sleep per night to support natural nocturnal recovery.")
        elif 7 <= sleep_hours <= 9:
            favourable_factors.append({
                "id": "sleep_optimal",
                "label": "Healthy sleep duration",
                "direction": "lowers",
                "weight": -6,
                "modifiable": True,
                "userValue": f"{sleep_hours} hours / night",
                "explanation": "Consistent 7-9 hours sleep supports physiological endocrine rhythms."
            })

    # Stress Level (1-5)
    stress_level = answers.get("stressLevel") if answers.get("stressLevel") is not None else answers.get("stress_level")
    if stress_level is not None:
        if stress_level >= 4:
            total_risk_score += 7
            factors.append({
                "id": "stress_high",
                "label": "High psychological or work stress",
                "direction": "raises",
                "weight": 7,
                "modifiable": True,
                "userValue": f"{stress_level} of 5",
                "explanation": "Higher stress levels may elevate cortisol and subtly suppress reproductive hormone signals."
            })
            actions.append("Incorporate daily decompression (e.g. 15 minutes walking, breathwork, or deliberate rest).")
        elif stress_level <= 2:
            favourable_factors.append({
                "id": "stress_low",
                "label": "Low everyday stress level",
                "direction": "lowers",
                "weight": -4,
                "modifiable": True,
                "userValue": f"{stress_level} of 5",
                "explanation": "Lower perceived stress is associated with stable endocrine regulation."
            })

    # Exercise Days
    exercise_days = answers.get("exerciseDays") if answers.get("exerciseDays") is not None else answers.get("exercise_days")
    if exercise_days is not None:
        if exercise_days >= 3:
            favourable_factors.append({
                "id": "exercise_regular",
                "label": "Regular physical activity (3+ days/week)",
                "direction": "lowers",
                "weight": -8,
                "modifiable": True,
                "userValue": f"{exercise_days} days / week",
                "explanation": "Supports insulin sensitivity, pelvic blood circulation, and antioxidant defenses."
            })
        elif exercise_days == 0:
            total_risk_score += 6
            factors.append({
                "id": "exercise_sedentary",
                "label": "Sedentary routine",
                "direction": "raises",
                "weight": 6,
                "modifiable": True,
                "userValue": "0 days / week",
                "explanation": "Prolonged sitting can increase scrotal temperature and slow metabolic clearance."
            })
            actions.append("Begin with 20 minutes of brisk walking 3-4 days a week to stimulate blood flow.")

    # Heat Exposure
    raw_heat = answers.get("heatExposure") or answers.get("heat_exposure") or []
    heat_list = [h for h in raw_heat if h != "none"]
    if heat_list:
        pts = len(heat_list) * 6
        total_risk_score += pts
        factors.append({
            "id": "heat_exposure",
            "label": "Frequent scrotal heat exposure",
            "direction": "raises",
            "weight": pts,
            "modifiable": True,
            "userValue": ", ".join(format_label(h) for h in heat_list),
            "explanation": "Sperm production is sensitive to heat. Frequent saunas or hot laptops on the lap can elevate local temperature."
        })
        actions.append("Avoid prolonged hot tubs or saunas, and avoid resting laptops directly on the lap for the next 3 months.")

    # Supplements / Steroids
    supplements = answers.get("supplementsSteroids") or answers.get("supplements_steroids")
    if supplements == "current":
        total_risk_score += 35
        factors.append({
            "id": "steroids_current",
            "label": "Current testosterone or anabolic compound use",
            "direction": "raises",
            "weight": 35,
            "modifiable": True,
            "userValue": "Currently using",
            "explanation": "Exogenous testosterone signals the brain to pause its own LH and FSH signals, which may significantly reduce sperm production."
        })
        actions.append("Discuss a medically supervised cessation plan with an andrologist or endocrinologist.")
        doctor_questions.append("What is the safest protocol to evaluate my natural LH and FSH recovery?")
    elif supplements == "past":
        total_risk_score += 12
        factors.append({
            "id": "steroids_past",
            "label": "Past testosterone or anabolic use",
            "direction": "raises",
            "weight": 12,
            "modifiable": False,
            "userValue": "Past use",
            "explanation": "Natural hormone recovery can take several months depending on past history and duration."
        })
        doctor_questions.append("Can we check my baseline LH, FSH, and testosterone levels?")

    # Recreational Substances
    recreational = answers.get("recreationalSubstances") or answers.get("recreational_substances")
    if recreational == "regular":
        total_risk_score += 14
        factors.append({
            "id": "substances_regular",
            "label": "Regular substance use",
            "direction": "raises",
            "weight": 14,
            "modifiable": True,
            "userValue": "Regular use",
            "explanation": "Certain substances may interact with reproductive receptors and sperm membrane integrity."
        })
        actions.append("Reducing or stopping recreational substance use supports cellular recovery.")
    elif recreational == "occasional":
        total_risk_score += 7
        factors.append({
            "id": "substances_occasional",
            "label": "Occasional substance use",
            "direction": "raises",
            "weight": 7,
            "modifiable": True,
            "userValue": "Occasional",
            "explanation": "Mild impact on the seminal fluid environment."
        })

    # 5. Body & Metabolic (BMI & Waist concern)
    height_cm = answers.get("heightCm") if answers.get("heightCm") is not None else answers.get("height_cm")
    weight_kg = answers.get("weightKg") if answers.get("weightKg") is not None else answers.get("weight_kg")
    bmi = calculate_bmi(height_cm, weight_kg)

    if bmi is not None:
        if bmi >= 30:
            total_risk_score += 15
            factors.append({
                "id": "bmi_obesity",
                "label": "Higher BMI range (30+)",
                "direction": "raises",
                "weight": 15,
                "modifiable": True,
                "userValue": f"BMI {bmi}",
                "explanation": "Higher body fat levels can increase aromatase activity, converting more testosterone into estrogen."
            })
            actions.append("Gradual lifestyle adjustments and 5-10% weight changes often improve hormone ratios.")
            doctor_questions.append("Would a metabolic check (blood sugar and lipid panel) be helpful?")
        elif 25 <= bmi < 30:
            total_risk_score += 7
            factors.append({
                "id": "bmi_overweight",
                "label": "Slightly elevated BMI (25 to 29.9)",
                "direction": "raises",
                "weight": 7,
                "modifiable": True,
                "userValue": f"BMI {bmi}",
                "explanation": "Mild metabolic factor that can be supported through balanced nutrition and movement."
            })
        elif 18.5 <= bmi < 25:
            favourable_factors.append({
                "id": "bmi_normal",
                "label": "Typical BMI range (18.5 to 24.9)",
                "direction": "lowers",
                "weight": -7,
                "modifiable": True,
                "userValue": f"BMI {bmi}",
                "explanation": "Helps maintain balanced metabolic hormone conversion."
            })

    # Waist concern
    waist_concern = answers.get("waistConcern") or answers.get("waist_concern")
    if waist_concern == "yes":
        total_risk_score += 6
        factors.append({
            "id": "waist_concern",
            "label": "Waist circumference concern noted",
            "direction": "raises",
            "weight": 6,
            "modifiable": True,
            "userValue": "Concern noted",
            "explanation": "Central body fat can be an indicator of metabolic load and insulin sensitivity."
        })

    # Conditions
    raw_conditions = answers.get("conditions") or []
    conditions = [c for c in raw_conditions if c != "none"]
    if "diabetes" in conditions:
        total_risk_score += 14
        factors.append({
            "id": "condition_diabetes",
            "label": "Diabetes or elevated blood sugar",
            "direction": "raises",
            "weight": 14,
            "modifiable": True,
            "userValue": "Reported",
            "explanation": "Elevated blood sugar may increase oxidative stress and can influence sperm DNA integrity."
        })
        actions.append("Work closely with your doctor on blood glucose optimization.")
    if "hypertension" in conditions:
        total_risk_score += 8
        factors.append({
            "id": "condition_hypertension",
            "label": "High blood pressure",
            "direction": "raises",
            "weight": 8,
            "modifiable": True,
            "userValue": "Reported",
            "explanation": "Cardiovascular health and certain blood pressure medications can impact vascular blood flow."
        })
    if "thyroid" in conditions:
        total_risk_score += 9
        factors.append({
            "id": "condition_thyroid",
            "label": "Thyroid condition",
            "direction": "raises",
            "weight": 9,
            "modifiable": True,
            "userValue": "Reported",
            "explanation": "Thyroid hormones help regulate general cellular metabolism and reproductive hormone binding."
        })

    # 6. Medical History & Symptoms
    undescended = answers.get("undescendedTesticle") or answers.get("undescended_testicle")
    if undescended == "yes":
        total_risk_score += 16
        factors.append({
            "id": "history_cryptorchidism",
            "label": "History of undescended testicle in infancy",
            "direction": "raises",
            "weight": 16,
            "modifiable": False,
            "userValue": "Yes in childhood",
            "explanation": "Even when corrected early in childhood, a baseline semen check is standard and helpful."
        })
        doctor_questions.append("Could my childhood history have any bearing on my semen test?")

    past_infection = answers.get("pastInfection") or answers.get("past_infection")
    if past_infection == "yes":
        total_risk_score += 12
        factors.append({
            "id": "history_infection",
            "label": "History of urinary or genital infection",
            "direction": "raises",
            "weight": 12,
            "modifiable": False,
            "userValue": "Yes",
            "explanation": "Past infections can sometimes leave mild residual inflammation in the reproductive tract."
        })
        doctor_questions.append("Would you recommend a routine semen culture to rule out lingering inflammation?")

    past_mumps = answers.get("pastMumps") or answers.get("past_mumps")
    if past_mumps == "yes":
        total_risk_score += 10
        factors.append({
            "id": "history_mumps",
            "label": "History of mumps",
            "direction": "raises",
            "weight": 10,
            "modifiable": False,
            "userValue": "Yes",
            "explanation": "Mumps in adolescence can occasionally cause orchitis that affects testicular tubules."
        })

    past_surgery = answers.get("pastSurgeryInjury") or answers.get("past_surgery_injury")
    if past_surgery == "yes":
        total_risk_score += 8
        factors.append({
            "id": "history_surgery_injury",
            "label": "Past hernia/scrotal surgery or injury",
            "direction": "raises",
            "weight": 8,
            "modifiable": False,
            "userValue": "Yes",
            "explanation": "Surgeries or injuries in the groin area can sometimes influence local blood supply."
        })

    # Symptoms
    raw_symptoms = answers.get("currentSymptoms") or answers.get("current_symptoms") or []
    symptoms = [s for s in raw_symptoms if s != "none"]

    if "heaviness_veins" in symptoms:
        total_risk_score += 16
        factors.append({
            "id": "symptom_varicocele",
            "label": "Feeling of heaviness or swollen veins (possible varicocele sign)",
            "direction": "raises",
            "weight": 16,
            "modifiable": True,
            "userValue": "Heaviness or vein fullness",
            "explanation": "A varicocele (enlarged scrotal veins) is very common and often correctable. An in-person check can verify if one is present."
        })
        actions.append("Schedule a physical examination and scrotal ultrasound with a doctor.")
        doctor_questions.append("Could my symptoms indicate a varicocele, and would an ultrasound help confirm?")

    if "dull_ache" in symptoms:
        total_risk_score += 8
        factors.append({
            "id": "symptom_ache",
            "label": "Dull ache or discomfort",
            "direction": "raises",
            "weight": 8,
            "modifiable": True,
            "userValue": "Dull ache",
            "explanation": "A dull ache can be linked with congestion or mild structural factors that are easily checked by a clinician."
        })

    if "low_libido" in symptoms or "erection_difficulty" in symptoms:
        total_risk_score += 10
        factors.append({
            "id": "symptom_sexual",
            "label": "Changes in libido or erection firmness",
            "direction": "raises",
            "weight": 10,
            "modifiable": True,
            "userValue": "Reported",
            "explanation": "Can relate to sleep deficits, stress, general vascular health, or hormone levels."
        })
        actions.append("Ask your doctor about a routine morning hormone check.")

    # 7. Optional Semen Analysis (WHO 2021 Reference Limits)
    has_semen = answers.get("hasSemenAnalysis") or answers.get("has_semen_analysis")
    if has_semen:
        semen_vol = answers.get("semenVolume") if answers.get("semenVolume") is not None else answers.get("semen_volume")
        if semen_vol is not None and semen_vol < 1.4:
            total_risk_score += 14
            factors.append({
                "id": "semen_volume_low",
                "label": "Semen volume below standard reference limit (<1.4 mL)",
                "direction": "raises",
                "weight": 14,
                "modifiable": True,
                "userValue": f"{semen_vol} mL",
                "explanation": "WHO 2021 lower normal limit is 1.4 mL. Lower volumes can occur from incomplete collection or short abstinence."
            })
            doctor_questions.append("Should we repeat the semen test after a standardized abstinence period?")

        sperm_conc = answers.get("spermConcentration") if answers.get("spermConcentration") is not None else answers.get("sperm_concentration")
        if sperm_conc is not None and sperm_conc < 16:
            total_risk_score += 22
            factors.append({
                "id": "semen_concentration_low",
                "label": "Sperm concentration below standard reference limit (<16 M/mL)",
                "direction": "raises",
                "weight": 22,
                "modifiable": True,
                "userValue": f"{sperm_conc} M/mL",
                "explanation": "WHO 2021 lower normal limit is 16 million/mL. A repeat test in 4-6 weeks is standard practice before drawing conclusions."
            })
            doctor_questions.append("What is the recommended interval for a confirmatory repeat semen test?")

        tot_motility = answers.get("totalMotility") if answers.get("totalMotility") is not None else answers.get("total_motility")
        if tot_motility is not None and tot_motility < 42:
            total_risk_score += 14
            factors.append({
                "id": "semen_total_motility_low",
                "label": "Total motility below reference limit (<42%)",
                "direction": "raises",
                "weight": 14,
                "modifiable": True,
                "userValue": f"{tot_motility}%",
                "explanation": "WHO 2021 lower reference limit is 42%. Lifestyle habits and cooling often support positive improvements."
            })

        prog_motility = answers.get("progressiveMotility") if answers.get("progressiveMotility") is not None else answers.get("progressive_motility")
        if prog_motility is not None and prog_motility < 30:
            total_risk_score += 14
            factors.append({
                "id": "semen_prog_motility_low",
                "label": "Progressive motility below reference limit (<30%)",
                "direction": "raises",
                "weight": 14,
                "modifiable": True,
                "userValue": f"{prog_motility}%",
                "explanation": "WHO 2021 lower limit is 30%. Progressive movement is important for sperm travel."
            })

    # Final score clamped 0 - 100
    final_score = min(100, max(0, total_risk_score))

    # Risk Band
    if len(red_flags) > 0:
        band = "Urgent"
    elif final_score >= 50:
        band = "Elevated"
    elif final_score >= 25:
        band = "Moderate"
    else:
        band = "Low"

    # Triage Level
    sperm_conc = answers.get("spermConcentration") if answers.get("spermConcentration") is not None else answers.get("sperm_concentration")
    if len(red_flags) > 0:
        triage = "Urgent assessment"
        triage_reason = "One or more symptoms flagged could represent time-critical conditions requiring same-day physical assessment."
    elif (family_planning == "trying" and trying_duration == "over_12") or (has_semen and sperm_conc is not None and sperm_conc < 16):
        triage = "Fertility service"
        triage_reason = "Trying for over 12 months or having semen metrics below reference limits warrants dedicated reproductive medicine and couples evaluation."
    elif band == "Elevated" or ("heaviness_veins" in symptoms):
        triage = "Andrology/Urology"
        triage_reason = "Identified anatomical or notable endocrine signals (such as vein swelling or hormonal compound history) are best evaluated by a male reproductive specialist."
    elif band == "Moderate":
        triage = "Primary care"
        triage_reason = "General practitioner / family physician evaluation is ideal to address metabolic, lifestyle, and basic hormone parameters in a supportive setting."
    else:
        triage = "Self-care"
        if len(factors) > 0:
            triage_reason = "A few modifiable factors were found; small everyday changes may help support your overall reproductive wellness."
        else:
            triage_reason = "Low risk profile with reassuring everyday habits. Proactive self-care and ongoing healthy lifestyle choices are recommended."

    # Summary Text
    if band == "Urgent":
        summary = "Important symptoms were noted that require same-day clinical evaluation by a medical doctor."
    elif band == "Elevated":
        summary = "Several identifiable factors were found that can influence reproductive health. Many of these are modifiable or treatable under medical guidance."
    elif band == "Moderate":
        summary = "Your assessment shows a moderate number of areas where lifestyle or general metabolic adjustments can actively support your reproductive vitality."
    else:
        if len(factors) > 0:
            summary = "Your assessment indicates a low overall risk pattern, though a few modifiable factors were noted where small changes may help."
        else:
            summary = "Your assessment indicates a low risk pattern with reassuring protective habits and no immediate clinical red flags."

    if not actions:
        actions.append("Maintain balanced nutrition rich in zinc, selenium, CoQ10, and leafy greens.")
        actions.append("Keep testicles cool by avoiding prolonged hot baths and tight synthetic clothing.")
        actions.append("Stay active with 3-4 days of moderate aerobic exercise and adequate sleep.")

    if not doctor_questions:
        doctor_questions.append("Are there any baseline tests or vitamins you would suggest based on our family timeline?")
        doctor_questions.append("How frequently should we monitor my overall metabolic and reproductive parameters?")

    missing_info = not has_semen or sleep_hours is None or height_cm is None
    missing_info_note = (
        "This screening is based on the information you shared. Additional details (such as a laboratory semen analysis or metabolic lab values) can make future guidance even more precise."
        if missing_info else None
    )

    # Sort factors descending by weight
    factors.sort(key=lambda x: x["weight"], reverse=True)

    return {
        "score": final_score,
        "band": band,
        "triage": triage,
        "triageReason": triage_reason,
        "summary": summary,
        "factors": factors,
        "favourableFactors": favourable_factors,
        "redFlags": red_flags,
        "missingInfoNote": missing_info_note,
        "actions": actions,
        "doctorQuestions": doctor_questions,
        "calculatedAt": datetime.now(timezone.utc).isoformat()
    }
