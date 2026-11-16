import React from 'react';
import { AssessmentResult, AssessmentAnswers } from '../types';
import { formatLabel } from '../utils/formatters';
import { Printer, X, Calendar, Stethoscope } from 'lucide-react';

interface ClinicianSummaryModalProps {
  result: AssessmentResult;
  answers: AssessmentAnswers;
  onClose: () => void;
}

export const ClinicianSummaryModal: React.FC<ClinicianSummaryModalProps> = ({
  result,
  answers,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[var(--card)] border border-[var(--border-hairline)] rounded-3xl shadow-2xl text-[var(--text-main)] overflow-hidden">
        {/* Modal Controls (Not printed) */}
        <div className="no-print p-4 sm:p-5 bg-[var(--surface)] border-b border-[var(--border-hairline)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[var(--accent-text)]" />
            <span className="font-heading font-semibold text-base">Clinician-Ready Assessment Summary</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 min-h-[44px] rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-95 flex items-center gap-2 transition-opacity cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close summary"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--brand-soft)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-white text-slate-900 rounded-b-3xl">
          <div className="border-b border-slate-200 pb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold font-heading tracking-wide text-teal-800">
                  HAYAT CLINICAL SUMMARY
                </span>
                <span className="text-xs uppercase font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                  Patient-Initiated Front Door
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Generated at patient request to facilitate clinician dialogue during initial consultation.
              </p>
            </div>
            <div className="text-right text-xs text-slate-600 font-mono">
              <div className="flex items-center justify-end gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(result.calculatedAt).toLocaleDateString()}</span>
              </div>
              <span className="text-xs text-teal-700 font-medium">De-identified Patient Record</span>
            </div>
          </div>

          <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs sm:text-sm text-teal-900 leading-relaxed">
            <strong>Clinical Notice:</strong> This summary represents self-reported signals and rule-based screening informed by international andrology guidelines. It does not constitute a clinical diagnosis or treatment order.
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-600 uppercase font-semibold">Triage Stratum</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{result.triage}</div>
              <div className="text-xs text-slate-600 mt-1">{result.triageReason}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-600 uppercase font-semibold">Risk Stratum</div>
              <div className="text-sm font-bold text-teal-800 mt-0.5">{result.band} Risk Band</div>
              <div className="text-xs text-slate-600 mt-1">Signal Index: {result.score}/100</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-600 uppercase font-semibold">Reported Family Goal</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {formatLabel(answers.familyPlanning)}
              </div>
              {answers.familyPlanning === 'trying' && answers.tryingDuration && (
                <div className="text-xs text-slate-600 mt-1">Duration: {formatLabel(answers.tryingDuration)}</div>
              )}
            </div>
          </div>

          {result.redFlags.length > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs sm:text-sm text-rose-900">
              <strong className="block font-semibold mb-1 text-rose-800">Reported Acute / Red-Flag Symptoms:</strong>
              <ul className="list-disc list-inside space-y-0.5">
                {result.redFlags.map((rf, i) => (
                  <li key={i}>{rf}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Primary Contributing Factors
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-semibold">Factor / Area</th>
                    <th className="p-2.5 font-semibold">Reported Detail</th>
                    <th className="p-2.5 font-semibold">Reversibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.factors.map(f => (
                    <tr key={f.id}>
                      <td className="p-2.5 font-medium text-slate-800">{f.label}</td>
                      <td className="p-2.5 text-slate-600 font-mono text-xs">{f.userValue}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          f.modifiable ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {f.modifiable ? 'Modifiable' : 'Non-modifiable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {result.factors.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-slate-500 italic">
                        No significant elevated risk factors reported.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Patient Questions Prepared For Discussion
            </h3>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1">
              {result.doctorQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>HAYAT Clinical Bridge • Abu Dhabi Innovation Challenge</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
