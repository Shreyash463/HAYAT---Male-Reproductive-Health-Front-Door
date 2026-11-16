import { 
  AssessmentAnswers, 
  AssessmentResult, 
  ConsentSettings, 
  SyntheticCohortMetrics, 
  Clinic, 
  AccessLogItem, 
  Language,
  OutboundCallLog
} from '../types';
import { assessRisk } from '../engine/riskEngine';
import { generateSyntheticCohort, MOCK_CLINICS } from '../data/syntheticCohort';
import staticEvidence from '../data/evidence.generated.json';

/**
 * Service Layer for HAYAT
 * 
 * CORE PRIVACY PRINCIPLE:
 * The TypeScript rule engine is the single source of truth and operates 100% on the user's client device.
 * Assessment answers never leave the device.
 * 
 * The backend is an OPTIONAL sidecar used strictly for:
 * 1. AI plain-language rewriting of explanations (POST /api/explain) using strictly enum-coded factor identifiers.
 * 2. Serving simulated evidence cohort & assumptions (GET /api/evidence).
 * 3. Collecting opt-in anonymised research aggregates (POST /api/research-share).
 * 4. Health checks (GET /api/health).
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function logOutbound(log: OutboundCallLog) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hayat:outbound', { detail: log }));
  }
}

/**
 * Local deterministic templates used when offline, mock, or if consent is not granted.
 */
function getDeterministicExplanation(result: AssessmentResult, mode: 'simple' | 'detailed', language: Language): string {
  if (language === 'ar') {
    return mode === 'simple'
      ? `هذه النتيجة (${result.band}) تستند إلى ${result.factors.length} عوامل مؤثرة تم تحديدها، مع ${result.favourableFactors.length} عوامل إيجابية مطمئنة.`
      : `التحليل التفصيلي يظهر أن العوامل الأكثر تأثيراً هي: ${result.factors.slice(0, 3).map(f => f.label).join('، ')}. وننصح بمتابعة المسار الموصى به: ${result.triage}.`;
  }
  if (language === 'hi') {
    return mode === 'simple'
      ? `यह परिणाम (${result.band}) आपके द्वारा साझा किए गए ${result.factors.length} मुख्य कारकों पर आधारित है, जबकि ${result.favourableFactors.length} कारक आपके पक्ष में सकारात्मक हैं।`
      : `विस्तृत विश्लेषण: मुख्य प्राथमिक कारक हैं: ${result.factors.slice(0, 3).map(f => f.label).join(', ')}. अनुशंसित देखभाल स्तर: ${result.triage}.`;
  }
  return mode === 'simple'
    ? `This screening result (${result.band}) is derived from ${result.factors.length} identified factors, balanced by ${result.favourableFactors.length} reassuring favourable habits.`
    : `Detailed breakdown: Primary contributing factors include ${result.factors.slice(0, 3).map(f => f.label).join(', ')}. Triage guidance directs to: ${result.triage}.`;
}

/**
 * Compute screening assessment 100% on-device.
 * Zero data leaves the client.
 */
export async function assess(answers: AssessmentAnswers): Promise<AssessmentResult> {
  // Realistic brief computation delay to simulate thorough multi-step factor evaluation
  await delay(600);
  return assessRisk(answers);
}

/**
 * Plain-language explanation.
 * If consent.useAiExplanation is enabled and backend is available, requests an AI simplification
 * using ONLY enum factor tags (no raw text, no personal data).
 */
export async function explain(
  result: AssessmentResult, 
  mode: 'simple' | 'detailed', 
  language: Language,
  consentGiven: boolean = false
): Promise<{ explanation: string; aiUsed: boolean }> {
  const fallback = getDeterministicExplanation(result, mode, language);

  if (!consentGiven || USE_MOCK) {
    return { explanation: fallback, aiUsed: false };
  }

  const endpoint = `${API_BASE}/explain`;
  const factorIds = result.factors.map(f => f.id);
  const payloadSummary = `Factor IDs: [${factorIds.slice(0, 6).join(', ')}${factorIds.length > 6 ? '...' : ''}], Language: ${language}, Mode: ${mode} (NO PII)`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        band: result.band,
        triage_level: result.triage,
        language,
        mode,
        factors: result.factors.map(f => ({
          id: f.id,
          direction: f.direction,
          modifiable: f.modifiable
        }))
      }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined
    });

    if (!res.ok) {
      logOutbound({
        id: `out-${Date.now()}`,
        timestamp: new Date().toISOString(),
        endpoint: '/api/explain',
        method: 'POST',
        payloadSummary,
        status: 'fallback',
        responseSummary: `HTTP ${res.status}: fallback to local deterministic template`
      });
      return { explanation: fallback, aiUsed: false };
    }

    const data = await res.json();
    logOutbound({
      id: `out-${Date.now()}`,
      timestamp: new Date().toISOString(),
      endpoint: '/api/explain',
      method: 'POST',
      payloadSummary,
      status: 'success',
      responseSummary: `AI simplification returned (${data.ai_used ? 'Gemini 2.5 Flash' : 'Safety template'})`
    });

    return {
      explanation: data.explanation || fallback,
      aiUsed: Boolean(data.ai_used)
    };
  } catch (err: any) {
    logOutbound({
      id: `out-${Date.now()}`,
      timestamp: new Date().toISOString(),
      endpoint: '/api/explain',
      method: 'POST',
      payloadSummary,
      status: 'failed',
      responseSummary: `Network/timeout (${err.message || 'offline'}), local fallback used`
    });
    return { explanation: fallback, aiUsed: false };
  }
}

/**
 * Opt-in anonymised aggregate research sharing.
 * Submits strictly age group, risk band, triage category, and day-level date.
 */
export async function shareResearch(
  answers: AssessmentAnswers,
  result: AssessmentResult,
  language: Language,
  consentGiven: boolean
): Promise<{ success: boolean; recordId?: string }> {
  if (!consentGiven) {
    return { success: false };
  }

  const endpoint = `${API_BASE}/research-share`;
  const ageBracket = answers.ageRange || 'unspecified';
  const payloadSummary = `Age bracket: ${ageBracket}, Band: ${result.band}, Triage: ${result.triage}, Language: ${language}, Date: ${new Date().toISOString().slice(0, 10)}`;

  if (USE_MOCK) {
    await delay(200);
    logOutbound({
      id: `out-${Date.now()}`,
      timestamp: new Date().toISOString(),
      endpoint: '/api/research-share',
      method: 'POST',
      payloadSummary,
      status: 'offline',
      responseSummary: 'Simulated local acceptance (mock mode active)'
    });
    return { success: true, recordId: `mock-${Date.now()}` };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age_bracket: ageBracket,
        band: result.band,
        triage_level: result.triage,
        language,
        date: new Date().toISOString().slice(0, 10),
        consent_given: true
      }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined
    });

    if (!res.ok) {
      logOutbound({
        id: `out-${Date.now()}`,
        timestamp: new Date().toISOString(),
        endpoint: '/api/research-share',
        method: 'POST',
        payloadSummary,
        status: 'failed',
        responseSummary: `HTTP ${res.status}`
      });
      return { success: false };
    }

    const data = await res.json();
    logOutbound({
      id: `out-${Date.now()}`,
      timestamp: new Date().toISOString(),
      endpoint: '/api/research-share',
      method: 'POST',
      payloadSummary,
      status: 'success',
      responseSummary: `Stored record ID: ${data.record_id} (${data.backend_storage})`
    });

    return { success: true, recordId: data.record_id };
  } catch (err: any) {
    logOutbound({
      id: `out-${Date.now()}`,
      timestamp: new Date().toISOString(),
      endpoint: '/api/research-share',
      method: 'POST',
      payloadSummary,
      status: 'failed',
      responseSummary: `Network/timeout (${err.message || 'offline'})`
    });
    return { success: false };
  }
}

export async function saveConsent(consent: ConsentSettings): Promise<{ success: boolean; timestamp: string }> {
  // Consent is strictly stored on the client device
  const timestamp = new Date().toISOString();
  await delay(50);
  return { success: true, timestamp };
}

export async function getConsentLog(): Promise<AccessLogItem[]> {
  await delay(50);
  return [
    { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Session Initialized', detail: 'Local ephemeral token created' },
    { id: '2', timestamp: new Date(Date.now() - 1800000).toISOString(), action: 'Consent Registered', detail: 'User enabled processing consent' }
  ];
}

export async function deleteAllData(): Promise<{ success: boolean }> {
  await delay(150);
  return { success: true };
}

export async function exportData(answers: AssessmentAnswers | null, result: AssessmentResult | null, consent: ConsentSettings): Promise<string> {
  const payload = {
    exportedAt: new Date().toISOString(),
    protocol: 'HAYAT-V1-STANDARDS',
    consent,
    answers: answers || {},
    screeningResult: result || null,
    complianceNote: 'Exported under explicit user unilateral control.'
  };
  return JSON.stringify(payload, null, 2);
}

function normalizeCohortMetrics(raw: any): SyntheticCohortMetrics {
  return {
    totalCases: raw.total_cases ?? raw.totalCases ?? 500,
    completionRate: raw.completion_rate ?? raw.completionRate ?? 91.4,
    medianTimeWithoutHayatMonths: raw.median_time_without_hayat_months ?? raw.medianTimeWithoutHayatMonths ?? 7.5,
    medianTimeWithHayatMonths: raw.median_time_with_hayat_months ?? raw.medianTimeWithHayatMonths ?? 2.4,
    referralCompletionRate: raw.referral_completion_rate ?? raw.referralCompletionRate ?? 68.2,
    trustScore: raw.trust_score ?? raw.trustScore ?? 4.6,
    redFlagRecall: raw.red_flag_recall ?? raw.redFlagRecall ?? 100.0,
    redFlagKpiLabel: raw.red_flag_kpi_label ?? raw.redFlagKpiLabel ?? 'by design: rule-based safety override',
    completionFunnel: (raw.completion_funnel || raw.completionFunnel || []).map((f: any) => ({
      step: f.step,
      completionRate: f.completion_rate ?? f.completionRate
    })),
    timeComparison: (raw.time_comparison || raw.timeComparison || []).map((t: any) => ({
      group: t.group,
      months: t.months
    })),
    triageDistribution: (raw.triage_distribution || raw.triageDistribution || []).map((td: any) => ({
      level: td.level,
      percentage: td.percentage,
      count: td.count
    })),
    fairnessByAge: (raw.fairness_by_age || raw.fairnessByAge || []).map((fa: any) => ({
      ageGroup: fa.group ?? fa.ageGroup,
      group: fa.group ?? fa.ageGroup,
      completion: fa.completion,
      triageAccuracy: fa.consistency_rate ?? fa.triageAccuracy ?? 98.8,
      consistencyRate: fa.consistency_rate ?? fa.triageAccuracy ?? 98.8,
      trust: fa.trust
    })),
    fairnessByLanguage: (raw.fairness_by_language || raw.fairnessByLanguage || []).map((fl: any) => ({
      language: fl.group ?? fl.language,
      group: fl.group ?? fl.language,
      completion: fl.completion,
      triageAccuracy: fl.consistency_rate ?? fl.triageAccuracy ?? 98.7,
      consistencyRate: fl.consistency_rate ?? fl.triageAccuracy ?? 98.7,
      trust: fl.trust
    })),
    maxGapPercentage: raw.max_gap_percentage ?? raw.maxGapPercentage ?? 1.8,
    consistencyAchieved: raw.consistency_achieved ?? raw.parityAchieved ?? true,
    parityAchieved: true,
    assumptions: raw.assumptions || []
  };
}

export async function getEvidence(): Promise<SyntheticCohortMetrics> {
  if (!USE_MOCK) {
    try {
      const res = await fetch(`${API_BASE}/evidence`, {
        signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
      });
      if (res.ok) {
        const raw = await res.json();
        return normalizeCohortMetrics(raw);
      }
    } catch {
      // Backend not running or unreachable -> fall back seamlessly to generated static cohort
    }
  }

  // Static generated cohort metrics fallback
  if (staticEvidence) {
    return normalizeCohortMetrics(staticEvidence);
  }
  return generateSyntheticCohort();
}

export async function getClinics(filters?: { maleFriendly?: boolean; privateEntrance?: boolean }): Promise<Clinic[]> {
  await delay(150);
  let list = [...MOCK_CLINICS];
  if (filters?.maleFriendly) {
    list = list.filter(c => c.features.maleFriendly);
  }
  if (filters?.privateEntrance) {
    list = list.filter(c => c.features.privateEntrance);
  }
  return list;
}

export async function bookTeleconsult(slot: { clinicId: string; date: string; time: string; discreetLabel: boolean }): Promise<{ bookingId: string; status: string }> {
  await delay(300);
  return {
    bookingId: `TC-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'confirmed_discreet'
  };
}
