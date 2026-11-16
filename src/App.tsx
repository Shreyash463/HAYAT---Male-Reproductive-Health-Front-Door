import React, { Suspense, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import { AppProvider, useApp } from './store/AppContext';
import { Navbar } from './components/Navbar';
import { SafetyFooter } from './components/SafetyFooter';
import { QuickHideScreen } from './components/QuickHideScreen';
import { AmbientWaveBackground } from './components/AmbientWaveBackground';
import { CursorHalo } from './components/CursorHalo';
import { PageSkeleton } from './components/PageSkeleton';
import { DURATIONS, HAYAT_EASE, useDeviceCapabilities, usePrefersReducedMotion } from './motion';

// Route-level code splitting
const LandingPage = React.lazy(() =>
  import('./pages/LandingPage').then(m => ({ default: m.LandingPage }))
);
const ConsentPage = React.lazy(() =>
  import('./pages/ConsentPage').then(m => ({ default: m.ConsentPage }))
);
const WizardPage = React.lazy(() =>
  import('./pages/WizardPage').then(m => ({ default: m.WizardPage }))
);
const AnalysingPage = React.lazy(() =>
  import('./pages/AnalysingPage').then(m => ({ default: m.AnalysingPage }))
);
const ResultsPage = React.lazy(() =>
  import('./pages/ResultsPage').then(m => ({ default: m.ResultsPage }))
);
const CareNavigatorPage = React.lazy(() =>
  import('./pages/CareNavigatorPage').then(m => ({ default: m.CareNavigatorPage }))
);
const PrivacyDashboardPage = React.lazy(() =>
  import('./pages/PrivacyDashboardPage').then(m => ({ default: m.PrivacyDashboardPage }))
);
const EvidencePage = React.lazy(() =>
  import('./pages/EvidencePage').then(m => ({ default: m.EvidencePage }))
);
const HowItWorksPage = React.lazy(() =>
  import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage }))
);
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage }))
);

const AppLayout: React.FC = () => {
  const { isQuickHideActive } = useApp();
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const { isDesktop } = useDeviceCapabilities();
  const lenisRef = useRef<Lenis | null>(null);

  // Desktop-only Lenis smooth scroll, disabled for touch/mobile and reduced-motion
  useEffect(() => {
    if (!isDesktop || reduced || isQuickHideActive) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      if (!document.hidden) {
        lenis.raf(time);
      }
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isDesktop, reduced, isQuickHideActive]);

  // Reset scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  // SAFETY EXCEPTION: Quick Hide renders INSTANTLY with zero transition
  if (isQuickHideActive) {
    return <QuickHideScreen />;
  }

  return (
    <div className="relative min-h-screen flex flex-col subtle-sand-bg">
      <AmbientWaveBackground />
      <CursorHalo />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<PageSkeleton />}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: DURATIONS.fast, ease: HAYAT_EASE }
                }
              >
                <Routes location={location}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/consent" element={<ConsentPage />} />
                  <Route path="/check" element={<WizardPage />} />
                  <Route path="/analysing" element={<AnalysingPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/care" element={<CareNavigatorPage />} />
                  <Route path="/privacy" element={<PrivacyDashboardPage />} />
                  <Route path="/evidence" element={<EvidencePage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
        <SafetyFooter />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </HashRouter>
  );
}
