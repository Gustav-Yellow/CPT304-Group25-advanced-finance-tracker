/**
 * Cookie consent banner management
 * Dependencies: state.js, dom.js
 */

import { state, saveCookieConsent } from './state.js';
import { dom } from './dom.js';

export const COOKIE_KEY = "financeTrackerCookieConsent";

const hideBanner = () => {
  dom.cookieBanner.classList.remove("is-open");
  dom.cookieBanner.setAttribute("aria-hidden", "true");
};

const showBanner = () => {
  dom.cookieBanner.classList.add("is-open");
  dom.cookieBanner.setAttribute("aria-hidden", "false");
};

export const initCookieBanner = () => {
  if (state.cookieConsent === null) {
    showBanner();
  } else {
    hideBanner();
  }
};

export const acceptCookies = () => {
  state.cookieConsent = "accepted";
  saveCookieConsent();
  hideBanner();
};

export const declineCookies = () => {
  state.cookieConsent = "declined";
  saveCookieConsent();
  hideBanner();
};
