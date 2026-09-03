import { useEffect, useState } from 'react';
import { getCookieConsent, setCookieConsent } from '../utils/cookieConsent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const existingConsent = getCookieConsent();
    if (!existingConsent) {
      setIsVisible(true);
    }
  }, []);

  const savePreferences = (analytics: boolean, marketing: boolean) => {
    setCookieConsent({
      necessary: true,
      analytics,
      marketing,
      acceptedAt: new Date().toISOString(),
      version: 'v1',
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e4d0b8] bg-[#fffaf4]/95 p-4 shadow-[0_-8px_40px_rgba(90,45,28,0.12)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6d3b24]">
            Cookie preferences
          </p>
          <p className="mt-2 text-sm leading-6 text-[#4a2d20]">
            We use cookies to improve your shopping experience and understand how
            visitors use our site. You can choose to accept or reject optional
            cookies before continuing.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => savePreferences(true, true)}
            className="rounded-full bg-[#7a4027] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#633620]"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => savePreferences(false, false)}
            className="rounded-full border border-[#d4b595] bg-white px-5 py-2.5 text-sm font-medium text-[#5b2f1f] transition hover:border-[#b8895d]"
          >
            Reject all
          </button>
        </div>
      </div>
    </div>
  );
}
