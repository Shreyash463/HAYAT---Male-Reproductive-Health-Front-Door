import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { Globe, Check } from 'lucide-react';
import { Language } from '../types';

export const LangSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: t.langEn },
    { code: 'ar', label: t.langAr },
    { code: 'hi', label: t.langHi },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 min-h-[44px] px-2.5 rounded-xl text-xs sm:text-sm font-medium
                   text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--brand-soft)]
                   border border-transparent hover:border-[var(--border-hairline)] transition-colors cursor-pointer"
      >
        <Globe className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
        <span className="uppercase tracking-wider font-semibold text-xs">{language}</span>
      </button>

      {isOpen && (
        <div className="absolute end-0 mt-1.5 w-40 rounded-2xl bg-[var(--card)] border border-[var(--border-hairline)] shadow-lg py-1.5 z-50 overflow-hidden">
          {languages.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLanguage(l.code);
                setIsOpen(false);
              }}
              className="w-full text-start px-3.5 min-h-[44px] text-sm flex items-center justify-between text-[var(--text-main)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
            >
              <span>{l.label}</span>
              {language === l.code && <Check className="w-4 h-4 text-[var(--accent-text)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
