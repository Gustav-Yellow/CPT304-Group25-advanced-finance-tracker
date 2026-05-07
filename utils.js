/**
 * Pure utility helper functions
 * No dependencies - fully testable
 */

export const generateID = () => {
  return `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const groupByMonth = (transactions) => {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const groups = [];
  const lookup = new Map();

  sorted.forEach((tx) => {
    const label = new Date(tx.date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!lookup.has(label)) {
      lookup.set(label, { label, items: [] });
      groups.push(lookup.get(label));
    }

    lookup.get(label).items.push(tx);
  });

  return groups;
};

/**
 * Escape HTML special characters to prevent DOM-based XSS.
 * Converts <, >, &, ", ' to their corresponding HTML entities.
 */
export const escapeHTML = (str) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(str).replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Sanitize a CSV cell value to prevent formula injection.
 * If the value starts with =, +, -, or @, prepend a single quote.
 */
export const sanitizeCSVCell = (cell) => {
  let str = String(cell).replaceAll('"', '""');
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
};

/**
  * Create a debounced version of a function with requestAnimationFrame.
 * The returned function delays invoking `fn` until `delay` milliseconds
 * have elapsed since the last invocation, then executes during the next
 * browser repaint cycle to avoid layout thrashing.
 */
export const debounceRAF = (fn, delay = 300) => {
  let timer;  
  let rafId;
  return (...args) => {
    clearTimeout(timer);
    window.cancelAnimationFrame(rafId);
    timer = setTimeout(() => {
      rafId = window.requestAnimationFrame(() => fn(...args));
    }, delay);
  };
};