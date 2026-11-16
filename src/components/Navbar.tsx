import React, { useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { QuickHideButton } from './QuickHideButton';
import { LangSwitcher } from './LangSwitcher';
import { Sun, Moon, Menu, X, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, theme, toggleTheme, result, triggerQuickHide } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const lastTapRef = useRef<number>(0);

  const navLinks = [
    { to: '/', label: t.navHome },
    { to: '/check', label: t.navCheck },
    { to: '/care', label: t.navCare },
    { to: '/privacy', label: t.navPrivacy },
    { to: '/evidence', label: t.navEvidence },
    { to: '/how-it-works', label: t.navHowItWorks },
  ];

  // Double-click or double-tap logo triggers Quick Hide; single tap navigates home cleanly
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      lastTapRef.current = 0;
      triggerQuickHide();
      return;
    }
    lastTapRef.current = now;
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-[var(--border-hairline)] transition-colors"
      style={{ backgroundColor: 'var(--nav-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 min-h-[68px] flex items-center justify-between gap-2">
        {/* Logo - double-click/tap triggers Quick Hide */}
        <a
          href="#/"
          onClick={handleLogoClick}
          onDoubleClick={(e) => {
            e.preventDefault();
            triggerQuickHide();
          }}
          title="HAYAT Home (Double-tap for Quick Hide)"
          className="flex items-center gap-2.5 group shrink-0 py-1.5 rounded-xl cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[var(--brand-soft)] border border-[var(--border-strong)] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[var(--accent-text)] transition-transform group-hover:scale-105">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" fill="none" opacity="0.45" />
              <path d="M6.5 12C8.5 9.5 10.5 14.5 12.5 12C14.5 9.5 16 13.5 17.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg sm:text-xl tracking-wide text-[var(--text-main)] font-heading whitespace-nowrap">
              {t.appName}
            </span>
          </div>
        </a>

        {/* Desktop Nav Links - visible >= 1280px (xl) */}
        <nav className="hidden xl:flex items-center gap-1 whitespace-nowrap" aria-label="Primary">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] inline-flex items-center ${
                  isActive
                    ? 'text-[var(--accent-text)] bg-[var(--accent-soft)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--brand-soft)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {result && (
            <NavLink
              to="/results"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] ${
                  isActive
                    ? 'text-[var(--text-main)] bg-[var(--brand-soft)] font-semibold border border-[var(--border-strong)]'
                    : 'text-[var(--brand)] hover:text-[var(--text-main)] hover:bg-[var(--brand-soft)]'
                }`
              }
            >
              <Sparkles className="w-4 h-4 text-[var(--accent-text)]" />
              <span>Results</span>
            </NavLink>
          )}
        </nav>

        {/* Right utility items */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light sand theme' : 'Switch to dark charcoal theme'}
            title={theme === 'dark' ? 'Light Sand Theme' : 'Dark Charcoal Theme'}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--brand-soft)] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#E6B86A]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--brand)]" />
            )}
          </button>

          <LangSwitcher />

          <QuickHideButton />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--brand-soft)] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[var(--accent-text)]" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Drawer below 1280px */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-[var(--border-hairline)] bg-[var(--surface)] px-4 py-3 space-y-1 shadow-lg">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center min-h-[44px] px-3.5 py-2.5 rounded-xl text-base font-medium ${
                  isActive
                    ? 'text-[var(--accent-text)] bg-[var(--accent-soft)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--brand-soft)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {result && (
            <NavLink
              to="/results"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 min-h-[44px] px-3.5 py-2.5 rounded-xl text-base font-semibold text-[var(--accent-text)] bg-[var(--accent-soft)] mt-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>View Screening Results</span>
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
};
