import { initCookieBanner, acceptCookies, declineCookies } from './cookie.js';
import { state, saveCookieConsent } from './state.js';
import { dom } from './dom.js';

jest.mock('./state.js', () => ({
  state: { cookieConsent: null },
  saveCookieConsent: jest.fn()
}));

jest.mock('./dom.js', () => ({
  dom: {
    cookieBanner: {
      classList: { add: jest.fn(), remove: jest.fn() },
      setAttribute: jest.fn()
    }
  }
}));

describe('Cookie Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    state.cookieConsent = null;
  });

  describe('initCookieBanner', () => {
    test('should show banner if consent is null', () => {
      state.cookieConsent = null;
      initCookieBanner();
      expect(dom.cookieBanner.classList.add).toHaveBeenCalledWith('is-open');
      expect(dom.cookieBanner.setAttribute).toHaveBeenCalledWith('aria-hidden', 'false');
    });

    test('should hide banner if consent already exists', () => {
      state.cookieConsent = 'accepted';
      initCookieBanner();
      expect(dom.cookieBanner.classList.remove).toHaveBeenCalledWith('is-open');
      expect(dom.cookieBanner.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');
    });
  });

  describe('Cookie Actions', () => {
    test('acceptCookies should update state and hide banner', () => {
      acceptCookies();
      expect(state.cookieConsent).toBe('accepted');
      expect(saveCookieConsent).toHaveBeenCalled();
      expect(dom.cookieBanner.classList.remove).toHaveBeenCalledWith('is-open');
    });

    test('declineCookies should update state and hide banner', () => {
      declineCookies();
      expect(state.cookieConsent).toBe('declined');
      expect(saveCookieConsent).toHaveBeenCalled();
      expect(dom.cookieBanner.classList.remove).toHaveBeenCalledWith('is-open');
    });
  });
});