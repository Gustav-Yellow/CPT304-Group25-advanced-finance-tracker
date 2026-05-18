# Advanced Finance Tracker - Group25

Live Demo:  
https://cpt304-group25-advanced-finance-tracker.onrender.com

---

## Preview

<p align="center">
  <img src="https://oss.itbaima.cn/hub/443/image-20260518z963saqcu.png" alt="Advanced Finance Tracker English Version Preview" width="100%" />
</p>



---

## New Project Structure

```plaintext
├── index.html          # Frontend entry point with enhanced accessibility and i18n semantics
├── style.css           # Responsive layout and modern UI styling
├── dom.js              # Centralized DOM selector registry
├── state.js            # Global state management, LocalStorage sync, and strict JSON schema validation
├── utils.js            # Pure utility functions (currency formatting, ID generation, HTML escaping, debouncing)
├── ui.js               # UI interaction helpers (Toast notifications, form error handling)
├── chart.js            # Canvas 2D cash flow rendering engine with dynamic accessibility descriptions
├── i18n.js             # Lightweight custom internationalization engine (Supports EN / ZH)
├── cookie.js           # GDPR-compliant Cookie consent banner controller
├── babel.config.json   # Babel configuration for cross-platform syntax compatibility
├── package.json        # Project dependencies and automated CI/CD scripts
└── *.test.js           # Comprehensive Jest + JSDOM unit test suites for all core modules
```

---

## Refactoring Highlights 

Compared to the original monolithic structure, we implemented the following revolutionary architectural improvements: 

1. **Strict Modularization (ES6 Modules)**: Eliminated global variable pollution with clear separation of duties. By explicitly declaring dependency chains using native `import/export`, the system's maintainability and scalability were significantly improved. 
2. **Decoupled State and Rendering**: Business data state is centralized in `state.js`, pure computation logic in `utils.js`, and UI rendering driven by `app.js`. This creates a unidirectional data flow, preventing data corruption caused by fragmented state mutations. 
3. **Design for Testability**: Internal implicit variables were transformed into exported white-box functions. By utilizing `jest-environment-jsdom` to simulate the browser DOM in Node.js, we achieved an industrial-grade testing robustness of **97.41% Statement Coverage**, **86.9% Branch Coverage**, and **97.01% Function Coverage**.

<p align="center">
  <img src="https://oss.itbaima.cn/hub/443/image-20260518tkkhe6pyn.png" alt="Advanced Finance Tracker English Version Preview" width="100%" />
</p>


------

## Resolved Deficiencies 

We successfully addressed 4+1 systemic flaws from the original codebase, ensuring the application is impeccable in terms of security, performance, and compliance:

### 1. DOM-based Cross-Site Scripting (XSS)

- **Root Cause**: The original rendering pipeline in `renderTransactionItem` directly interpolated user-controlled inputs (e.g., `tx.title`) via template literals and injected them into the `innerHTML` sink without sanitization, allowing malicious script injection. 
- **Resolution**: Introduced an `escapeHTML` pure function in `utils.js` based on the "Zero-Trust Input" paradigm. This applies contextual entity encoding to sensitive HTML control characters (`<, >, &, ", '`), completely neutralizing the XSS attack vector.

### 2. CSV Formula Injection 

* **Root Cause**: The legacy CSV export function only handled double-quote escaping, ignoring execution context security for the first character. Malicious payloads like `=cmd|' /C calc'!A0` could be exported and executed as DDE macros in Microsoft Excel. 
* **Resolution**: Upgraded the `exportToCSV` algorithm to enforce first-character validation. If a cell value starts with `[=, +, -, @]`, a safe single quote `'` is automatically prepended, forcing spreadsheet software to evaluate the payload as innocuous plain text.

### 3. Search Input Performance Bottleneck (Missing Debounce)

- **Root Cause**: The search bar was bound to a native high-frequency `input` event. Every keystroke triggered an immediate full-array filter, re-sorting, and a destructive DOM tree reconstruction (`innerHTML`), causing severe frame drops during rapid typing. 
- **Resolution**: Implemented a reusable `debounce` algorithm using advanced closures in `utils.js`. A 300ms buffer was applied to the search response, triggering UI repaints only when the user pauses typing, achieving graceful degradation on the main thread.

### 4. Canvas Accessibility Blind Spot 

- **Root Cause**: The cash flow dashboard utilized a native `<canvas>` for pixel-level rendering, acting as an unreadable "visual black box" for screen readers, severely violating WCAG accessibility guidelines. 
- **Resolution**: Enforced the semantic `role="img"` attribute on the Canvas element in the HTML structure. Additionally, dynamically updated the `aria-label` attribute within the `renderChart` function to reflect real-time calculated income and expenses, allowing visually impaired users to access live financial metrics.

### 5. LocalStorage Data Corruption Guard 

- **Root Cause**: The system blindly trusted local persistent storage. If a third-party script or user tampered with the JSON string in LocalStorage, the application would crash with a fatal `SyntaxError` or render corrupted data upon initialization. 
- **Resolution**: Built a robust `try...catch` sandbox within `loadFromLocalStorage` in `state.js`. Introduced a strict type assertion function (`isValidTransaction`) to validate the data types of `id`, `title`, `amount`, `category`, and `date`. The `Array.prototype.filter` method is used to gracefully discard invalid entries, ensuring system resilience.

------

## Advanced Features 

- **Native Internationalization (i18n)**: Developed a lightweight declarative i18n system. By binding dictionary keys to custom `data-i18n` HTML attributes, the application supports seamless toggling between English (EN) and Simplified Chinese (ZH). 

<p align="center">
  <img src="https://oss.itbaima.cn/hub/443/image-20260518j7yb3xja7.png" alt="Advanced Finance Tracker Chinese Version Preview" width="100%" />
</p>


- **Legal Compliance (GDPR)**: Strictly adheres to GDPR regulations by implementing a Cookie Consent Banner upon the user's first visit. Local storage is strictly gated until explicit user consent is granted. A dedicated Privacy Policy modal is also provided to disclose data handling practices transparently.

<p align="center">
  <img src="https://oss.itbaima.cn/hub/443/image-20260518h4yzqvwnw.png" alt="Advanced Finance Tracker Chinese Version Preview" width="100%" />
</p>


------

## Contributors (Group 25) 

This project was collaboratively developed by the Group 25 team: 

- **Dong Jiawei** — CSV Formula Injection remediation, global state flow isolation, LocalStorage type assertion guard. 
- **Huang Junhao** — Security auditing, DOM-based XSS remediation, modular utility layer & unit testing environment setup, CI/CD pipeline configuration. 
- **Wu Ruiyang** — Canvas 2D accessibility (A11y) semantic enhancements, GDPR-compliant Cookie banner, and Privacy Policy documentation.
- **Zhu Ziyan** — Search performance optimization (Debounce algorithm), declarative i18n core engine and language toggle implementation. 

