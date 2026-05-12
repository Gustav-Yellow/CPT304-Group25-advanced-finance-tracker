/**
 * Internationalization module
 * Manages translations, language switching, and DOM translation updates.
 * Dependencies: utils.js (for setLocale / setCurrency)
 */

import { setLocale } from './utils.js';

export const LANGUAGE_KEY = "financeTrackerLanguage";

export const translations = {
  en: {
    "app.pageTitle": "Advanced Personal Finance Tracker",
    "app.eyebrow": "Personal Finance",
    "app.title": "Advanced Finance Tracker",
    "app.subtitle": "Track income, expenses, and your balance with clarity.",

    "header.themeLight": "Light Mode",
    "header.themeDark": "Dark Mode",
    "header.language": "中文",
    "header.exportCsv": "Export CSV",
    "header.resetFilters": "Reset Filters",

    "summary.balance": "Total Balance",
    "summary.income": "Total Income",
    "summary.expenses": "Total Expenses",

    "chart.title": "Cash Flow Overview",
    "chart.subtitle": "Income vs Expense",
    "chart.income": "Income",
    "chart.expense": "Expense",
    "chart.ariaLabel": "Bar chart comparing total income and total expenses.",
    "chart.description": "Bar chart comparing total income and total expenses. Total income is {income}. Total expenses are {expenses}.",

    "form.title": "Add Transaction",
    "form.label.title": "Title",
    "form.placeholder.title": "e.g., Freelance Payment",
    "form.label.amount": "Amount",
    "form.placeholder.amount": "e.g., 1200 or -45",
    "form.label.category": "Category",
    "form.categoryPlaceholder": "Select category",
    "form.label.date": "Date",
    "form.submit": "Add Transaction",
    "form.saveChanges": "Save Changes",
    "form.cancelEdit": "Cancel Edit",

    "categories.Salary": "Salary",
    "categories.Business": "Business",
    "categories.Investments": "Investments",
    "categories.Housing": "Housing",
    "categories.Food": "Food",
    "categories.Transport": "Transport",
    "categories.Health": "Health",
    "categories.Entertainment": "Entertainment",
    "categories.Education": "Education",
    "categories.Other": "Other",

    "filters.title": "Filters & Search",
    "filters.label.category": "Category",
    "filters.allCategories": "All categories",
    "filters.label.type": "Type",
    "filters.all": "All",
    "filters.income": "Income",
    "filters.expense": "Expense",
    "filters.label.search": "Search by title",
    "filters.placeholder.search": "Start typing...",

    "transactions.title": "Transactions",
    "transactions.results": "{count} results",
    "transactions.emptyTitle": "No transactions yet. Add your first one to get started.",
    "transactions.emptyButton": "Add First Transaction",

    "transaction.edit": "Edit",
    "transaction.delete": "Delete",

    "modal.title": "Delete transaction?",
    "modal.text": "This action cannot be undone.",
    "modal.cancel": "Cancel",
    "modal.delete": "Delete",

    "validation.titleRequired": "Title is required.",
    "validation.amountInvalid": "Enter a valid amount.",
    "validation.categoryRequired": "Select a category.",
    "validation.dateRequired": "Pick a date.",

    "toast.fixFields": "Please fix the highlighted fields.",
    "toast.transactionUpdated": "Transaction updated.",
    "toast.transactionAdded": "Transaction added.",
    "toast.editingMode": "Editing mode enabled.",
    "toast.transactionDeleted": "Transaction deleted.",
    "toast.noData": "No data to export.",
    "toast.csvExported": "CSV exported.",

    "cookie.message": "This site uses cookies to improve your experience.",
    "cookie.privacyLink": "Privacy Policy",
    "cookie.accept": "Accept",
    "cookie.decline": "Decline",

    "privacy.title": "Privacy Policy",
    "privacy.close": "Close",
    "privacy.content": "<p>This application is entirely client-side. All transaction data is stored only in your browser's localStorage and is never transmitted to any server.</p><p>The application uses localStorage to save your preferences, including theme, language, and cookie consent choices. No personal information is collected, tracked, or shared.</p><p>You can delete all stored data at any time by clearing your browser's site data or localStorage for this domain.</p><p>If you have any questions about this privacy policy, please contact the application maintainer.</p>",

    "footer.privacy": "Privacy Policy",
  },

  zh: {
    "app.pageTitle": "高级个人财务追踪器",
    "app.eyebrow": "个人财务",
    "app.title": "高级财务追踪器",
    "app.subtitle": "清晰追踪收入、支出和余额。",

    "header.themeLight": "浅色模式",
    "header.themeDark": "深色模式",
    "header.language": "EN",
    "header.exportCsv": "导出 CSV",
    "header.resetFilters": "重置筛选",

    "summary.balance": "总余额",
    "summary.income": "总收入",
    "summary.expenses": "总支出",

    "chart.title": "现金流概览",
    "chart.subtitle": "收入 vs 支出",
    "chart.income": "收入",
    "chart.expense": "支出",
    "chart.ariaLabel": "比较总收入和总支出的柱状图。",
    "chart.description": "比较总收入和总支出的柱状图。总收入为 {income}。总支出为 {expenses}。",

    "form.title": "添加交易",
    "form.label.title": "标题",
    "form.placeholder.title": "例如：自由职业收入",
    "form.label.amount": "金额",
    "form.placeholder.amount": "例如：1200 或 -45",
    "form.label.category": "类别",
    "form.categoryPlaceholder": "选择类别",
    "form.label.date": "日期",
    "form.submit": "添加交易",
    "form.saveChanges": "保存更改",
    "form.cancelEdit": "取消编辑",

    "categories.Salary": "工资",
    "categories.Business": "商业",
    "categories.Investments": "投资",
    "categories.Housing": "住房",
    "categories.Food": "食品",
    "categories.Transport": "交通",
    "categories.Health": "健康",
    "categories.Entertainment": "娱乐",
    "categories.Education": "教育",
    "categories.Other": "其他",

    "filters.title": "筛选与搜索",
    "filters.label.category": "类别",
    "filters.allCategories": "所有类别",
    "filters.label.type": "类型",
    "filters.all": "全部",
    "filters.income": "收入",
    "filters.expense": "支出",
    "filters.label.search": "按标题搜索",
    "filters.placeholder.search": "开始输入...",

    "transactions.title": "交易记录",
    "transactions.results": "{count} 条记录",
    "transactions.emptyTitle": "暂无交易记录，添加第一条开始使用。",
    "transactions.emptyButton": "添加首条交易",

    "transaction.edit": "编辑",
    "transaction.delete": "删除",

    "modal.title": "删除此交易？",
    "modal.text": "此操作无法撤销。",
    "modal.cancel": "取消",
    "modal.delete": "删除",

    "validation.titleRequired": "请输入标题。",
    "validation.amountInvalid": "请输入有效金额。",
    "validation.categoryRequired": "请选择类别。",
    "validation.dateRequired": "请选择日期。",

    "toast.fixFields": "请修正标红的字段。",
    "toast.transactionUpdated": "交易已更新。",
    "toast.transactionAdded": "交易已添加。",
    "toast.editingMode": "已进入编辑模式。",
    "toast.transactionDeleted": "交易已删除。",
    "toast.noData": "没有可导出的数据。",
    "toast.csvExported": "CSV 已导出。",

    "cookie.message": "本网站使用 Cookie 以改善您的体验。",
    "cookie.privacyLink": "隐私政策",
    "cookie.accept": "接受",
    "cookie.decline": "拒绝",

    "privacy.title": "隐私政策",
    "privacy.close": "关闭",
    "privacy.content": "<p>这是一个纯客户端应用。所有交易数据仅存储在您浏览器的 localStorage 中，不会传输至任何服务器。</p><p>本应用使用 localStorage 保存您的偏好设置，包括主题、语言和 Cookie 同意选择。不会收集、追踪或分享任何个人信息。</p><p>您可以随时通过清除浏览器站点数据或该域名的 localStorage 来删除所有存储的数据。</p><p>如果您对此隐私政策有任何疑问，请联系应用维护者。</p>",

    "footer.privacy": "隐私政策",
  },
};

export let currentLang = "en";

export function t(key, params = {}) {
  const str =
    translations[currentLang]?.[key] ??
    translations.en?.[key] ??
    key;
  return str.replace(/\{(\w+)\}/g, (_, name) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`,
  );
}

export function getLanguage() {
  return currentLang;
}

export function getLocale() {
  return currentLang === "zh" ? "zh-CN" : "en-US";
}

export function loadLanguage() {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === "zh" || saved === "en") {
    currentLang = saved;
  }
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  setLocale(getLocale());
}

export function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.title = t("app.pageTitle");
  localStorage.setItem(LANGUAGE_KEY, lang);
  setLocale(getLocale());
  updatePageTranslations();
}

export function updatePageTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      el.setAttribute("placeholder", t(key));
    }
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) {
      el.innerHTML = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    if (key) {
      el.setAttribute("aria-label", t(key));
    }
  });
}
