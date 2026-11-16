# HAYAT (حياة) — Official Submission Dossier
**Future Health Digital Innovation Challenge (Abu Dhabi, UAE)**  
**Challenge Category:** `[Fertility] Male Reproductive Health`  
**Consortium:** Future Health, Microsoft, Inception, MBZUAI  
**Target Repository:** [https://github.com/Shreyash463/HAYAT---Male-Reproductive-Health-Front-Door](https://github.com/Shreyash463/HAYAT---Male-Reproductive-Health-Front-Door)  
**Live Production Web App:** [https://hayat-frontend-ten.vercel.app](https://hayat-frontend-ten.vercel.app)  
**Live Backend Health API:** [https://hayat-backend-nu.vercel.app/api/health](https://hayat-backend-nu.vercel.app/api/health)

---

## 1. Solution Summaries

### 100-Word Summary
HAYAT (حياة) is a private, stigma-free digital front door for male reproductive health, built for the Future Health Digital Innovation Challenge in Abu Dhabi. It addresses the systemic delay where men enter fertility pathways only after prolonged difficulty. Operating 100% on-device in the user's browser, HAYAT delivers explainable risk stratification without requiring logins, names, or national IDs. An interactive "What-If" simulator empowers men to visualize modifiable lifestyle improvements across a 90-day spermatogenesis window. Backed by an optional Gemini 2.5 Flash safety-filtered plain-language sidecar and trilingual Arabic RTL design, HAYAT is live at [https://hayat-frontend-ten.vercel.app](https://hayat-frontend-ten.vercel.app).

### 250-Word Summary
In the UAE and Middle Eastern healthcare ecosystem, male reproductive health has long been hindered by the "late entry paradox": men often wait 12–36 months before seeking clinical guidance, frequently only after female partners have undergone invasive evaluations. This delay obscures critical modifiable lifestyle, metabolic, and hormonal factors that can be improved within a single 74-day spermatogenesis cycle.

HAYAT (حياة) solves this through a culturally respectful, zero-friction front door. It requires no app install, registration, phone number, or Emirates ID. The screening engine executes entirely on the user's client device, guaranteeing that sensitive reproductive health inputs never leave their hardware. Grounded in EAU, AUA, and WHO 2021 Semen Analysis standards, HAYAT transparently explains the exact weight and clinical rationale behind every identified factor and features a counterfactual "What-If" simulator that shows how targeted lifestyle improvements lower overall risk before a clinic visit.

For users seeking guidance, an optional FastAPI sidecar leverages Google Gemini 2.5 Flash with strict medical safety filters to translate complex clinical factors into dignified plain language—communicating solely through non-identifying enum tokens. The application provides discreet care navigation with privacy filters, an unmissable 100% recall emergency override for acute testicular symptoms, and a real-time "What left your device" network audit. Tested across 500 synthetic cases and verified live with 100% Lighthouse accessibility, HAYAT is deployed in production at [https://hayat-frontend-ten.vercel.app](https://hayat-frontend-ten.vercel.app).

---

## 2. Challenge Desired Outcomes Mapping

| Desired Challenge Outcome | HAYAT Solution & Architectural Implementation | Key Source Files |
| :--- | :--- | :--- |
| **1. Early Identification of Modifiable Factors** | Screens for heat exposure, obesity/central adiposity, sleep deprivation, chronic stress, nicotine/vaping, and steroid use during the 74-day spermatogenesis cycle. | `src/engine/riskEngine.ts`<br>`src/pages/WizardPage.tsx` |
| **2. Stigma Reduction & Safe Engagement** | Completely anonymous entrance, warm desert-sand visual tone, instant Quick Hide (<kbd>Esc</kbd>), and culturally sensitive trilingual support (Arabic RTL, English, Hindi). | `src/components/QuickHideButton.tsx`<br>`src/i18n/ar.ts`, `src/i18n/hi.ts` |
| **3. Clinical Guideline-Aligned Triage** | Five validated triage categories (Self-Care → Primary Care → Andrology/Urology → Fertility Services → Urgent Assessment) with deterministic red-flag overrides. | `src/engine/riskEngine.ts`<br>`backend/app/engine/risk_engine.py` |
| **4. Explainability & Counterfactual Exploration** | Full factor transparency with point weights, direction, and modifiability flags, accompanied by an interactive "What-If" simulator. | `src/pages/ResultsPage.tsx`<br>`src/components/WhatIfPanel.tsx` |
| **5. Actionable Care Navigation** | Clinic explorer with male-friendly privacy filters, evening discreet slot reservations, and a print-ready Clinician Consultation Summary. | `src/pages/CareNavigatorPage.tsx`<br>`src/components/ClinicianSummaryModal.tsx` |
| **6. Rigorous Parity & Synthetic Evaluation** | 500-case Monte Carlo cohort evaluation demonstrating 100% mathematical parity across TS/Python engines, 100% emergency recall, and demographic consistency. | `backend/app/services/cohort_service.py`<br>`src/pages/EvidencePage.tsx` |

---

## 3. Demo Video Production Kit (2 to 3 Minutes)

This script and shot list uses the **LIVE deployed application** at [https://hayat-frontend-ten.vercel.app](https://hayat-frontend-ten.vercel.app).

### Shot List & Narration Script

| Timestamp | Screen / Visual Cue | Live URL / Action | Narration Script |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:25** | **Hero Landing Page**<br>Taupe dotted wave flowing smoothly on sand background. Switch language to Arabic (العربية) to show RTL layout. | `/#/`<br>Toggle language selector | *"In male reproductive health, the biggest hurdle isn't biology—it's timing and stigma. Most men enter clinical care after years of delay. Welcome to HAYAT, a private, stigma-free front door designed for the UAE and Middle Eastern context. Notice: no login, no name, no phone number required."* |
| **0:25 - 0:50** | **Consent & Onboarding**<br>Point to granular toggles, showing required screening toggle and optional AI toggle. | `/#/consent`<br>Click 'I understand, continue' | *"We believe privacy is an absolute right. HAYAT's clinical rule engine runs 100% on the user's phone. Answers never leave the device. Outbound AI features are strictly opt-in and use non-identifying category tokens."* |
| **0:50 - 1:20** | **Assessment Wizard**<br>Walk through Age $\rightarrow$ Family Planning $\rightarrow$ Daily habits $\rightarrow$ BMI inputs. Show conditional question skipping. | `/#/check`<br>Enter Age 32, Active Trying, select habits | *"The 24-step wizard is completely conditional. When planning for the future, conception timing questions are respectfully omitted. Every question has a skip button. Notice how smooth and calm the interaction feels."* |
| **1:20 - 1:55** | **Results & Explainability**<br>Gauge landing on Moderate. Point out factor bars. Expand the What-If panel and toggle smoking/stress to see score drop. | `/#/results`<br>Interact with What-If toggles | *"Here is the core innovation: explainable screening, not a diagnostic black box. The patient sees exactly why their risk band was assigned. With our counterfactual What-If simulator, they can see that stopping vaping and improving sleep cuts their risk score by 14 points within 90 days."* |
| **1:55 - 2:20** | **Care Navigator & Quick Hide**<br>Show sample clinics with privacy filters. Press <kbd>Esc</kbd> key to demonstrate instant discreet exit. | `/#/care`<br>Press `Escape` key $\rightarrow$ Return | *"When ready for care, HAYAT guides men to discreet intake options. If privacy is needed in an instant, pressing Escape or the discreet exit button immediately displays a harmless hydration tracker."* |
| **2:20 - 2:45** | **Privacy Dashboard & Live Audit**<br>Show "What left your device" live table. Show single-click data wipe. | `/#/privacy`<br>Click 'Delete everything now' | *"In our Privacy Dashboard, a live network audit proves zero health data left the device. And with one click, all local state is permanently erased. Transparent, clinically sound, and private by design. That is HAYAT."* |

---

## 4. Likely Judge Questions & Honest Answers

### Q1: Is HAYAT making a medical diagnosis?
**Honest Answer:**  
*No. HAYAT is strictly a risk screening and clinical guidance front door, never a diagnostic tool. This boundary is stated prominently across every screen, clinician printout, and data export. Fertility status requires in-person medical evaluation by a licensed urologist or andrologist with standardized diagnostic testing (such as dual semen analyses, physical examinations, and hormonal assays). HAYAT simply flags modifiable signals early.*

### Q2: How does the on-device engine work, and does it require the internet?
**Honest Answer:**  
*The entire core risk engine (`src/engine/riskEngine.ts`) is written in TypeScript and runs 100% client-side in the user's browser. It calculates risk scores, identifies directional factors, and evaluates triage ladders locally using deterministic clinical rules. Once loaded, the screening works completely offline without internet or backend availability.*

### Q3: What is the role of Google Gemini AI in this system?
**Honest Answer:**  
*Gemini 2.5 Flash is used exclusively as an optional, opt-in plain-language simplification layer. It never calculates risk scores, never assigns triage tiers, and never receives raw questionnaire answers or personal data. When enabled, it receives only anonymized enum factor codes (e.g., `["stress_high", "sleep_short"]`) to produce readable summaries. Every AI output passes through an automated safety post-filter that rejects diagnostic assertions, alarmist language, and stigmatising terms.*

### Q4: Why is the evidence cohort described as "synthetic"?
**Honest Answer:**  
*We maintain strict scientific transparency: the 500 cases in our evidence evaluation are deterministic Monte Carlo synthetic profiles generated to reflect published UAE demographic, lifestyle, and clinical ranges. They allow us to rigorously audit the rule engine for mathematical parity, demographic fairness across age/language groups, and 100% recall on emergency red-flags without compromising real patient data during prototype development.*

### Q5: How are acute medical emergencies handled?
**Honest Answer:**  
*Safety is enforced by a hardcoded deterministic override. If any acute symptom is reported—such as sudden severe testicular pain, rapid scrotal swelling, or hematospermia—the engine bypasses all lifestyle and metabolic scoring and immediately assigns the 'Urgent assessment' tier with an unmissable red alert guiding the user to same-day emergency evaluation.*

### Q6: What are the next steps for clinical deployment in Abu Dhabi?
**Honest Answer:**  
*The roadmap involves three phases: (1) Formal prospective clinical validation in partnership with Abu Dhabi public fertility and andrology clinics; (2) Integration with Malaffi (Abu Dhabi Health Data Exchange) via authorized FHIR APIs for verified referral tracking with patient consent; and (3) Submission for Software as a Medical Device (SaMD) regulatory clearance under UAE Department of Health (DoH) guidelines.*
