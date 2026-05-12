/** @jest-environment jsdom */

describe('UI Module Tests', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  // Build the full DOM that dom.js expects, then dynamically import ui.js.
  const setupAndImport = async () => {
    // Minimal DOM with all elements referenced by dom.js
    document.body.innerHTML = `
      <form id="transactionForm"></form>
      <input id="titleInput" />
      <input id="amountInput" />
      <select id="categoryInput"><option value="Food">Food</option></select>
      <input id="dateInput" />
      <span id="titleError"></span>
      <span id="amountError"></span>
      <span id="categoryError"></span>
      <span id="dateError"></span>
      <button id="submitBtn">Add Transaction</button>
      <button id="cancelEditBtn" hidden></button>
      <select id="filterCategory"><option value="all">All</option></select>
      <select id="filterType"><option value="all">All</option></select>
      <input id="searchInput" />
      <button id="resetFiltersBtn">Reset</button>
      <button id="exportCsvBtn">Export CSV</button>
      <button id="themeToggleBtn">Light Mode</button>
      <button id="languageToggleBtn">中文</button>
      <div id="transactionsList"></div>
      <span id="resultsCount"></span>
      <span id="totalBalance"></span>
      <span id="totalIncome"></span>
      <span id="totalExpenses"></span>
      <canvas id="financeChart"></canvas>
      <p id="financeChartDescription"></p>
      <div id="confirmModal" aria-hidden="true"></div>
      <button id="confirmDeleteBtn">Delete</button>
      <button id="cancelDeleteBtn">Cancel</button>
      <div id="toastContainer"></div>
      <div id="skeleton"></div>
    `;

    const ui = await import('./ui.js');
    return ui;
  };

  // ─── showToast ──────────────────────────────────────────────────

  describe('showToast', () => {
    test('should create a div with class toast and append to toastContainer', async () => {
      const { showToast } = await setupAndImport();
      showToast('Transaction saved.');

      const container = document.getElementById('toastContainer');
      expect(container.children.length).toBe(1);
      const toast = container.children[0];
      expect(toast.tagName).toBe('DIV');
      expect(toast.className).toBe('toast');
      expect(toast.textContent).toBe('Transaction saved.');
    });

    test('should add toast--error class when variant is error', async () => {
      const { showToast } = await setupAndImport();
      showToast('Something went wrong.', 'error');

      const toast = document.getElementById('toastContainer').children[0];
      expect(toast.className).toBe('toast toast--error');
    });

    test('should use default success variant when variant is omitted', async () => {
      const { showToast } = await setupAndImport();
      showToast('All good.');

      const toast = document.getElementById('toastContainer').children[0];
      expect(toast.className).toBe('toast');
      expect(toast.className).not.toContain('toast--error');
    });

    test('should set correct textContent on the toast element', async () => {
      const { showToast } = await setupAndImport();
      showToast('Item deleted.', 'error');

      const toast = document.getElementById('toastContainer').children[0];
      expect(toast.textContent).toBe('Item deleted.');
    });

    test('should automatically remove the toast after 2400ms', async () => {
      const { showToast } = await setupAndImport();
      showToast('Temporary message.');

      const container = document.getElementById('toastContainer');
      expect(container.children.length).toBe(1);

      // Advance time past the 2400ms timeout
      jest.advanceTimersByTime(2400);

      // At this point the toast should have been removed
      expect(container.children.length).toBe(0);
    });
  });

  // ─── clearErrors ────────────────────────────────────────────────

  describe('clearErrors', () => {
    test('should remove is-invalid class from all four input fields', async () => {
      const { clearErrors } = await setupAndImport();

      // Add invalid class to all inputs first
      ['titleInput', 'amountInput', 'categoryInput', 'dateInput'].forEach((id) => {
        document.getElementById(id).classList.add('is-invalid');
      });

      clearErrors();

      ['titleInput', 'amountInput', 'categoryInput', 'dateInput'].forEach((id) => {
        expect(document.getElementById(id).classList.contains('is-invalid')).toBe(false);
      });
    });

    test('should clear textContent of all four error elements', async () => {
      const { clearErrors } = await setupAndImport();

      // Set error messages first
      document.getElementById('titleError').textContent = 'Title is required.';
      document.getElementById('amountError').textContent = 'Enter a valid amount.';
      document.getElementById('categoryError').textContent = 'Select a category.';
      document.getElementById('dateError').textContent = 'Pick a date.';

      clearErrors();

      ['titleError', 'amountError', 'categoryError', 'dateError'].forEach((id) => {
        expect(document.getElementById(id).textContent).toBe('');
      });
    });
  });

  // ─── setError ───────────────────────────────────────────────────

  describe('setError', () => {
    test('should add is-invalid class to the specified input', async () => {
      const { setError } = await setupAndImport();

      const input = document.getElementById('titleInput');
      const errorEl = document.getElementById('titleError');

      setError(input, errorEl, 'Title is required.');

      expect(input.classList.contains('is-invalid')).toBe(true);
    });

    test('should set the error message textContent', async () => {
      const { setError } = await setupAndImport();

      const input = document.getElementById('amountInput');
      const errorEl = document.getElementById('amountError');

      setError(input, errorEl, 'Enter a valid amount.');

      expect(errorEl.textContent).toBe('Enter a valid amount.');
    });

    test('should work for all four input-error pairs', async () => {
      const { setError } = await setupAndImport();

      const pairs = [
        { input: 'titleInput', error: 'titleError', msg: 'No title.' },
        { input: 'amountInput', error: 'amountError', msg: 'Bad amount.' },
        { input: 'categoryInput', error: 'categoryError', msg: 'No category.' },
        { input: 'dateInput', error: 'dateError', msg: 'No date.' },
      ];

      pairs.forEach(({ input, error, msg }) => {
        setError(document.getElementById(input), document.getElementById(error), msg);
      });

      pairs.forEach(({ input, error, msg }) => {
        expect(document.getElementById(input).classList.contains('is-invalid')).toBe(true);
        expect(document.getElementById(error).textContent).toBe(msg);
      });
    });
  });
});
