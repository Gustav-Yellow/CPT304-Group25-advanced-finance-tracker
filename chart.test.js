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

describe('Chart Module Tests', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
  });

  // ─── helper: set up DOM and import ──────────────────────────────

  const setupDOM = (html) => {
    document.body.innerHTML = html;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext());
  };

  // ─── null canvas guard ──────────────────────────────────────────

  test('should exit early and not throw when canvas element is null', async () => {
    // No canvas in the DOM at all
    document.body.innerHTML = '';
    const { renderChart } = await import('./chart.js');
    expect(() => renderChart()).not.toThrow();
  });

  // ─── DPR fallback ───────────────────────────────────────────────

  test('should default dpr to 1 when window.devicePixelRatio is undefined', async () => {
    setupDOM(`
      <canvas id="financeChart" width="800" height="260"></canvas>
      <p id="financeChartDescription"></p>
    `);

    const originalDPR = window.devicePixelRatio;
    delete window.devicePixelRatio;

    const { state } = await import('./state.js');
    const { renderChart } = await import('./chart.js');

    state.transactions = [
      { id: 'tx_1', title: 'Salary', amount: 1200, category: 'Salary', date: '2026-04-07' },
    ];

    expect(() => renderChart()).not.toThrow();

    // Restore for other tests
    window.devicePixelRatio = originalDPR;
  });

  // ─── empty transactions ─────────────────────────────────────────

  test('should handle empty transactions array without crashing', async () => {
    setupDOM(`
      <canvas id="financeChart" width="800" height="260"></canvas>
      <p id="financeChartDescription"></p>
    `);

    Object.defineProperty(document.getElementById('financeChart'), 'clientWidth', {
      configurable: true,
      value: 800,
    });

    const { state } = await import('./state.js');
    const { renderChart } = await import('./chart.js');

    state.transactions = [];

    expect(() => renderChart()).not.toThrow();

    const canvas = document.getElementById('financeChart');
    const description = document.getElementById('financeChartDescription');
    const ariaLabel = canvas.getAttribute('aria-label');
    expect(ariaLabel).toContain('$0.00');
    expect(description.textContent).toContain('$0.00');
  });

  // ─── only income transactions ───────────────────────────────────

  test('should correctly render with only income transactions (no expenses)', async () => {
    setupDOM(`
      <canvas id="financeChart" width="800" height="260"></canvas>
      <p id="financeChartDescription"></p>
    `);

    Object.defineProperty(document.getElementById('financeChart'), 'clientWidth', {
      configurable: true,
      value: 800,
    });

    const { state } = await import('./state.js');
    const { renderChart } = await import('./chart.js');

    state.transactions = [
      { id: 'tx_1', title: 'Salary', amount: 5000, category: 'Salary', date: '2026-04-07' },
      { id: 'tx_2', title: 'Freelance', amount: 2000, category: 'Freelance', date: '2026-04-08' },
    ];

    renderChart();

    const canvas = document.getElementById('financeChart');
    const description = document.getElementById('financeChartDescription');
    const ariaLabel = canvas.getAttribute('aria-label');
    expect(ariaLabel).toContain('$7,000.00');
    expect(ariaLabel).toContain('$0.00');
    expect(description.textContent).toContain('$7,000.00');
    expect(description.textContent).toContain('$0.00');
  });

  // ─── only expense transactions ──────────────────────────────────

  test('should correctly render with only expense transactions (no income)', async () => {
    setupDOM(`
      <canvas id="financeChart" width="800" height="260"></canvas>
      <p id="financeChartDescription"></p>
    `);

    Object.defineProperty(document.getElementById('financeChart'), 'clientWidth', {
      configurable: true,
      value: 800,
    });

    const { state } = await import('./state.js');
    const { renderChart } = await import('./chart.js');

    state.transactions = [
      { id: 'tx_1', title: 'Rent', amount: -1500, category: 'Rent', date: '2026-04-01' },
      { id: 'tx_2', title: 'Groceries', amount: -300, category: 'Food', date: '2026-04-05' },
    ];

    renderChart();

    const canvas = document.getElementById('financeChart');
    const description = document.getElementById('financeChartDescription');
    const ariaLabel = canvas.getAttribute('aria-label');
    expect(ariaLabel).toContain('$0.00');
    expect(ariaLabel).toContain('$1,800.00');
    expect(description.textContent).toContain('$0.00');
    expect(description.textContent).toContain('$1,800.00');
  });

  // ─── missing financeChartDescription ────────────────────────────

  test('should not crash when financeChartDescription element is missing', async () => {
    setupDOM(`
      <canvas id="financeChart" width="800" height="260"></canvas>
    `);

    Object.defineProperty(document.getElementById('financeChart'), 'clientWidth', {
      configurable: true,
      value: 800,
    });

    const { state } = await import('./state.js');
    const { renderChart } = await import('./chart.js');

    state.transactions = [
      { id: 'tx_1', title: 'Salary', amount: 1000, category: 'Salary', date: '2026-04-07' },
    ];

    expect(() => renderChart()).not.toThrow();

    const canvas = document.getElementById('financeChart');
    expect(canvas.getAttribute('aria-label')).toContain('$1,000.00');
  });

  // ─── aria-label and description correctness ─────────────────────

  test('should expose income and expense chart values to assistive technology', async () => {
    setupDOM(`
      <canvas id="financeChart" width="800" height="260"></canvas>
      <p id="financeChartDescription"></p>
    `);

    Object.defineProperty(document.getElementById('financeChart'), 'clientWidth', {
      configurable: true,
      value: 800,
    });

    const { state } = await import('./state.js');
    const { renderChart } = await import('./chart.js');

    state.transactions = [
      { id: 'tx_1', title: 'Salary', amount: 1200, category: 'Salary', date: '2026-04-07' },
      { id: 'tx_2', title: 'Groceries', amount: -250, category: 'Food', date: '2026-04-08' },
    ];

    renderChart();

    const canvas = document.getElementById('financeChart');
    const description = document.getElementById('financeChartDescription');
    const expectedDescription =
      'Bar chart comparing total income and total expenses. ' +
      'Total income is $1,200.00. Total expenses are $250.00.';

    expect(canvas.getAttribute('aria-label')).toBe(expectedDescription);
    expect(description.textContent).toBe(expectedDescription);
  });
});
