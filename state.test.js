/** @jest-environment jsdom */
import { STORAGE_KEY, state, loadFromLocalStorage } from './state.js';

describe('State Module Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    state.transactions = [];
  });

  describe('loadFromLocalStorage', () => {
    test('should load valid transaction data from localStorage', () => {
      const transactions = [
        {
          id: 'tx_1',
          title: 'Salary',
          amount: 1200,
          category: 'Salary',
          date: '2026-04-07',
        },
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));

      loadFromLocalStorage();

      expect(state.transactions).toEqual(transactions);
    });

    test('should fall back to an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{bad json');

      expect(() => loadFromLocalStorage()).not.toThrow();
      expect(state.transactions).toEqual([]);
    });

    test('should ignore stored data that is not an array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: 'Salary' }));

      loadFromLocalStorage();

      expect(state.transactions).toEqual([]);
    });

    test('should filter out malformed transactions from stored arrays', () => {
      const stored = [
        {
          id: 'tx_1',
          title: 'Salary',
          amount: 1200,
          category: 'Salary',
          date: '2026-04-07',
        },
        {
          id: 'tx_2',
          title: null,
          amount: 50,
          category: 'Food',
          date: '2026-04-08',
        },
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      loadFromLocalStorage();

      expect(state.transactions).toEqual([stored[0]]);
    });
  });
});
