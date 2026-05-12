/**
 * Main application entry point
 * Dependencies: utils.js, state.js, dom.js, ui.js, chart.js
 */

/**
 * Old import from utils.js, doesn't include utils.js
 */
// import { generateID, formatCurrency, formatDate, groupByMonth } from './utils.js';
/**
 * New import escapeHTML
 */
import { generateID, formatCurrency, formatDate, groupByMonth, escapeHTML, sanitizeCSVCell, debounceRAF  } from './utils.js';
import { state, saveToLocalStorage, loadFromLocalStorage, loadTheme, setTheme, loadCookieConsent } from './state.js';
import { initCookieBanner, acceptCookies, declineCookies } from './cookie.js';
import { dom } from './dom.js';
import { showToast, clearErrors, setError } from './ui.js';
import { renderChart } from './chart.js';
import { t, loadLanguage, setLanguage, getLanguage, updatePageTranslations } from './i18n.js';

export const validateForm = () => {
  clearErrors();

  const title = dom.titleInput.value.trim();
  const amountValue = dom.amountInput.value.trim();
  const amount = Number(amountValue);
  const category = dom.categoryInput.value;
  const date = dom.dateInput.value;

  let isValid = true;

  if (!title) {
    setError(dom.titleInput, dom.titleError, t("validation.titleRequired"));
    isValid = false;
  }

  if (!amountValue || Number.isNaN(amount) || amount === 0) {
    setError(dom.amountInput, dom.amountError, t("validation.amountInvalid"));
    isValid = false;
  }

  if (!category) {
    setError(dom.categoryInput, dom.categoryError, t("validation.categoryRequired"));
    isValid = false;
  }

  if (!date) {
    setError(dom.dateInput, dom.dateError, t("validation.dateRequired"));
    isValid = false;
  }

  return isValid;
};

export const resetFormState = () => {
  dom.form.reset();
  state.editingId = null;
  dom.submitBtn.textContent = t("form.submit");
  dom.cancelEditBtn.hidden = true;
  clearErrors();
};

export const filterTransactions = () => {
  const { category, type, search } = state.filters;

  return state.transactions.filter((tx) => {
    const matchesCategory = category === "all" || tx.category === category;

    const matchesType =
      type === "all" ||
      (type === "income" && tx.amount > 0) ||
      (type === "expense" && tx.amount < 0);

    const matchesSearch = tx.title.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesType && matchesSearch;
  });
};

/**
 * Old Version: Rendering unescaped HTML into the DOM via innerHTML
 * @param {*} tx 
 * @returns 
 */
// const renderTransactionItem = (tx) => {
//   const typeClass = tx.amount >= 0 ? "amount--income" : "amount--expense";
//   const formattedAmount = formatCurrency(tx.amount);
//   const formattedDate = formatDate(tx.date);

//   return `
//     <div class="transaction">
//       <div>
//         <p class="transaction__title">${tx.title}</p>
//         <div class="transaction__meta">
//           <span class="badge">${tx.category}</span>
//           <span>${formattedDate}</span>
//         </div>
//       </div>
//       <div>
//         <p class="amount ${typeClass}">${formattedAmount}</p>
//         <button class="edit-btn" data-id="${tx.id}">Edit</button>
//         <button class="delete-btn" data-id="${tx.id}">Delete</button>
//       </div>
//     </div>
//   `;
// };

/**
 * Fixed Version
 */
export const renderTransactionItem = (tx) => {
  const typeClass = tx.amount >= 0 ? "amount--income" : "amount--expense";
  const formattedAmount = formatCurrency(tx.amount);
  const formattedDate = formatDate(tx.date);

  return `
    <div class="transaction">
      <div>
        <p class="transaction__title">${escapeHTML(tx.title)}</p>
        <div class="transaction__meta">
          <span class="badge">${escapeHTML(tx.category)}</span>
          <span>${formattedDate}</span>
        </div>
      </div>
      <div>
        <p class="amount ${typeClass}">${formattedAmount}</p>
        <button class="edit-btn" data-id="${tx.id}">${escapeHTML(t("transaction.edit"))}</button>
        <button class="delete-btn" data-id="${tx.id}">${escapeHTML(t("transaction.delete"))}</button>
      </div>
    </div>
  `;
};

export const renderSummary = () => {
  const amounts = state.transactions.map((tx) => tx.amount);

  const totalIncome = amounts
    .filter((amount) => amount > 0)
    .reduce((sum, amount) => sum + amount, 0);

  const totalExpenses = amounts
    .filter((amount) => amount < 0)
    .reduce((sum, amount) => sum + amount, 0);

  const totalBalance = totalIncome + totalExpenses;

  dom.totalIncome.textContent = formatCurrency(totalIncome);
  dom.totalExpenses.textContent = formatCurrency(Math.abs(totalExpenses));
  dom.totalBalance.textContent = formatCurrency(totalBalance);
};

export const renderTransactions = () => {
  const filtered = filterTransactions();

  dom.resultsCount.textContent = t("transactions.results", { count: filtered.length });

  if (filtered.length === 0) {
    dom.transactionsList.innerHTML = `
      <div class="transactions__empty">
        <div class="empty__icon">+</div>
        <p>${escapeHTML(t("transactions.emptyTitle"))}</p>
        <button class="btn btn--accent empty-add-btn" type="button">${escapeHTML(t("transactions.emptyButton"))}</button>
      </div>
    `;
    return;
  }

  const groups = groupByMonth(filtered);

  dom.transactionsList.innerHTML = groups
    .map(
      (group) => `
        <div class="month-group">
          <p class="month-title">${group.label}</p>
          ${group.items.map(renderTransactionItem).join("")}
        </div>
      `,
    )
    .join("");
};

export const renderApp = () => {
  renderSummary();
  renderTransactions();
  renderChart();
};

export const addTransaction = () => {
  if (!validateForm()) {
    showToast(t("toast.fixFields"), "error");
    return;
  }

  const title = dom.titleInput.value.trim();
  const amount = Number(dom.amountInput.value);
  const category = dom.categoryInput.value;
  const date = dom.dateInput.value;

  if (state.editingId) {
    state.transactions = state.transactions.map((tx) =>
      tx.id === state.editingId ? { ...tx, title, amount, category, date } : tx,
    );
    showToast(t("toast.transactionUpdated"));
  } else {
    const newTransaction = {
      id: generateID(),
      title,
      amount,
      category,
      date,
    };

    state.transactions = [newTransaction, ...state.transactions];
    showToast(t("toast.transactionAdded"));
  }

  resetFormState();
  saveToLocalStorage();
  renderApp();
};

export const startEditing = (id) => {
  const transaction = state.transactions.find((tx) => tx.id === id);
  if (!transaction) return;

  dom.titleInput.value = transaction.title;
  dom.amountInput.value = transaction.amount;
  dom.categoryInput.value = transaction.category;
  dom.dateInput.value = transaction.date;

  state.editingId = id;
  dom.submitBtn.textContent = t("form.saveChanges");
  dom.cancelEditBtn.hidden = false;
  dom.titleInput.focus();
  showToast(t("toast.editingMode"));
};

export const deleteTransaction = (id) => {
  state.transactions = state.transactions.filter((tx) => tx.id !== id);
  saveToLocalStorage();
  renderApp();
  showToast(t("toast.transactionDeleted"));
};

export const openConfirmModal = (id) => {
  state.pendingDeleteId = id;
  dom.confirmModal.classList.add("is-open");
  dom.confirmModal.setAttribute("aria-hidden", "false");
};

export const closeConfirmModal = () => {
  state.pendingDeleteId = null;
  dom.confirmModal.classList.remove("is-open");
  dom.confirmModal.setAttribute("aria-hidden", "true");
};

// Defect2：csv injection
export const exportToCSV = () => {
  if (state.transactions.length === 0) {
    showToast(t("toast.noData"), "error");
    return;
  }

  const headers = ["Title", "Amount", "Category", "Date"];
  const rows = state.transactions.map((tx) => [
    tx.title,
    tx.amount,
    tx.category,
    tx.date,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(sanitizeCSVCell).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "transactions.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showToast(t("toast.csvExported"));
};

export const initializeApp = () => {
  loadFromLocalStorage();
  loadLanguage();
  loadTheme();
  state.cookieConsent = loadCookieConsent();
  updatePageTranslations();
  renderApp();
  initCookieBanner();

  setTimeout(() => {
    dom.skeleton.classList.add("is-hidden");
  }, 300);

  dom.form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTransaction();
  });

  dom.cancelEditBtn.addEventListener("click", () => {
    resetFormState();
  });

  dom.transactionsList.addEventListener("click", (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    const editButton = e.target.closest(".edit-btn");
    const emptyAdd = e.target.closest(".empty-add-btn");

    const deleteId = deleteButton?.dataset?.id;
    const editId = editButton?.dataset?.id;

    if (deleteId) {
      openConfirmModal(deleteId);
    }

    if (editId) {
      startEditing(editId);
    }

    if (emptyAdd) {
      dom.titleInput.focus();
    }
  });

  dom.filterCategory.addEventListener("change", (e) => {
    state.filters.category = e.target.value;
    renderTransactions();
  });

  dom.filterType.addEventListener("change", (e) => {
    state.filters.type = e.target.value;
    renderTransactions();
  });

  dom.searchInput.addEventListener("input", debounceRAF((e) => {
  state.filters.search = e.target.value;
  renderTransactions();
  }, 300));

  dom.resetFiltersBtn.addEventListener("click", () => {
    state.filters = { category: "all", type: "all", search: "" };
    dom.filterCategory.value = "all";
    dom.filterType.value = "all";
    dom.searchInput.value = "";
    renderTransactions();
  });

  dom.exportCsvBtn.addEventListener("click", exportToCSV);

  dom.themeToggleBtn.addEventListener("click", () => {
    setTheme(state.theme === "dark" ? "light" : "dark");
    updatePageTranslations();
  });

  dom.languageToggleBtn.addEventListener("click", () => {
    const newLang = getLanguage() === "en" ? "zh" : "en";
    setLanguage(newLang);
    const btn = dom.themeToggleBtn;
    btn.setAttribute("data-i18n", state.theme === "light" ? "header.themeDark" : "header.themeLight");
    updatePageTranslations();
    renderApp();
  });

  dom.acceptCookiesBtn.addEventListener("click", () => {
    acceptCookies();
  });

  dom.declineCookiesBtn.addEventListener("click", () => {
    declineCookies();
  });

  const openPrivacyModal = () => {
    dom.privacyModal.classList.add("is-open");
    dom.privacyModal.setAttribute("aria-hidden", "false");
  };

  const closePrivacyModal = () => {
    dom.privacyModal.classList.remove("is-open");
    dom.privacyModal.setAttribute("aria-hidden", "true");
  };

  dom.privacyLinkFromBanner.addEventListener("click", openPrivacyModal);
  dom.privacyLinkFromFooter.addEventListener("click", openPrivacyModal);
  dom.closePrivacyBtn.addEventListener("click", closePrivacyModal);
  dom.privacyModal.addEventListener("click", (e) => {
    if (e.target.dataset.close) closePrivacyModal();
  });

  dom.confirmDeleteBtn.addEventListener("click", () => {
    if (state.pendingDeleteId) {
      deleteTransaction(state.pendingDeleteId);
    }
    closeConfirmModal();
  });

  dom.cancelDeleteBtn.addEventListener("click", closeConfirmModal);

  dom.confirmModal.addEventListener("click", (e) => {
    if (e.target.dataset.close) {
      closeConfirmModal();
    }
  });
};

// Auto-start in browser; tests import without triggering full initialization
if (typeof document !== 'undefined' && document.readyState !== 'loading') {
  initializeApp();
} else if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeApp);
}
