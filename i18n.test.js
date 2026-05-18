/** @jest-environment jsdom */

import { t, setLanguage, getLanguage, getLocale, loadLanguage, updatePageTranslations, LANGUAGE_KEY } from './i18n.js';
import { setLocale } from './utils.js';

jest.mock('./utils.js', () => ({
  setLocale: jest.fn()
}));

describe('i18n Module Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = 'en';
    document.title = '';
    jest.clearAllMocks();
  });

  test('t() should return translated string or fallback to key', () => {
    setLanguage('en');
    expect(t('app.title')).toBe('Advanced Finance Tracker');
    expect(t('non.existent.key')).toBe('non.existent.key');
  });

  test('t() should correctly interpolate parameters', () => {
    setLanguage('en');
    expect(t('transactions.results', { count: 5 })).toBe('5 results');
    // Retain placeholder when parameters are missing
    expect(t('transactions.results', {})).toBe('{count} results'); 
  });

  test('setLanguage and getLanguage should update language and locale', () => {
    setLanguage('zh');
    expect(getLanguage()).toBe('zh');
    expect(getLocale()).toBe('zh-CN');
    expect(document.documentElement.lang).toBe('zh-CN');
    expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe('zh');
    expect(setLocale).toHaveBeenCalledWith('zh-CN');
  });

  test('loadLanguage should restore language from localStorage', () => {
    window.localStorage.setItem(LANGUAGE_KEY, 'zh');
    loadLanguage();
    expect(getLanguage()).toBe('zh');
    expect(document.documentElement.lang).toBe('zh-CN');
  });

  test('updatePageTranslations should update DOM elements correctly', () => {
    // Building a simulated DOM environment
    document.body.innerHTML = `
      <div data-i18n="app.title">Old Title</div>
      <input data-i18n-placeholder="form.placeholder.title" placeholder="Old" />
      <div data-i18n-html="cookie.message">Old HTML</div>
      <button data-i18n-aria-label="chart.ariaLabel" aria-label="Old"></button>
    `;

    setLanguage('en');
    updatePageTranslations();

    expect(document.querySelector('[data-i18n]').textContent).toBe('Advanced Finance Tracker');
    expect(document.querySelector('input').getAttribute('placeholder')).toBe('e.g., Freelance Payment');
    expect(document.querySelector('[data-i18n-html]').innerHTML).toBe('This site uses cookies to improve your experience.');
    expect(document.querySelector('button').getAttribute('aria-label')).toBe('Bar chart comparing total income and total expenses.');
  });
});