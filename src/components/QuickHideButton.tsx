import React from 'react';
import { useApp } from '../store/AppContext';
import { EyeOff } from 'lucide-react';

export const QuickHideButton: React.FC = () => {
  const { triggerQuickHide, t } = useApp();

  return (
    <button
      type="button"
      onClick={triggerQuickHide}
      aria-label={t.quickHideTooltip}
      title={`${t.quickHide} (Esc)`}
      className="group inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 sm:px-3.5 rounded-full text-xs sm:text-sm font-semibold
                 bg-[var(--card)] text-[var(--text-main)] border border-[var(--border-strong)]
                 hover:border-[var(--accent)] hover:bg-[var(--surface)]
                 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
    >
      <EyeOff className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
      <span>{t.quickHide}</span>
      <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] uppercase font-mono rounded bg-[var(--surface)] border border-[var(--border-hairline)] text-[var(--text-muted)]">
        Esc
      </kbd>
    </button>
  );
};
