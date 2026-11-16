import { 
  AssessmentAnswers, 
  AssessmentResult, 
  ConsentSettings, 
  SyntheticCohortMetrics, 
  Clinic, 
  AccessLogItem, 
  Language 
} from '../types';
import { assessRisk } from '../engine/riskEngine';
import { generateSyntheticCohort, MOCK_CLINICS } from '../data/syntheticCohort';

/**
 * Service Layer for HAYAT
 * Designed for clean plug-and-play backend migration.
 * Set VITE_USE_MOCK=false and define VITE_API_BASE to connect a real REST/GraphQL microservice.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function assess(answers: AssessmentAnswers): Promise<AssessmentResult> {
  if (USE_MOCK) {
    // Realistic computation delay
    await delay(1200);
    return assessRisk(answers);
  }

  // TODO: Replace with real backend endpoint POST /api/assess
  const res = await fetch(`${API_BASE}/assess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers)
  });
  if (!res.ok) throw new Error('Failed to compute screening assessment');
  return res.json();
}

export async function explain(
  result: AssessmentResult, 
  mode: 'simple' | 'detailed', 
  language: Language
): Promise<string> {
  if (USE_MOCK) {
    await delay(200);
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

  // TODO: Replace with real backend endpoint POST /api/explain
  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result, mode, language })
  });
  return (await res.json()).explanation;
}

export async function saveConsent(consent: ConsentSettings): Promise<{ success: boolean; timestamp: string }> {
  const timestamp = new Date().toISOString();
  if (USE_MOCK) {
    await delay(150);
    return { success: true, timestamp };
  }

  // TODO: Replace with real backend endpoint POST /api/consent
  const res = await fetch(`${API_BASE}/consent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...consent, timestamp })
  });
  return res.json();
}

export async function getConsentLog(): Promise<AccessLogItem[]> {
  if (USE_MOCK) {
    await delay(100);
    return [
      { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Session Initialized', detail: 'Local ephemeral token created' },
      { id: '2', timestamp: new Date(Date.now() - 1800000).toISOString(), action: 'Consent Registered', detail: 'User enabled processing consent' }
    ];
  }

  // TODO: Replace with real backend endpoint GET /api/consent-log
  const res = await fetch(`${API_BASE}/consent-log`);
  return res.json();
}

export async function deleteAllData(): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    await delay(200);
    return { success: true };
  }

  // TODO: Replace with real backend endpoint DELETE /api/data
  const res = await fetch(`${API_BASE}/data`, { method: 'DELETE' });
  return res.json();
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

export async function getEvidence(): Promise<SyntheticCohortMetrics> {
  if (USE_MOCK) {
    await delay(300);
    return generateSyntheticCohort();
  }

  // TODO: Replace with real backend endpoint GET /api/evidence
  const res = await fetch(`${API_BASE}/evidence`);
  return res.json();
}

export async function getClinics(filters?: { maleFriendly?: boolean; privateEntrance?: boolean }): Promise<Clinic[]> {
  if (USE_MOCK) {
    await delay(250);
    let list = [...MOCK_CLINICS];
    if (filters?.maleFriendly) {
      list = list.filter(c => c.features.maleFriendly);
    }
    if (filters?.privateEntrance) {
      list = list.filter(c => c.features.privateEntrance);
    }
    return list;
  }

  // TODO: Replace with real backend endpoint GET /api/clinics
  const query = new URLSearchParams(filters as any).toString();
  const res = await fetch(`${API_BASE}/clinics?${query}`);
  return res.json();
}

export async function bookTeleconsult(slot: { clinicId: string; date: string; time: string; discreetLabel: boolean }): Promise<{ bookingId: string; status: string }> {
  if (USE_MOCK) {
    await delay(400);
    return {
      bookingId: `TC-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'confirmed_discreet'
    };
  }

  // TODO: Replace with real backend endpoint POST /api/teleconsult
  const res = await fetch(`${API_BASE}/teleconsult`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slot)
  });
  return res.json();
}
