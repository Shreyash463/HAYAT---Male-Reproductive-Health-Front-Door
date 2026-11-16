import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Home } from 'lucide-react';
import { Reveal } from '../motion';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
      <Reveal>
        <div className="max-w-md w-full paper-card p-8 sm:p-10 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)] mx-auto flex items-center justify-center border border-[var(--border-hairline)]">
            <Compass className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand)] font-semibold">
              Page Not Found
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-main)]">
              We couldn&apos;t find that page
            </h1>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              Your private session is safe. Return home or start a private reproductive health check.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 min-h-[48px] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-main)] font-semibold text-base flex items-center justify-center gap-2 hover:bg-[var(--card-alt)] transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
            <Link
              to="/consent"
              className="w-full sm:w-auto px-6 min-h-[48px] rounded-2xl bg-[var(--accent)] text-white font-semibold text-base flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              <span>Start Private Check</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
};
