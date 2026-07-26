import { AdminApi } from '@/api/admin';
import { useStore } from '@/context/StoreContext';
import { useEffect, useState } from 'react';

export default function Ribbon() {
  const { siteContent, setSiteContent } = useStore();
  const { fetchSiteContent, saveRibbonContent } = AdminApi();
  const [ribbonInput, setRibbonInput] = useState('');

  useEffect(() => {
    setRibbonInput((siteContent?.ribbon || []).join('; '));
  }, [siteContent?.ribbon]);

  const handleRibbonChange = (value: string) => {
    setRibbonInput(value);
  };

  const handleRibbonSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitized = ribbonInput
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean);

    const saved = await saveRibbonContent(sanitized);
    if (saved?.success) {
      const refreshed = await fetchSiteContent();
      if (refreshed?.success) {
        setSiteContent((prev) => ({
          ...prev,
          ribbon: refreshed.ribbon || [],
          categories: refreshed.categories || prev.categories,
          heroContent: refreshed.heroContent || prev.heroContent,
          features: refreshed.features || prev.features,
        }));
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gold-100 p-5 shadow-xs">
      <div className="mb-4">
        <h4 className="font-semibold text-maroon-900">Header Ribbon</h4>
        <p className="text-sm text-maroon-700/70">
          Enter ribbon messages in one field, separated by semicolons.
        </p>
      </div>

      <form onSubmit={handleRibbonSave} className="space-y-3">
        <div className="rounded-xl border border-gold-200 bg-gold-50/50 p-3">
          <label className="mb-2 block text-sm font-medium text-maroon-800">
            Ribbon Messages
          </label>
          <input
            value={ribbonInput}
            onChange={(e) => handleRibbonChange(e.target.value)}
            placeholder="Enter messages separated by ;"
            className="w-full rounded-xl border border-gold-200 px-3 py-2 text-left"
          />
          <p className="mt-2 text-xs text-maroon-700/70">
            Example: Free Shipping on orders above ₹5,000; New Arrivals in
            Store; Limited Time Offer!
          </p>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-maroon-900 px-4 py-2.5 text-sm font-semibold text-gold-100"
        >
          Save Ribbon
        </button>
      </form>
    </div>
  );
}
