# HAYAT (حياة) — Male Reproductive Health Front Door

> Built for the **Future Health Digital Innovation Challenge** (Abu Dhabi, UAE)  
> Organized by Future Health, Microsoft, Inception, and MBZUAI  
> **Challenge Track:** `[Fertility] Male Reproductive Health`

---

## 1. Executive Summary

Male reproductive health has historically suffered from the **"late entry paradox"**: men typically seek clinical assessment only after 12 to 36 months of unassisted difficulty conceiving, or after their female partner has completed invasive and exhausting evaluations. This systemic delay leads to missed opportunities to identify and reverse **modifiable metabolic, infectious, anatomical, or lifestyle-related risks**.

**HAYAT** is an on-device, stigma-free digital "front door" designed for men in the UAE and Middle Eastern context:
1. **Zero Registration Barrier:** No names, national IDs, phone numbers, or passwords required.
2. **Transparent, Explainable Screening:** Rule-based andrology algorithms that explain precisely *why* each risk factor contributes to the score, paired with a counterfactual "What-If" simulator.
3. **Clinical Triage & Human Oversight:** Direct mapping to 5 validated clinical triage tiers (*Self-care → Primary care → Andrology/Urology → Fertility services → Urgent assessment*).
4. **Unilateral Data Control:** Granular consent toggles, real-time data inventory, live outbound network audit, and single-click data purge.
5. **Instant Discreet Exit ("Quick Hide"):** Pressing `Escape` or tapping "Quick Hide" instantly replaces the interface with a neutral wellness tracker.
6. **Safe AI Augmentation:** Optional Google Gemini 2.5 Flash plain-language rewriting powered strictly by non-identifying enum factor tags, backed by automated medical framing safety filters.

---

## 2. Core Architectural Principles

- **Screening, Not Diagnosis:** HAYAT never diagnoses diseases or prescribes treatments. It surfaces signals to guide patient-clinician conversations.
- **Explainability Over Black Boxes:** No probabilistic black-box hallucinations. Every outcome is calculated from published andrology guidelines (EAU, AUA, WHO 2021).
- **Privacy by Design:** 100% on-device execution. Personal answers never leave the client device.
- **Cultural Respect & Dignity:** Full trilingual support across English, Arabic (with native RTL layout), and Hindi, avoiding shaming or presumptive language.

---

## 3. Technology Stack

- **Front-End:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Animation & Motion:** Framer Motion, GSAP (ScrollTrigger), Lenis, Three.js / React Three Fiber (Hero Canvas)
- **Visuals & Charts:** Recharts, Lucide Icons, Canvas Confetti
- **Backend Sidecar:** Python 3.13, FastAPI, Pydantic v2 (`extra="forbid"`), Google GenAI SDK (`gemini-2.5-flash`), SlowAPI, Uvicorn
- **Testing:** Vitest (17 front-end tests), Pytest (26 backend tests + 500-case parity suite), Playwright (7 E2E scenarios)

---

## 4. Screen Inventory

| Screen | Route | Description |
|---|---|---|
| **Landing** | `/` | Hero with WebGL dotted wave, trust badges, clinical rationale, instant demo scenario triggers |
| **Consent** | `/consent` | Plain-language permissions, "What we do vs What we never do", granular consent toggles (including optional AI toggle) |
| **Assessment Wizard** | `/check` | 6-step questionnaire with conditional logic (e.g. trying duration conditional on active trying), keyboard shortcut guard, skip question support |
| **Analysing** | `/analysing` | Safety-first transition verifying urgent red-flags first |
| **Results** | `/results` | Animated risk gauge, explainable factor bars, AI/Rule-based narrative badge, What-If simulator, and doctor questions |
| **Care Navigator** | `/care` | Discreet teleconsultation booking, Abu Dhabi clinics list with privacy filters, referral tracker |
| **Privacy Dashboard** | `/privacy` | Real-time data inventory, live "What left your device" network transmission audit, JSON export, and single-click data wipe |
| **Evidence & Evaluation** | `/evidence` | 500-case simulated cohort metrics, time-to-evaluation reduction, demographic consistency check, and assumptions accordion |
| **How It Works & Safety** | `/how-it-works` | Rule engine breakdown, emergency red-flag limits, FAQ |
| **Quick Hide** | *Global (Esc / Button)* | Instantly replaces the UI with a harmless "Daily Wellness & Hydration" screen |

---

## 5. Running the Application

### Prerequisites
- Node.js 18+ (tested on Node v24.18.0)
- Python 3.11+ (tested on Python 3.13.14)

### Front-End Setup
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Run the Vite development server (port 3000)
npm run dev

# 3. Build for production
npm run build
```

### Backend Sidecar Setup (Optional)
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run FastAPI server (port 8000)
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 6. Running Tests

### Front-End Unit & Integration Tests (Vitest)
```bash
npm test
```
*Runs 17 unit tests verifying scoring boundaries [0, 100], WHO 2021 semen thresholds, acute symptom overrides (100% recall), counterfactual What-If reactivity, and cross-lingual translation parity.*

### Backend Tests & Engine Parity Suite (Pytest)
```bash
python -m pytest backend/tests/ -v
```
*Runs 26 backend tests verifying 100% mathematical parity across 500 edge cases, Gemini safety post-filtering, strict Pydantic schemas, rate limiting, and health endpoints.*

### End-to-End Tests (Playwright)
```bash
npm run test:e2e
```
*Runs 7 browser automation scenarios verifying happy path assessment, conditional question branching, red-flag urgent alerts, zero-network-call privacy proof, Escape-key quick hide, unilateral data purge, and Arabic RTL rendering.*

---

## 7. Documentation Links

- **Deployment Guide:** [`docs/DEPLOY.md`](./docs/DEPLOY.md)
- **Challenge Submission Dossier:** [`docs/SUBMISSION.md`](./docs/SUBMISSION.md)
- **Architectural Assumptions Log:** [`ASSUMPTIONS.md`](./ASSUMPTIONS.md)
