/** @jest-environment jsdom */
import {
  STORAGE_KEY,
  THEME_KEY,
  state,
  saveToLocalStorage,
  loadFromLocalStorage,
  saveTheme,
  setTheme,
  loadTheme,
} from './state.js';

describe('State Module Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    state.transactions = [];
    state.filters = { category: 'all', type: 'all', search: '' };
    state.editingId = null;
    state.pendingDeleteId = null;
    state.theme = 'dark';
    document.body.innerHTML = '';
  });

  // ─── state object initial values ─────────────────────────────────

  describe('state object', () => {
    test('should have correct initial values for all properties', () => {
      // Reset to a clean state and re-import to get factory defaults.
      // The state object is a singleton, so we verify its shape here.
      expect(state).toHaveProperty('transactions');
      expect(state).toHaveProperty('filters');
      expect(state).toHaveProperty('editingId');
      expect(state).toHaveProperty('pendingDeleteId');
      expect(state).toHaveProperty('theme');
      expect(Array.isArray(state.transactions)).toBe(true);
      expect(state.filters).toEqual({ category: 'all', type: 'all', search: '' });
      expect(state.editingId).toBeNull();
      expect(state.pendingDeleteId).toBeNull();
    });

    test('STORAGE_KEY should be a non-empty string', () => {
      expect(typeof STORAGE_KEY).toBe('string');
      expect(STORAGE_KEY.length).toBeGreaterThan(0);
    });

    test('THEME_KEY should be a non-empty string', () => {
      expect(typeof THEME_KEY).toBe('string');
      expect(THEME_KEY.length).toBeGreaterThan(0);
    });
  });

  // ─── saveToLocalStorage ──────────────────────────────────────────

  describe('saveToLocalStorage', () => {
    test('should persist state.transactions to localStorage under STORAGE_KEY', () => {
      state.transactions = [
        { id: 'tx_1', title: 'Salary', amount: 1200, category: 'Salary', date: '2026-04-07' },
      ];
      saveToLocalStorage();
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toEqual(state.transactions);
    });

    test('should overwrite previously stored data', () => {
      const oldData = [{ id: 'tx_old', title: 'Old', amount: 10, category: 'Other', date: '2026-01-01' }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(oldData));

      state.transactions = [{ id: 'tx_new', title: 'New', amount: 20, category: 'Food', date: '2026-05-01' }];
      saveToLocalStorage();

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('tx_new');
    });
  });

  // ─── loadFromLocalStorage (existing + additions) ─────────────────

  describe('loadFromLocalStorage', () => {
    test('should load valid transaction data from localStorage', () => {
      const transactions = [
        { id: 'tx_1', title: 'Salary', amount: 1200, category: 'Salary', date: '2026-04-07' },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      loadFromLocalStorage();
      expect(state.transactions).toEqual(transactions);
    });

    test('should use an empty transaction list when localStorage has no saved data', () => {
      loadFromLocalStorage();
      expect(state.transactions).toEqual([]);
    });

    test('should not crash when localStorage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{bad json');
      expect(() => loadFromLocalStorage()).not.toThrow();
      expect(state.transactions).toEqual([]);
    });

    test('should ignore stored data that is not an array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: 'Salary' }));
      loadFromLocalStorage();
      expect(state.transactions).toEqual([]);
    });

    test('should filter malformed transactions from stored arrays', () => {
      const validTransaction = {
        id: 'tx_1', title: 'Salary', amount: 1200, category: 'Salary', date: '2026-04-07',
      };
      const malformedTransactions = [
        { id: 'tx_2', title: null, amount: 50, category: 'Food', date: '2026-04-08' },
        { id: 'tx_3', title: 'Food', amount: '50', category: 'Food', date: '2026-04-08' },
        { id: 'tx_4', title: 'Invalid amount', amount: Infinity, category: 'Other', date: '2026-04-09' },
        { title: 'Missing id', amount: 100, category: 'Other', date: '2026-04-10' },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([validTransaction, ...malformedTransactions]));
      loadFromLocalStorage();
      expect(state.transactions).toEqual([validTransaction]);
    });

    test('should filter transactions with NaN amount values', () => {
      const valid = { id: 'tx_1', title: 'Salary', amount: 1200, category: 'Salary', date: '2026-04-07' };
      const nanTx = { id: 'tx_nan', title: 'Bad', amount: NaN, category: 'Other', date: '2026-04-08' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([valid, nanTx]));
      loadFromLocalStorage();
      expect(state.transactions).toEqual([valid]);
    });
  });

  // ─── saveTheme ───────────────────────────────────────────────────

  describe('saveTheme', () => {
    test('should persist state.theme to localStorage under THEME_KEY', () => {
      state.theme = 'light';
      saveTheme();
      expect(localStorage.getItem(THEME_KEY)).toBe('light');

      state.theme = 'dark';
      saveTheme();
      expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    });
  });

  // ─── setTheme ────────────────────────────────────────────────────

  describe('setTheme', () => {
    test('should update state.theme to the new value', () => {
      setTheme('light');
      expect(state.theme).toBe('light');
      setTheme('dark');
      expect(state.theme).toBe('dark');
    });

    test('should add theme-light class to document.body when theme is light', () => {
      setTheme('light');
      expect(document.body.classList.contains('theme-light')).toBe(true);
    });

    test('should remove theme-light class from document.body when theme is dark', () => {
      document.body.classList.add('theme-light');
      setTheme('dark');
      expect(document.body.classList.contains('theme-light')).toBe(false);
    });

    test('should update themeToggleBtn data-i18n attribute when button exists', () => {
      const btn = document.createElement('button');
      btn.id = 'themeToggleBtn';
      document.body.appendChild(btn);

      setTheme('light');
      expect(btn.getAttribute('data-i18n')).toBe('header.themeDark');

      setTheme('dark');
      expect(btn.getAttribute('data-i18n')).toBe('header.themeLight');
    });

    test('should handle missing themeToggleBtn element gracefully', () => {
      expect(() => setTheme('light')).not.toThrow();
      expect(() => setTheme('dark')).not.toThrow();
      expect(state.theme).toBe('dark');
    });
  });

  // ─── loadTheme ───────────────────────────────────────────────────

  describe('loadTheme', () => {
    test('should load saved theme from localStorage when available', () => {
      localStorage.setItem(THEME_KEY, 'light');
      loadTheme();
      expect(state.theme).toBe('light');
      expect(document.body.classList.contains('theme-light')).toBe(true);
    });

    test('should default to dark when no theme is saved in localStorage', () => {
      loadTheme();
      expect(state.theme).toBe('dark');
      expect(document.body.classList.contains('theme-light')).toBe(false);
    });

    test('should handle missing themeToggleBtn element', () => {
      localStorage.setItem(THEME_KEY, 'dark');
      expect(() => loadTheme()).not.toThrow();
    });
  });
});
