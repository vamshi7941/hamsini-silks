import { AdminApi, HeroContent } from '@/api/admin';
import { useStore } from '@/context/StoreContext';
import { fileToBase64 } from '@/utils/image';
import { useEffect, useRef, useState } from 'react';

export default function Hero() {
  const { siteContent } = useStore();
  const { fetchSiteContent, saveHeroContent } = AdminApi();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [heroForm, setHeroForm] = useState<HeroContent>({});
  const { products } = useStore();

  const handleHeroSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await saveHeroContent(heroForm).then((res) => res);

    if (saved.success) {
      const updated = await fetchSiteContent().then((res) => res);

      if (updated.success) setHeroForm(updated.heroContent || {});
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setHeroForm((prev) => ({ ...prev, image: base64 }));
    if (e.target) e.target.value = '';
  };

  useEffect(() => {
    if (siteContent?.heroContent) {
      setHeroForm(siteContent.heroContent);
    }
  }, [siteContent]);

  return (
    <div className="bg-white rounded-2xl border border-gold-100 p-5 shadow-xs">
      <h4 className="font-semibold text-maroon-900 mb-4">
        Hero Section Content
      </h4>
      <form onSubmit={handleHeroSave} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Eyebrow
            </label>
            <input
              value={heroForm.eyebrow || ''}
              onChange={(e) =>
                setHeroForm({ ...heroForm, eyebrow: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Title Line 1
            </label>
            <input
              value={heroForm.titleLine1 || ''}
              onChange={(e) =>
                setHeroForm({ ...heroForm, titleLine1: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Title Line 2
            </label>
            <input
              value={heroForm.titleLine2 || ''}
              onChange={(e) =>
                setHeroForm({ ...heroForm, titleLine2: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Subtitle
            </label>
            <input
              value={heroForm.subtitle || ''}
              onChange={(e) =>
                setHeroForm({ ...heroForm, subtitle: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Description
            </label>
            <textarea
              value={heroForm.description || ''}
              onChange={(e) =>
                setHeroForm({ ...heroForm, description: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              rows={3}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex w-1/2 flex-col gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Primary Button Label
              </label>
              <input
                value={heroForm.primaryButtonLabel || ''}
                onChange={(e) =>
                  setHeroForm({
                    ...heroForm,
                    primaryButtonLabel: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gold-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Primary Button Target
              </label>
              <input
                value={heroForm.primaryButtonTarget || ''}
                onChange={(e) =>
                  setHeroForm({
                    ...heroForm,
                    primaryButtonTarget: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gold-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Secondary Button Label
              </label>
              <input
                value={heroForm.secondaryButtonLabel || ''}
                onChange={(e) =>
                  setHeroForm({
                    ...heroForm,
                    secondaryButtonLabel: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gold-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Secondary Button Target
              </label>
              <input
                value={heroForm.secondaryButtonTarget || ''}
                onChange={(e) =>
                  setHeroForm({
                    ...heroForm,
                    secondaryButtonTarget: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gold-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Featured Product
              </label>
              <select
                value={heroForm.featuredProductId || ''}
                onChange={(e) =>
                  setHeroForm({
                    ...heroForm,
                    featuredProductId: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gold-200 px-3 py-2"
              >
                <option value="">-- select product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p._id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Badge Text (optional)
              </label>
              <input
                value={heroForm.badgeText || ''}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, badgeText: e.target.value })
                }
                className="w-full rounded-xl border border-gold-200 px-3 py-2"
              />
            </div>
          </div>
          <div className="flex w-1/2 flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Image URL
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-gold-200 px-3 py-2 bg-white"
              onChange={handleImageChange}
            />
            {heroForm.image && (
              <div className="mt-3 rounded-xl border border-gold-100 p-2">
                <img
                  src={heroForm.image}
                  alt="Category preview"
                  className="h-[40vh] w-full rounded-lg object-contain"
                />
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-maroon-900 px-4 py-2.5 text-sm font-semibold text-gold-100"
        >
          Save Hero Section
        </button>
      </form>
    </div>
  );
}
