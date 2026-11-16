import { en } from './en';
import { ar } from './ar';
import { hi } from './hi';
import { Language } from '../types';

export const translations = {
  en,
  ar,
  hi,
};

export const getTranslation = (lang: Language) => {
  return translations[lang] || translations.en;
};
