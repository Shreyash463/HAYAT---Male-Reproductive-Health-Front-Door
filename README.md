# HAYAT (حياة) - Male Reproductive Health Front Door

> Built for the **Future Health Digital Innovation Challenge** (Abu Dhabi, by Future Health, Microsoft, Inception, MBZUAI)  
> **Challenge:** [Fertility] Male Reproductive Health

---

## 1. Executive Summary

In traditional fertility journeys, men typically enter the clinical pathway only after 12–24 months of delayed conception or after extensive diagnostic procedures have already been conducted on their female partner. This systemic delay leads to missed opportunities to identify and reverse **modifiable metabolic, infectious, anatomical, or lifestyle-related risks**.

**HAYAT** is a private, stigma-free digital "front door" designed for men in the UAE and Middle Eastern context:
1. **Zero Registration Barrier:** No names, national IDs, phone numbers, or passwords required.
2. **Transparent, Explainable Screening:** Rule-based andrology algorithms that explain precisely *why* each risk factor contributes to the score.
3. **Clinical Triage & Human Oversight:** Directly maps users to 5 validated triage tiers (Self-care → Primary care → Andrology/Urology → Fertility services → Urgent assessment).
4. **Unilateral Data Control:** Granular consent toggles, real-time data inventory, single-click data purge, and immediate exit ("Quick Hide").

---

## 2. Core Architectural Principles

- **Screening, Not Diagnosis:** HAYAT never diagnoses diseases or prescribes treatments. It surfaces signals to guide patient-clinician conversations.
- **Explainability Over Black Boxes:** No probabilistic black-box hallucinations. Every outcome is calculated from published andrology guidelines (EAU, AUA, WHO 2021).
- **Privacy by Design:** Ephemeral memory execution by default, with optional user-authorized local device caching.
- **Cultural Respect & Dignity:** Multilingual support across English, Arabic (with native RTL layout), and Hindi, avoiding shaming or presumptive language.

---

## 3. Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS with custom glassmorphism design tokens (`#07131A` midnight teal-black, `#2DD4BF` teal-mint, `#E8D5B5` sand)
- **Routing:** `react-router-dom` (HashRouter for seamless hosting without server-side rewrite constraints)
- **Visuals & Charts:** Recharts, Lucide Icons, Motion (Framer Motion)
- **Service Layer:** Plug-and-play abstraction (`src/services/api.ts`) ready to connect to real microservices

---

## 4. Screen Inventory

| Screen | Route | Description |
|---|---|---|
| **Landing** | `/` | Hero, trust badges, clinical rationale, instant demo scenario triggers |
| **Consent** | `/consent` | Plain-language permissions, "What we do vs What we never do", granular consent toggles |
| **Assessment Wizard** | `/check` | 6-step questionnaire with progress bar, expandable tooltips, non-blocking progression |
| **Analysing** | `/analysing` | Safety-first transition verifying urgent red-flags first |
| **Results** | `/results` | Animated risk gauge, explainable factor bars, triage ladder, tailored action plan |
| **Care Navigator** | `/care` | Discreet teleconsultation booking, Abu Dhabi clinics list with privacy filters, referral tracker |
| **Privacy Dashboard** | `/privacy` | Real-time data inventory, JSON export, device access log, immediate data erasure |
| **Evidence & Evaluation** | `/evidence` | 500-case simulated cohort metrics, time-to-evaluation reduction, demographic fairness audit |
| **How It Works & Safety** | `/how-it-works` | Rule engine breakdown, emergency red-flag limits, 8-question FAQ |
| **Quick Hide** | *Global (Esc / Button)* | Instantly replaces the UI with a harmless "Daily Wellness Tips" screen |

---

## 5. Mock to Real Backend Integration

The app uses a clean service layer in `src/services/api.ts`. To connect your production microservice:
1. In `.env`, set:
   ```env
   VITE_USE_MOCK=false
   VITE_API_BASE=https://api.yourdomain.com/v1
   ```
2. The service layer already implements typed contracts for:
   - `POST /api/assess`
   - `POST /api/explain`
   - `POST /api/consent`
   - `GET /api/consent-log`
   - `DELETE /api/data`
   - `GET /api/export`
   - `GET /api/evidence`
   - `GET /api/clinics`
   - `POST /api/teleconsult`

---

## 6. How to Run Locally

```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev

# Build for production
npm run build
```
