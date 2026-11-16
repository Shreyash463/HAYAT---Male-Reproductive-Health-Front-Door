import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  Theme, 
  ConsentSettings, 
  AssessmentAnswers, 
  AssessmentResult, 
  AccessLogItem 
} from '../types';
import { getTranslation } from '../i18n';
import { en } from '../i18n/en';
import { saveConsent } from '../services/api';

interface AppContextType {
  // Localization & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: typeof en;

  // Discreet Exit / Quick Hide
  isQuickHideActive: boolean;
  triggerQuickHide: () => void;
  exitQuickHide: () => void;

  // Consent & Privacy
  consent: ConsentSettings;
  updateConsent: (newConsent: Partial<ConsentSettings>) => void;

  // Assessment & Results
  answers: AssessmentAnswers;
  setAnswer: <K extends keyof AssessmentAnswers>(key: K, value: AssessmentAnswers[K]) => void;
  setAllAnswers: (answers: AssessmentAnswers) => void;
  result: AssessmentResult | null;
  setResult: (res: AssessmentResult | null) => void;
  clearAllData: () => void;

  // Audit Log & Referral Tracker
  accessLogs: AccessLogItem[];
  addLog: (action: string, detail: string) => void;
  referralStep: number; // 0: Screened, 1: Booked, 2: Assessed, 3: Follow-up
  setReferralStep: (step: number) => void;
}

const defaultConsent: ConsentSettings = {
  processAnswers: false,
  saveOnDevice: false,
  shareAnonymisedResearch: false,
  createClinicianSummary: false,
};

const initialAnswers: AssessmentAnswers = {
  heatExposure: [],
  conditions: [],
  currentSymptoms: [],
  redFlagSymptoms: []
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'hayat_app_data_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('light');
  const [isQuickHideActive, setIsQuickHideActive] = useState<boolean>(false);
  const [consent, setConsentState] = useState<ConsentSettings>(defaultConsent);
  const [answers, setAnswersState] = useState<AssessmentAnswers>(initialAnswers);
  const [result, setResultState] = useState<AssessmentResult | null>(null);
  const [referralStep, setReferralStepState] = useState<number>(0);
  const [accessLogs, setAccessLogs] = useState<AccessLogItem[]>([
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      action: 'Session Initialized',
      detail: 'Ephemeral private session started on device'
    }
  ]);

  // Load from localStorage ONLY if previously allowed
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.consent?.saveOnDevice) {
          setConsentState(parsed.consent);
          if (parsed.answers) setAnswersState(parsed.answers);
          if (parsed.result) setResultState(parsed.result);
          if (parsed.referralStep !== undefined) setReferralStepState(parsed.referralStep);
          if (parsed.accessLogs) setAccessLogs(parsed.accessLogs);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to localStorage ONLY if consent.saveOnDevice is true
  useEffect(() => {
    if (consent.saveOnDevice) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          consent,
          answers,
          result,
          referralStep,
          accessLogs
        }));
      } catch {
        // Storage full or unavailable
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [consent, answers, result, referralStep, accessLogs]);

  // Listen for Escape key for instant Quick Hide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsQuickHideActive(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Update Theme class (Warm Sand Light is default; .theme-dark toggles warm charcoal)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
    }
  }, [theme]);

  const addLog = (action: string, detail: string) => {
    const item: AccessLogItem = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      action,
      detail
    };
    setAccessLogs(prev => [item, ...prev].slice(0, 30));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    addLog('Language Changed', `Switched interface language to ${lang.toUpperCase()}`);
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      addLog('Theme Toggled', `Switched theme to ${next}`);
      return next;
    });
  };

  const updateConsent = (newConsent: Partial<ConsentSettings>) => {
    setConsentState(prev => {
      const updated = { ...prev, ...newConsent, timestamp: new Date().toISOString() };
      saveConsent(updated);
      addLog('Consent Updated', `Required=${updated.processAnswers}, SaveDevice=${updated.saveOnDevice}, Research=${updated.shareAnonymisedResearch}, Summary=${updated.createClinicianSummary}`);
      return updated;
    });
  };

  const setAnswer = <K extends keyof AssessmentAnswers>(key: K, value: AssessmentAnswers[K]) => {
    setAnswersState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const setAllAnswers = (newAnswers: AssessmentAnswers) => {
    setAnswersState(newAnswers);
    addLog('Assessment Updated', 'Inputs pre-filled or updated');
  };

  const setResult = (res: AssessmentResult | null) => {
    setResultState(res);
    if (res) {
      addLog('Screening Generated', `Result band: ${res.band}, Triage: ${res.triage}`);
    }
  };

  const clearAllData = () => {
    setAnswersState(initialAnswers);
    setResultState(null);
    setConsentState(defaultConsent);
    setReferralStepState(0);
    localStorage.removeItem(STORAGE_KEY);
    setAccessLogs([
      {
        id: `wipe-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Data Purged',
        detail: 'User initiated full wipe of all local records.'
      }
    ]);
  };

  const t = getTranslation(language);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        t,
        isQuickHideActive,
        triggerQuickHide: () => setIsQuickHideActive(true),
        exitQuickHide: () => setIsQuickHideActive(false),
        consent,
        updateConsent,
        answers,
        setAnswer,
        setAllAnswers,
        result,
        setResult,
        clearAllData,
        accessLogs,
        addLog,
        referralStep,
        setReferralStep: setReferralStepState
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
