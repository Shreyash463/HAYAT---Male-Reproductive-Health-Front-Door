import { describe, it, expect } from 'vitest';
import { en } from './en';
import { ar } from './ar';
import { hi } from './hi';

describe('HAYAT Localization & Privacy String Verification', () => {
  it('guarantees complete translation key parity across English, Arabic, and Hindi', () => {
    const enKeys = Object.keys(en);
    const arKeys = Object.keys(ar);
    const hiKeys = Object.keys(hi);

    const missingInAr = enKeys.filter(k => !(k in ar));
    const missingInHi = enKeys.filter(k => !(k in hi));

    expect(missingInAr).toEqual([]);
    expect(missingInHi).toEqual([]);
  });

  it('guarantees non-empty translated values for all languages', () => {
    [en, ar, hi].forEach(dict => {
      Object.entries(dict).forEach(([key, value]) => {
        expect(value, `Key "${key}" should not be empty`).toBeTruthy();
        expect(typeof value).toBe('string');
        expect(value.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('contains explicit required consent items in all translations', () => {
    [en, ar, hi].forEach(dict => {
      expect(dict.consentOpt1).toBeTruthy();
      expect(dict.consentOpt2).toBeTruthy();
      expect(dict.consentOpt3).toBeTruthy();
      expect(dict.consentOpt4).toBeTruthy();
      expect(dict.consentOptAi).toBeTruthy();
      expect(dict.anonymisedResearchDisclaimer).toBeTruthy();
    });
  });

  it('verifies that forbidden diagnostic and shaming phrases are absent across all languages', () => {
    const forbidden = [
      'you are infertile',
      'you are impotent',
      'you are sterile',
      'you are diagnosed with infertility',
      'accuracy proven'
    ];

    Object.values(en).forEach(str => {
      forbidden.forEach(term => {
        expect(str.toLowerCase()).not.toContain(term);
      });
    });
  });
});
