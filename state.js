/**
 * Application state management and LocalStorage persistence
 * No DOM dependencies
 */

export const STORAGE_KEY = "financeTrackerData";
export const THEME_KEY = "financeTrackerTheme";
export const COOKIE_KEY = "financeTrackerCookieConsent";

export const state = {
  transactions: [],
  filters: {
    category: "all",
    type: "all",
    search: "",
  },
  editingId: null,
  pendingDeleteId: null,
  theme: "dark",
  cookieConsent: null,
};

export const saveToLocalStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
};

const isValidTransaction = (transaction) => {
  return (
    transaction &&
    typeof transaction.id === "string" &&
    typeof transaction.title === "string" &&
    typeof transaction.amount === "number" &&
    Number.isFinite(transaction.amount) &&
    typeof transaction.category === "string" &&
    typeof transaction.date === "string"
  );
};

export const loadFromLocalStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    state.transactions = [];
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    state.transactions = Array.isArray(parsed)
      ? parsed.filter(isValidTransaction)
      : [];
  } catch {
    state.transactions = [];
  }
};

export const saveTheme = () => {
  localStorage.setItem(THEME_KEY, state.theme);
};

export const setTheme = (theme) => {
  state.theme = theme;
  document.body.classList.toggle("theme-light", theme === "light");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute("data-i18n", theme === "light" ? "header.themeDark" : "header.themeLight");
  }
  saveTheme();
};

export const loadTheme = () => {
  const storedTheme = localStorage.getItem(THEME_KEY);
  setTheme(storedTheme || "dark");
};

export const saveCookieConsent = () => {
  if (state.cookieConsent) {
    localStorage.setItem(COOKIE_KEY, state.cookieConsent);
  }
};

export const loadCookieConsent = () => {
  return localStorage.getItem(COOKIE_KEY) || null;
};
