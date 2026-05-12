/** @jest-environment jsdom */

const mockCanvasContext = () => ({
  setTransform: jest.fn(),
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn(),
});

const buildFullDOM = () => {
  document.body.innerHTML = `
    <form id="transactionForm"></form>
    <input id="titleInput" value="" />
    <input id="amountInput" value="" />
    <select id="categoryInput"><option value="">Select</option><option value="Food">Food</option><option value="Salary">Salary</option></select>
    <input id="dateInput" value="" />
    <span id="titleError"></span>
    <span id="amountError"></span>
    <span id="categoryError"></span>
    <span id="dateError"></span>
    <button id="submitBtn">Add Transaction</button>
    <button id="cancelEditBtn" hidden></button>
    <select id="filterCategory"><option value="all">All</option><option value="Food">Food</option></select>
    <select id="filterType"><option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option></select>
    <input id="searchInput" value="" />
    <button id="resetFiltersBtn">Reset</button>
    <button id="exportCsvBtn">Export CSV</button>
    <button id="themeToggleBtn">Light Mode</button>
    <div id="transactionsList"></div>
    <span id="resultsCount"></span>
    <span id="totalBalance"></span>
    <span id="totalIncome"></span>
    <span id="totalExpenses"></span>
    <canvas id="financeChart" width="800" height="260"></canvas>
    <p id="financeChartDescription"></p>
    <div id="confirmModal" aria-hidden="true"></div>
    <button id="confirmDeleteBtn">Delete</button>
    <button id="cancelDeleteBtn">Cancel</button>
    <div id="toastContainer"></div>
    <div id="skeleton"></div>
  `;
  HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext());
};

// Helper: import app.js and state.js together after DOM is ready
const importAll = async () => {
  const app = await import('./app.js');
  const st = await import('./state.js');
  return { ...app, ...st };
};

describe('App Module Tests', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    localStorage.clear();
    // CRITICAL: DOM must exist BEFORE import so dom.js captures valid references
    buildFullDOM();
  });

  // ------------- Group A: Pure / semi-pure functions -------------

  describe('filterTransactions', () => {
    test('should return all transactions when all filters are set to all', async () => {
      const { filterTransactions, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-01-01' },
        { id: '2', title: 'Groceries', amount: -200, category: 'Food', date: '2026-01-02' },
      ];
      state.filters = { category: 'all', type: 'all', search: '' };
      expect(filterTransactions()).toHaveLength(2);
    });

    test('should filter transactions by category', async () => {
      const { filterTransactions, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-01-01' },
        { id: '2', title: 'Groceries', amount: -200, category: 'Food', date: '2026-01-02' },
      ];
      state.filters = { category: 'Salary', type: 'all', search: '' };
      const result = filterTransactions();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('should filter by type income (amount > 0 only)', async () => {
      const { filterTransactions, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-01-01' },
        { id: '2', title: 'Groceries', amount: -200, category: 'Food', date: '2026-01-02' },
      ];
      state.filters = { category: 'all', type: 'income', search: '' };
      const result = filterTransactions();
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBeGreaterThan(0);
    });

    test('should filter by type expense (amount < 0 only)', async () => {
      const { filterTransactions, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-01-01' },
        { id: '2', title: 'Groceries', amount: -200, category: 'Food', date: '2026-01-02' },
      ];
      state.filters = { category: 'all', type: 'expense', search: '' };
      const result = filterTransactions();
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBeLessThan(0);
    });

    test('should filter by search text case-insensitively', async () => {
      const { filterTransactions, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-01-01' },
        { id: '2', title: 'Groceries', amount: -200, category: 'Food', date: '2026-01-02' },
      ];
      state.filters = { category: 'all', type: 'all', search: 'SALARY' };
      const result = filterTransactions();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Salary');
    });

    test('should combine multiple filters simultaneously', async () => {
      const { filterTransactions, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-01-01' },
        { id: '2', title: 'Freelance', amount: 2000, category: 'Freelance', date: '2026-01-02' },
        { id: '3', title: 'Groceries', amount: -200, category: 'Food', date: '2026-01-03' },
      ];
      state.filters = { category: 'Salary', type: 'income', search: 'sal' };
      const result = filterTransactions();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('should return empty array when no transaction matches', async () => {
      const { filterTransactions, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-01-01' },
      ];
      state.filters = { category: 'Food', type: 'all', search: '' };
      expect(filterTransactions()).toEqual([]);
    });

    test('should handle an empty transactions array', async () => {
      const { filterTransactions, state } = await importAll();
      state.transactions = [];
      state.filters = { category: 'all', type: 'all', search: '' };
      expect(filterTransactions()).toEqual([]);
    });
  });

  describe('renderTransactionItem', () => {
    test('should render income transaction with amount--income CSS class', async () => {
      const { renderTransactionItem } = await importAll();
      const tx = { id: 'tx_1', title: 'Salary', amount: 1200, category: 'Work', date: '2026-04-07' };
      const html = renderTransactionItem(tx);
      expect(html).toContain('amount--income');
      expect(html).not.toContain('amount--expense');
    });

    test('should render expense transaction with amount--expense CSS class', async () => {
      const { renderTransactionItem } = await importAll();
      const tx = { id: 'tx_1', title: 'Rent', amount: -800, category: 'Housing', date: '2026-04-07' };
      const html = renderTransactionItem(tx);
      expect(html).toContain('amount--expense');
      expect(html).not.toContain('amount--income');
    });

    test('should escape HTML special characters in title and category', async () => {
      const { renderTransactionItem } = await importAll();
      const tx = {
        id: 'tx_1',
        title: '<script>alert("XSS")</script>',
        amount: 100,
        category: '<b>Badge</b>',
        date: '2026-04-07',
      };
      const html = renderTransactionItem(tx);
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<b>');
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&lt;b&gt;');
    });

    test('should include edit and delete buttons with correct data-id', async () => {
      const { renderTransactionItem } = await importAll();
      const tx = { id: 'tx_abc_123', title: 'Test', amount: 50, category: 'Food', date: '2026-04-07' };
      const html = renderTransactionItem(tx);
      expect(html).toContain('data-id="tx_abc_123"');
      expect(html).toContain('edit-btn');
      expect(html).toContain('delete-btn');
    });

    test('should use formatted currency and date values', async () => {
      const { renderTransactionItem } = await importAll();
      const tx = { id: 'tx_1', title: 'Test', amount: 1234.56, category: 'Food', date: '2026-04-07T12:00:00Z' };
      const html = renderTransactionItem(tx);
      expect(html).toContain('$1,234.56');
    });
  });


  // ------------- Group B: DOM-dependent functions -------------

  describe('validateForm', () => {
    test('should return true when all form fields are valid', async () => {
      const { validateForm } = await importAll();
      document.getElementById('titleInput').value = 'Salary';
      document.getElementById('amountInput').value = '1200';
      document.getElementById('categoryInput').value = 'Food';
      document.getElementById('dateInput').value = '2026-04-07';
      expect(validateForm()).toBe(true);
    });

    test('should return false and show error when title is empty', async () => {
      const { validateForm } = await importAll();
      document.getElementById('titleInput').value = '';
      document.getElementById('amountInput').value = '1200';
      document.getElementById('categoryInput').value = 'Food';
      document.getElementById('dateInput').value = '2026-04-07';
      expect(validateForm()).toBe(false);
      expect(document.getElementById('titleError').textContent).toBe('Title is required.');
      expect(document.getElementById('titleInput').classList.contains('is-invalid')).toBe(true);
    });

    test('should return false when amount is not a valid number', async () => {
      const { validateForm } = await importAll();
      document.getElementById('titleInput').value = 'Salary';
      document.getElementById('amountInput').value = 'not-a-number';
      document.getElementById('categoryInput').value = 'Food';
      document.getElementById('dateInput').value = '2026-04-07';
      expect(validateForm()).toBe(false);
      expect(document.getElementById('amountError').textContent).toBe('Enter a valid amount.');
    });

    test('should return false when amount is zero', async () => {
      const { validateForm } = await importAll();
      document.getElementById('titleInput').value = 'Salary';
      document.getElementById('amountInput').value = '0';
      document.getElementById('categoryInput').value = 'Food';
      document.getElementById('dateInput').value = '2026-04-07';
      expect(validateForm()).toBe(false);
    });

    test('should return false when no category is selected', async () => {
      const { validateForm } = await importAll();
      document.getElementById('titleInput').value = 'Salary';
      document.getElementById('amountInput').value = '1200';
      document.getElementById('categoryInput').value = '';
      document.getElementById('dateInput').value = '2026-04-07';
      expect(validateForm()).toBe(false);
      expect(document.getElementById('categoryError').textContent).toBe('Select a category.');
    });

    test('should return false when no date is picked', async () => {
      const { validateForm } = await importAll();
      document.getElementById('titleInput').value = 'Salary';
      document.getElementById('amountInput').value = '1200';
      document.getElementById('categoryInput').value = 'Food';
      document.getElementById('dateInput').value = '';
      expect(validateForm()).toBe(false);
      expect(document.getElementById('dateError').textContent).toBe('Pick a date.');
    });

    test('should clear previous errors before validation', async () => {
      const { validateForm } = await importAll();
      document.getElementById('titleError').textContent = 'Old error';
      document.getElementById('titleInput').classList.add('is-invalid');
      document.getElementById('titleInput').value = 'Salary';
      document.getElementById('amountInput').value = '1200';
      document.getElementById('categoryInput').value = 'Food';
      document.getElementById('dateInput').value = '2026-04-07';
      expect(validateForm()).toBe(true);
      expect(document.getElementById('titleError').textContent).toBe('');
      expect(document.getElementById('titleInput').classList.contains('is-invalid')).toBe(false);
    });
  });

  describe('resetFormState', () => {
    test('should reset the form and clear the editing state', async () => {
      const { resetFormState, state } = await importAll();
      state.editingId = 'tx_123';
      document.getElementById('submitBtn').textContent = 'Save Changes';
      document.getElementById('cancelEditBtn').hidden = false;
      const form = document.getElementById('transactionForm');
      form.reset = jest.fn();

      resetFormState();

      expect(form.reset).toHaveBeenCalled();
      expect(state.editingId).toBeNull();
      expect(document.getElementById('submitBtn').textContent).toBe('Add Transaction');
      expect(document.getElementById('cancelEditBtn').hidden).toBe(true);
    });
  });

  describe('renderSummary', () => {
    test('should display zero values when there are no transactions', async () => {
      const { renderSummary, state } = await importAll();
      state.transactions = [];
      renderSummary();
      expect(document.getElementById('totalIncome').textContent).toBe('$0.00');
      expect(document.getElementById('totalExpenses').textContent).toBe('$0.00');
      expect(document.getElementById('totalBalance').textContent).toBe('$0.00');
    });

    test('should correctly calculate and display total income', async () => {
      const { renderSummary, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-01-01' },
        { id: '2', title: 'Freelance', amount: 2000, category: 'Freelance', date: '2026-01-02' },
      ];
      renderSummary();
      expect(document.getElementById('totalIncome').textContent).toBe('$7,000.00');
      expect(document.getElementById('totalExpenses').textContent).toBe('$0.00');
      expect(document.getElementById('totalBalance').textContent).toBe('$7,000.00');
    });

    test('should display absolute value for expenses', async () => {
      const { renderSummary, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Rent', amount: -1500, category: 'Rent', date: '2026-01-01' },
        { id: '2', title: 'Groceries', amount: -300, category: 'Food', date: '2026-01-02' },
      ];
      renderSummary();
      expect(document.getElementById('totalIncome').textContent).toBe('$0.00');
      expect(document.getElementById('totalExpenses').textContent).toBe('$1,800.00');
      expect(document.getElementById('totalBalance').textContent).toBe('-$1,800.00');
    });

    test('should correctly calculate net balance', async () => {
      const { renderSummary, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-01-01' },
        { id: '2', title: 'Rent', amount: -2000, category: 'Rent', date: '2026-01-02' },
      ];
      renderSummary();
      expect(document.getElementById('totalIncome').textContent).toBe('$5,000.00');
      expect(document.getElementById('totalExpenses').textContent).toBe('$2,000.00');
      expect(document.getElementById('totalBalance').textContent).toBe('$3,000.00');
    });
  });

  describe('renderTransactions', () => {
    test('should display empty state when no transactions match filter', async () => {
      const { renderTransactions, state } = await importAll();
      state.transactions = [];
      state.filters = { category: 'all', type: 'all', search: '' };
      renderTransactions();
      const list = document.getElementById('transactionsList');
      expect(list.innerHTML).toContain('No transactions yet');
      expect(document.getElementById('resultsCount').textContent).toBe('0 results');
    });

    test('should render grouped transactions with month headings', async () => {
      const { renderTransactions, state } = await importAll();
      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-04-07' },
        { id: '2', title: 'Groceries', amount: -200, category: 'Food', date: '2026-03-10' },
      ];
      state.filters = { category: 'all', type: 'all', search: '' };
      renderTransactions();
      const list = document.getElementById('transactionsList');
      expect(list.innerHTML).toContain('Salary');
      expect(list.innerHTML).toContain('Groceries');
      expect(document.getElementById('resultsCount').textContent).toBe('2 results');
    });
  });


  // ------------- Group C: Complex interaction functions -------------

  describe('addTransaction', () => {
    test('should add a new transaction to state.transactions', async () => {
      const { addTransaction, state } = await importAll();
      document.getElementById('titleInput').value = 'New Salary';
      document.getElementById('amountInput').value = '3000';
      document.getElementById('categoryInput').value = 'Food';
      document.getElementById('dateInput').value = '2026-05-01';
      state.transactions = [];
      state.editingId = null;

      addTransaction();

      expect(state.transactions).toHaveLength(1);
      expect(state.transactions[0].title).toBe('New Salary');
      expect(state.transactions[0].amount).toBe(3000);
    });

    test('should update existing transaction when editingId is set', async () => {
      const { addTransaction, state } = await importAll();
      const existing = { id: 'tx_edit', title: 'Old Name', amount: 100, category: 'Food', date: '2026-01-01' };
      state.transactions = [existing];
      state.editingId = 'tx_edit';

      document.getElementById('titleInput').value = 'Updated Name';
      document.getElementById('amountInput').value = '500';
      document.getElementById('categoryInput').value = 'Food';
      document.getElementById('dateInput').value = '2026-05-01';

      addTransaction();

      expect(state.transactions).toHaveLength(1);
      expect(state.transactions[0].title).toBe('Updated Name');
      expect(state.transactions[0].amount).toBe(500);
    });

    test('should not proceed when validation fails', async () => {
      const { addTransaction, state } = await importAll();
      document.getElementById('titleInput').value = ''; // invalid
      document.getElementById('amountInput').value = '1200';
      state.transactions = [];
      state.editingId = null;

      addTransaction();

      expect(state.transactions).toHaveLength(0);
    });

    test('should add new transaction at the beginning of the array', async () => {
      const { addTransaction, state } = await importAll();
      state.transactions = [
        { id: 'old', title: 'Old', amount: 10, category: 'Food', date: '2026-01-01' },
      ];
      state.editingId = null;

      document.getElementById('titleInput').value = 'New';
      document.getElementById('amountInput').value = '500';
      document.getElementById('categoryInput').value = 'Food';
      document.getElementById('dateInput').value = '2026-05-01';

      addTransaction();

      expect(state.transactions).toHaveLength(2);
      expect(state.transactions[0].title).toBe('New');
    });
  });

  describe('startEditing', () => {
    test('should populate form fields with transaction data', async () => {
      const { startEditing, state } = await importAll();
      state.transactions = [
        { id: 'tx_1', title: 'Salary', amount: 1200, category: 'Salary', date: '2026-04-07' },
      ];
      startEditing('tx_1');
      expect(document.getElementById('titleInput').value).toBe('Salary');
      expect(document.getElementById('amountInput').value).toBe('1200');
      expect(document.getElementById('categoryInput').value).toBe('Salary');
      expect(document.getElementById('dateInput').value).toBe('2026-04-07');
      expect(state.editingId).toBe('tx_1');
    });

    test('should change submit button text and show cancel button', async () => {
      const { startEditing, state } = await importAll();
      state.transactions = [
        { id: 'tx_1', title: 'Test', amount: 50, category: 'Food', date: '2026-04-07' },
      ];
      startEditing('tx_1');
      expect(document.getElementById('submitBtn').textContent).toBe('Save Changes');
      expect(document.getElementById('cancelEditBtn').hidden).toBe(false);
    });

    test('should do nothing when transaction id is not found', async () => {
      const { startEditing, state } = await importAll();
      state.transactions = [];
      expect(() => startEditing('nonexistent')).not.toThrow();
      expect(state.editingId).toBeNull();
    });
  });

  describe('deleteTransaction', () => {
    test('should remove the transaction with the given id', async () => {
      const { deleteTransaction, state } = await importAll();
      state.transactions = [
        { id: 'tx_1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-04-07' },
        { id: 'tx_2', title: 'Rent', amount: -1500, category: 'Rent', date: '2026-04-01' },
      ];
      deleteTransaction('tx_1');
      expect(state.transactions).toHaveLength(1);
      expect(state.transactions[0].id).toBe('tx_2');
    });

    test('should persist changes to localStorage', async () => {
      const { deleteTransaction, state, STORAGE_KEY } = await importAll();
      state.transactions = [
        { id: 'tx_1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-04-07' },
      ];
      deleteTransaction('tx_1');
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toEqual([]);
    });
  });

  describe('openConfirmModal / closeConfirmModal', () => {
    test('should open modal with correct state and accessibility attributes', async () => {
      const { openConfirmModal, state } = await importAll();
      openConfirmModal('tx_delete_me');
      expect(state.pendingDeleteId).toBe('tx_delete_me');
      const modal = document.getElementById('confirmModal');
      expect(modal.classList.contains('is-open')).toBe(true);
      expect(modal.getAttribute('aria-hidden')).toBe('false');
    });

    test('should close modal and reset state and accessibility attributes', async () => {
      const { closeConfirmModal, state } = await importAll();
      state.pendingDeleteId = 'tx_123';
      const modal = document.getElementById('confirmModal');
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');

      closeConfirmModal();

      expect(state.pendingDeleteId).toBeNull();
      expect(modal.classList.contains('is-open')).toBe(false);
      expect(modal.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('exportToCSV', () => {
    test('should show error toast when there are no transactions', async () => {
      const { exportToCSV, state } = await importAll();
      state.transactions = [];
      exportToCSV();
      const container = document.getElementById('toastContainer');
      expect(container.children.length).toBe(1);
      expect(container.children[0].textContent).toBe('No data to export.');
      expect(container.children[0].className).toContain('toast--error');
    });

    test('should generate CSV content with sanitized cell values', async () => {
      const { exportToCSV, state } = await importAll();
      state.transactions = [
        { id: 'tx_1', title: '=bad', amount: 100, category: 'Food', date: '2026-04-07' },
      ];

      const originalBlob = global.Blob;
      let blobContent;
      global.Blob = class {
        constructor(content) { blobContent = content; }
      };

      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = jest.fn(() => 'blob:test');

      const linkMock = document.createElement('a');
      const origCreateElement = document.createElement.bind(document);
      jest.spyOn(linkMock, 'click').mockImplementation(() => {});
      jest.spyOn(linkMock, 'remove').mockImplementation(() => {});
      document.createElement = jest.fn((tag) => {
        if (tag === 'a') return linkMock;
        return origCreateElement(tag);
      });

      const originalRevokeObjectURL = URL.revokeObjectURL;
      URL.revokeObjectURL = jest.fn();

      exportToCSV();

      // CSV contains sanitized title (single quote prepended for formula-triggering =)
      expect(blobContent[0]).toContain("'=bad");

      // Cleanup
      global.Blob = originalBlob;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      document.createElement = origCreateElement;
    });
  });

  describe('renderApp', () => {
    test('should render summary, transactions, and chart without throwing', async () => {
      const { renderApp, state } = await importAll();

      state.transactions = [
        { id: '1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-04-07' },
      ];
      state.filters = { category: 'all', type: 'all', search: '' };

      expect(() => renderApp()).not.toThrow();

      expect(document.getElementById('totalIncome').textContent).toBe('$5,000.00');
      expect(document.getElementById('totalBalance').textContent).toBe('$5,000.00');
    });
  });

  describe('initializeApp', () => {
    // Note: importAll() triggers initializeApp() automatically via the conditional
    // init at the end of app.js (document.readyState !== 'loading' in jsdom).
    // Therefore each test already has a fully initialized app. Calling
    // initializeApp() again would double-attach event listeners.

    test('should not throw when called on fully set up DOM', async () => {
      const { initializeApp } = await importAll();
      // Calling it a second time should be safe (idempotent check)
      expect(() => initializeApp()).not.toThrow();
    });

    test('should hide skeleton after 300ms timeout', async () => {
      jest.useFakeTimers();
      const { initializeApp } = await importAll();
      const skeleton = document.getElementById('skeleton');
      initializeApp();
      jest.advanceTimersByTime(300);
      expect(skeleton.classList.contains('is-hidden')).toBe(true);
      jest.useRealTimers();
    });

    test('should handle form submit event', async () => {
      // Don't call initializeApp() — it already ran during import
      const { state } = await importAll();

      state.transactions = [];
      state.editingId = null;

      document.getElementById('titleInput').value = 'NewForm';
      document.getElementById('amountInput').value = '500';
      document.getElementById('categoryInput').value = 'Food';
      document.getElementById('dateInput').value = '2026-05-01';

      const form = document.getElementById('transactionForm');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(state.transactions).toHaveLength(1);
      expect(state.transactions[0].title).toBe('NewForm');
    });

    test('should handle filter category change event', async () => {
      const { state } = await importAll();
      state.filters = { category: 'all', type: 'all', search: '' };

      const select = document.getElementById('filterCategory');
      select.value = 'Food';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      expect(state.filters.category).toBe('Food');
    });

    test('should handle filter type change event', async () => {
      const { state } = await importAll();
      state.filters = { category: 'all', type: 'all', search: '' };

      const select = document.getElementById('filterType');
      select.value = 'income';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      expect(state.filters.type).toBe('income');
    });

    test('should handle reset filters button click', async () => {
      const { state } = await importAll();
      state.filters = { category: 'Food', type: 'expense', search: 'test' };
      document.getElementById('filterCategory').value = 'Food';
      document.getElementById('filterType').value = 'expense';
      document.getElementById('searchInput').value = 'test';

      document.getElementById('resetFiltersBtn').click();

      expect(state.filters.category).toBe('all');
      expect(state.filters.type).toBe('all');
      expect(state.filters.search).toBe('');
    });

    test('should handle export CSV button click without throwing', async () => {
      await importAll();
      expect(() => {
        document.getElementById('exportCsvBtn').click();
      }).not.toThrow();
    });

    test('should handle theme toggle button click', async () => {
      const { state } = await importAll();
      state.theme = 'dark';

      document.getElementById('themeToggleBtn').click();

      expect(state.theme).toBe('light');
    });

    test('should handle confirm delete button click flow', async () => {
      const { state } = await importAll();
      state.transactions = [
        { id: 'tx_del', title: 'To Delete', amount: 10, category: 'Food', date: '2026-04-07' },
      ];
      state.pendingDeleteId = 'tx_del';

      document.getElementById('confirmDeleteBtn').click();

      expect(state.transactions).toHaveLength(0);
      expect(state.pendingDeleteId).toBeNull();
    });

    test('should handle cancel delete button click', async () => {
      const { state } = await importAll();
      state.pendingDeleteId = 'tx_123';
      document.getElementById('confirmModal').classList.add('is-open');

      document.getElementById('cancelDeleteBtn').click();

      expect(state.pendingDeleteId).toBeNull();
    });

    test('should handle cancel edit button click', async () => {
      const { state } = await importAll();
      state.editingId = 'tx_edit';
      document.getElementById('transactionForm').reset = jest.fn();

      document.getElementById('cancelEditBtn').click();

      expect(state.editingId).toBeNull();
    });

    test('should handle edit button click via transaction list delegation', async () => {
      const { state } = await importAll();
      state.transactions = [
        { id: 'tx_1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-04-07' },
      ];
      state.filters = { category: 'all', type: 'all', search: '' };

      const list = document.getElementById('transactionsList');
      list.innerHTML = `<button class="edit-btn" data-id="tx_1">Edit</button>`;

      const editBtn = list.querySelector('.edit-btn');
      editBtn.click();

      expect(state.editingId).toBe('tx_1');
    });

    test('should not crash when clicking unhandled element in transaction list', async () => {
      const { state } = await importAll();
      state.transactions = [];
      state.filters = { category: 'all', type: 'all', search: '' };

      const list = document.getElementById('transactionsList');
      list.innerHTML = `<span>Some random text</span>`;

      expect(() => {
        list.querySelector('span').click();
      }).not.toThrow();
    });
  });
});
