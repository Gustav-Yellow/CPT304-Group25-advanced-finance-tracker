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

    document.body.innerHTML = `
      <canvas id="financeChart"></canvas>
      <p id="financeChartDescription"></p>
    `;

    HTMLCanvasElement.prototype.getContext = jest.fn(() =>
      mockCanvasContext(),
    );

    Object.defineProperty(document.getElementById('financeChart'), 'clientWidth', {
      configurable: true,
      value: 800,
    });
  });

  test('should expose income and expense chart values to assistive technology', async () => {
    const { state } = await import('./state.js');
    const { renderChart } = await import('./chart.js');

    state.transactions = [
      {
        id: 'tx_1',
        title: 'Salary',
        amount: 1200,
        category: 'Salary',
        date: '2026-04-07',
      },
      {
        id: 'tx_2',
        title: 'Groceries',
        amount: -250,
        category: 'Food',
        date: '2026-04-08',
      },
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
