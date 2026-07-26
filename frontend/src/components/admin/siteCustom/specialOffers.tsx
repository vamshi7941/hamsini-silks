import { useEffect, useState } from 'react';
import { AdminApi, BridalContent, BridalImageContent } from '@/api/admin';
import { useStore } from '@/context/StoreContext';

const emptyBridalForm = (): BridalContent => ({
  eyebrow: '',
  titlePrefix: '',
  titleHighlight: '',
  titleSuffix: '',
  subtitle: '',
  description: '',
  badgePercent: '',
  badgeText: '',
  couponCode: '',
  couponLabel: '',
  savingsText: '',
  buttonLabel: '',
  buttonTarget: '',
  images: [
    { src: '/images/model1.jpg', alt: 'Bridal pink saree' },
    { src: '/images/saree-banarasi.jpg', alt: 'Banarasi saree' },
    { src: '/images/saree-kanjivaram.jpg', alt: 'Kanjivaram saree' },
    { src: '/images/model2.jpg', alt: 'Bridal mustard saree' },
  ],
});

export default function SpecialOffers() {
  const { siteContent, setSiteContent } = useStore();
  const { fetchSiteContent, saveBridalContent } = AdminApi();
  const [bridalForm, setBridalForm] =
    useState<BridalContent>(emptyBridalForm());

  useEffect(() => {
    const normalizedImages = Array.isArray(siteContent?.bridal?.images)
      ? siteContent.bridal.images.slice(0, 4).map((image) => ({
          src: image?.src || '',
          alt: image?.alt || '',
        }))
      : [];

    while (normalizedImages.length < 4) {
      normalizedImages.push({ src: '', alt: '' });
    }

    setBridalForm({
      ...(siteContent?.bridal || emptyBridalForm()),
      images: normalizedImages,
    });
  }, [siteContent?.bridal]);

  const handleChange = (field: keyof BridalContent, value: string) => {
    setBridalForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (
    index: number,
    field: keyof BridalImageContent,
    value: string,
  ) => {
    setBridalForm((prev) => {
      const nextImages = [...(prev.images || [])];
      nextImages[index] = {
        ...(nextImages[index] || {}),
        [field]: value,
      };
      return { ...prev, images: nextImages };
    });
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      handleImageChange(index, 'src', result);
      handleImageChange(index, 'alt', file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const saved = await saveBridalContent(bridalForm);
    if (saved?.success) {
      const refreshed = await fetchSiteContent();
      if (refreshed?.success) {
        setSiteContent((prev) => ({
          ...prev,
          bridal: refreshed.bridal || emptyBridalForm(),
        }));
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gold-100 p-5 shadow-xs">
      <h4 className="font-semibold text-maroon-900 mb-4">
        Bridal Offer Section Content
      </h4>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Eyebrow
            </label>
            <input
              value={bridalForm.eyebrow || ''}
              onChange={(e) => handleChange('eyebrow', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="LIMITED TIME OFFER"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Badge Percent
            </label>
            <input
              value={bridalForm.badgePercent || ''}
              onChange={(e) => handleChange('badgePercent', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="30%"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Badge Text
            </label>
            <input
              value={bridalForm.badgeText || ''}
              onChange={(e) => handleChange('badgeText', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="OFF"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Coupon Code
            </label>
            <input
              value={bridalForm.couponCode || ''}
              onChange={(e) => handleChange('couponCode', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="BRIDE30"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Title Prefix
            </label>
            <input
              value={bridalForm.titlePrefix || ''}
              onChange={(e) => handleChange('titlePrefix', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="Flat"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Title Highlight
            </label>
            <input
              value={bridalForm.titleHighlight || ''}
              onChange={(e) => handleChange('titleHighlight', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="30% Off"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Title Suffix
            </label>
            <input
              value={bridalForm.titleSuffix || ''}
              onChange={(e) => handleChange('titleSuffix', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="on Bridal Collection"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Button Label
            </label>
            <input
              value={bridalForm.buttonLabel || ''}
              onChange={(e) => handleChange('buttonLabel', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="SHOP BRIDAL"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Button Target Category
            </label>
            <input
              value={bridalForm.buttonTarget || ''}
              onChange={(e) => handleChange('buttonTarget', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="Bridal Kanjivaram"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Coupon Label
            </label>
            <input
              value={bridalForm.couponLabel || ''}
              onChange={(e) => handleChange('couponLabel', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="USE CODE AT CHECKOUT"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Savings Text
            </label>
            <input
              value={bridalForm.savingsText || ''}
              onChange={(e) => handleChange('savingsText', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="Save up to ₹20,000"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Subtitle
            </label>
            <input
              value={bridalForm.subtitle || ''}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="॥ शुभ विवाह ॥"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
            Description
          </label>
          <textarea
            value={bridalForm.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gold-200 px-3 py-2"
            placeholder="Describe the bridal offer"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
            Gallery Images
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            {(bridalForm.images || []).slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gold-100 p-3 bg-gold-50/40"
              >
                <div className="text-sm font-semibold text-maroon-900 mb-2">
                  Image {index + 1}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload(index, e.target.files?.[0] || null)
                  }
                  className="w-full rounded-xl border border-gold-200 px-3 py-2 mb-2 bg-white"
                />
                {image?.src ? (
                  <div className="mb-2 overflow-hidden rounded-xl border border-gold-200 bg-white">
                    <img
                      src={image.src}
                      alt={image.alt || `Bridal image ${index + 1}`}
                      className="h-24 w-full object-cover"
                    />
                  </div>
                ) : null}
                <input
                  value={image?.alt || ''}
                  onChange={(e) =>
                    handleImageChange(index, 'alt', e.target.value)
                  }
                  className="w-full rounded-xl border border-gold-200 px-3 py-2"
                  placeholder="Alt text"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-maroon-900 px-4 py-2.5 text-sm font-semibold text-gold-100"
          >
            Save Bridal Content
          </button>
        </div>
      </form>
    </div>
  );
}
