/**
 * Application state management and LocalStorage persistence
 * No DOM dependencies
 */

export const STORAGE_KEY = "financeTrackerData";
export const THEME_KEY = "financeTrackerTheme";

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
};

export const saveToLocalStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
};

export const loadFromLocalStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  state.transactions = stored ? JSON.parse(stored) : [];
};

export const saveTheme = () => {
  localStorage.setItem(THEME_KEY, state.theme);
};

export const setTheme = (theme) => {
  state.theme = theme;
  document.body.classList.toggle("theme-light", theme === "light");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.textContent = theme === "light" ? "Dark Mode" : "Light Mode";
  }
  saveTheme();
};

export const loadTheme = () => {
  const storedTheme = localStorage.getItem(THEME_KEY);
  setTheme(storedTheme || "dark");
};
