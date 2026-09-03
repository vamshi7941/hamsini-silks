export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string | null;
  version: string;
};

export const COOKIE_CONSENT_KEY = 'hamsini_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'cookie-consent-changed';

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  acceptedAt: null,
  version: 'v1',
};

export function getCookieConsent(): CookiePreferences | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${COOKIE_CONSENT_KEY}=`));

  if (!match) return null;

  try {
    const decoded = decodeURIComponent(match.split('=')[1]);
    const parsed = JSON.parse(decoded) as Partial<CookiePreferences>;

    return {
      necessary: parsed.necessary ?? true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      acceptedAt: parsed.acceptedAt ?? null,
      version: parsed.version ?? 'v1',
    };
  } catch (error) {
    return null;
  }
}

export function setCookieConsent(preferences: Partial<CookiePreferences>) {
  if (typeof document === 'undefined') return;

  const nextPreferences: CookiePreferences = {
    ...DEFAULT_PREFERENCES,
    ...preferences,
    necessary: true,
    acceptedAt: preferences.acceptedAt ?? new Date().toISOString(),
    version: preferences.version ?? 'v1',
  };

  const isSecure = window.location.protocol === 'https:';
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  const cookieValue = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(JSON.stringify(nextPreferences))}; expires=${expires}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;

  document.cookie = cookieValue;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
  }
}

export function hasAnalyticsConsent() {
  const consent = getCookieConsent();
  return !!consent?.analytics;
}

export function hasMarketingConsent() {
  const consent = getCookieConsent();
  return !!consent?.marketing;
}
