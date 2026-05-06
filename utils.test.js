import { generateID, formatCurrency, formatDate, groupByMonth, escapeHTML, sanitizeCSVCell } from './utils.js';

describe('Utils Module Tests', () => {

  // Test suite for the generateID utility function
  describe('generateID', () => {
    // Test to ensure the generated ID is a string, starts with the specific prefix 'tx_', 
    // and is completely unique across multiple consecutive calls.
    test('should create a unique string starting with tx_', () => {
      const id1 = generateID();
      const id2 = generateID();
      
      expect(typeof id1).toBe('string');
      expect(id1.startsWith('tx_')).toBe(true);
      expect(id1).not.toBe(id2);
    });
  });

  // Test suite for the formatCurrency utility function
  describe('formatCurrency', () => {
    // Test to verify that numbers (including positive, negative, and zero values) 
    // are correctly formatted into standard USD currency strings.
    test('should correctly format positive, negative, and zero numbers to USD', () => {
      expect(formatCurrency(1200.5)).toBe('$1,200.50');
      expect(formatCurrency(-45)).toBe('-$45.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  // Test suite for the formatDate utility function
  describe('formatDate', () => {
    // Test to confirm that a given ISO date string is properly parsed and 
    // formatted into a localized readable date string (e.g., MMM D, YYYY).
    test('should return formatted date string', () => {
      const testDate = '2026-04-07T12:00:00Z';
      const formatted = formatDate(testDate);
      
      expect(formatted).toMatch(/2026/);
      expect(formatted).toMatch(/Apr/i); 
    });
  });

  // Test suite for the groupByMonth utility function
  describe('groupByMonth', () => {
    // Test to check if an array of unordered transaction objects is correctly 
    // sorted in descending order by date, and logically grouped into month objects.
    test('should sort transactions by date descending and group them by month', () => {
      const mockTransactions = [
        { id: '1', date: '2026-01-15' }, 
        { id: '2', date: '2026-03-10' }, 
        { id: '3', date: '2026-01-20' }, 
        { id: '4', date: '2026-04-05' }  
      ];

      const result = groupByMonth(mockTransactions);

      expect(result.length).toBe(3);
      expect(result[0].label).toMatch(/April 2026/i);
      expect(result[1].label).toMatch(/March 2026/i);
      expect(result[2].label).toMatch(/January 2026/i);
      
      expect(result[2].items.length).toBe(2);
      expect(result[2].items[0].id).toBe('3'); 
      expect(result[2].items[1].id).toBe('1'); 
    });

    // Test to ensure that providing an empty array as input is handled gracefully
    // and returns an empty grouping array without throwing errors.
    test('should handle empty arrays correctly', () => {
      const result = groupByMonth([]);
      expect(result).toEqual([]); 
    });
  });

  // Test suite for the newly added escapeHTML utility function (DOM-based XSS mitigation)
  describe('escapeHTML', () => {
    // Test to verify that dangerous HTML characters (<, >, &, ", ') are correctly
    // escaped into their corresponding safe HTML entities to prevent XSS attacks.
    test('should escape dangerous HTML characters to prevent XSS', () => {
      const maliciousInput = '<script>alert("xss & hack")</script>';
      const safeOutput = '&lt;script&gt;alert(&quot;xss &amp; hack&quot;)&lt;/script&gt;';

      expect(escapeHTML(maliciousInput)).toBe(safeOutput);
    });

    // Test to ensure that non-string inputs (like numbers or null) are converted
    // to strings safely without breaking the application logic.
    test('should convert non-string inputs to strings safely', () => {
      expect(escapeHTML(123)).toBe('123');
      expect(escapeHTML(null)).toBe('null');
    });
  });

  // Test suite for the newly added sanitizeCSVCell utility function (CSV Formula Injection mitigation)
  describe('sanitizeCSVCell', () => {
    // Test to verify that plain text is wrapped in double quotes.
    test('should wrap plain text in double quotes', () => {
      expect(sanitizeCSVCell('Salary')).toBe('"Salary"');
    });

    // Test to verify that existing double quotes are escaped correctly.
    test('should escape existing double quotes', () => {
      expect(sanitizeCSVCell('Say "Hello"')).toBe('"Say ""Hello"""');
    });

    // Test to verify that formula-triggering characters at the start are neutralized
    // with a leading single quote, preventing CSV Injection in Excel / Sheets.
    test('should prepend single quote to formula-triggering characters', () => {
      expect(sanitizeCSVCell('=cmd')).toBe('"\'=cmd"');
      expect(sanitizeCSVCell('+cmd')).toBe('"\'+cmd"');
      expect(sanitizeCSVCell('-cmd')).toBe('"\'-cmd"');
      expect(sanitizeCSVCell('@cmd')).toBe('"\'@cmd"');
    });

    // Test to verify that numbers are handled correctly, including negative values
    // which start with a minus sign and must be protected.
    test('should handle numbers correctly', () => {
      expect(sanitizeCSVCell(1200)).toBe('"1200"');
      expect(sanitizeCSVCell(-45)).toBe('"\'-45"');
    });
  });

});