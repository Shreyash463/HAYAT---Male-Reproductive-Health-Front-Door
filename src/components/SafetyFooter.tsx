import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const SafetyFooter: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="mt-auto border-t border-[var(--border-hairline)] bg-[var(--surface)] py-7 px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
        <div className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-5 h-5 text-[var(--accent-text)] shrink-0" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-xs sm:text-sm font-semibold border border-[var(--border-hairline)] whitespace-nowrap">
            {t.safetyBadge}
          </span>
        </div>

        <p className="text-center md:text-start max-w-3xl leading-relaxed text-sm text-[var(--text-muted)]">
          <Info className="inline w-4 h-4 me-1.5 text-[var(--brand)] align-text-bottom" />
          {t.safetyDisclaimer}
        </p>

        <div className="text-xs sm:text-sm text-[var(--text-muted)] font-mono whitespace-nowrap">
          Abu Dhabi Innovation Challenge 2026
        </div>
      </div>
    </footer>
  );
};
