import { generateID, formatCurrency, formatDate, groupByMonth } from './utils.js';

describe('Utils Module Tests', () => {

  describe('generateID', () => {
    test('should create a unique string starting with tx_', () => {
      const id1 = generateID();
      const id2 = generateID();
      expect(typeof id1).toBe('string');
      expect(id1.startsWith('tx_')).toBe(true);
      expect(id1).not.toBe(id2); // 确保每次生成的 ID 唯一
    });
  });

  describe('formatCurrency', () => {
    test('should correctly format positive, negative, and zero numbers to USD', () => {
      expect(formatCurrency(1200.5)).toBe('$1,200.50');
      expect(formatCurrency(-45)).toBe('-$45.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatDate', () => {
    test('should return formatted date string (MMM D, YYYY)', () => {
      const testDate = '2026-04-07T12:00:00Z';
      const formatted = formatDate(testDate);
      // 因为不同时区可能导致日期偏差，这里测试核心的年份和月份格式
      expect(formatted).toMatch(/2026/);
      expect(formatted).toMatch(/Apr/i); 
    });
  });

  describe('groupByMonth', () => {
    test('should sort transactions by date descending and group them by month', () => {
      // 构造模拟的交易数据 (打乱时间顺序)
      const mockTransactions = [
        { id: '1', date: '2026-01-15' }, // 1月
        { id: '2', date: '2026-03-10' }, // 3月
        { id: '3', date: '2026-01-20' }, // 1月 (同月)
        { id: '4', date: '2026-04-05' }  // 4月 (最新)
      ];

      const result = groupByMonth(mockTransactions);

      // 1. 验证分组数量 (应该有 3 个月: 4月, 3月, 1月)
      expect(result.length).toBe(3);

      // 2. 验证排序: 最新的月份排在最前面 (4月 -> 3月 -> 1月)
      expect(result[0].label).toMatch(/April 2026/i);
      expect(result[1].label).toMatch(/March 2026/i);
      expect(result[2].label).toMatch(/January 2026/i);

      // 3. 验证同月归类: 1月份应该有2条交易记录
      expect(result[2].items.length).toBe(2);
      
      // 4. 验证内部项目的排序: 1月20日应该排在1月15日前面
      expect(result[2].items[0].id).toBe('3'); 
      expect(result[2].items[1].id).toBe('1'); 
    });

    test('should handle empty arrays correctly', () => {
      const result = groupByMonth([]);
      expect(result).toEqual([]); // 空数组应该返回空分组
    });
  });

});