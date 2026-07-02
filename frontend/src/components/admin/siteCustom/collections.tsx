import { AdminApi, CategoryItem } from '@/api/admin';
import { useStore } from '@/context/StoreContext';
import { fileToBase64 } from '@/utils/image';
import { useEffect, useState } from 'react';

export default function Collections() {
  const { siteContent, setSiteContent, showToast } = useStore();
  const { updateCategory, fetchSiteContent, saveHeritageContent } = AdminApi();

  const [collections, setCollections] = useState<CategoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [heritageForm, setHeritageForm] = useState({
    title: siteContent.heritage?.title || '',
    subtitle: siteContent.heritage?.subtitle || '',
  });

  useEffect(() => {
    setCollections(
      (siteContent.categories || [])
        .filter((item) => item.type !== 'subcategory')
        .map((item) => ({
          ...item,
          isActive: item.isActive !== false,
          image: item.image || '',
        }))
        .sort((a, b) => Number(b.isActive) - Number(a.isActive)),
    );
  }, [siteContent.categories]);

  useEffect(() => {
    setHeritageForm({
      title: siteContent.heritage?.title || '',
      subtitle: siteContent.heritage?.subtitle || '',
    });
  }, [siteContent.heritage]);

  const activeCount = collections.filter((item) => item.isActive).length;

  const handleToggle = (id: string, checked: boolean) => {
    const currentItem = collections.find((item) => item._id === id);
    if (checked && activeCount >= 4 && currentItem?.isActive !== true) {
      showToast(
        'Maximum of 4 collections can be selected for the homepage.',
        'error',
      );
      return;
    }

    setCollections((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, isActive: checked } : item,
        )
        .sort((a, b) => Number(b.isActive) - Number(a.isActive)),
    );
  };

  const handleImageChange = async (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setCollections((prev) =>
      prev
        .map((item) => (item._id === id ? { ...item, image: base64 } : item))
        .sort((a, b) => Number(b.isActive) - Number(a.isActive)),
    );
    event.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const missingImageCollections = collections.filter(
        (item) => item.isActive !== false && !item.image?.trim(),
      );

      if (missingImageCollections.length > 0) {
        const names = missingImageCollections
          .map((item) => item.name)
          .join(', ');

        showToast(
          'Please upload images for the following collections: ' + names,
          'error',
        );
        setSaving(false);
        return;
      }

      await saveHeritageContent(heritageForm);

      const changedCollections = collections.filter((item) => {
        const previous = siteContent.categories.find(
          (entry) => entry._id === item._id,
        );
        return (
          (previous?.isActive ?? true) !== item.isActive ||
          (previous?.image || '') !== item.image
        );
      });

      await Promise.all(
        changedCollections.map((item) =>
          updateCategory(item._id, {
            isActive: item.isActive,
            image: item.image,
          }),
        ),
      );

      const refreshed = await fetchSiteContent();
      if (refreshed?.success) {
        setSiteContent((prev) => ({
          ...prev,
          categories: refreshed.categories || prev.categories,
        }));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gold-100 p-5 shadow-xs">
      <div className="mb-5">
        <h4 className="font-semibold text-maroon-900">Homepage Collections</h4>
        <p className="mt-1 text-sm text-maroon-700/70">
          Choose up to four collections for the homepage and add a custom image
          for each one.
        </p>
      </div>

      <div className="mb-5 space-y-3 rounded-xl border border-gold-200 bg-gold-50/60 p-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-maroon-900">
            Heritage title
          </label>
          <input
            value={heritageForm.title}
            onChange={(event) =>
              setHeritageForm((prev) => ({
                ...prev,
                title: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm text-maroon-800"
            placeholder="Heritage Weaves of India"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-maroon-900">
            Heritage subtitle
          </label>
          <textarea
            value={heritageForm.subtitle}
            onChange={(event) =>
              setHeritageForm((prev) => ({
                ...prev,
                subtitle: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm text-maroon-800"
            rows={3}
            placeholder="Add a short description for the heritage section"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-3 text-sm text-maroon-800">
        <p>
          Selected collections:{' '}
          <span className="font-semibold">{activeCount}</span>
          {activeCount >= 4 && (
            <span className="ml-2 text-xs uppercase tracking-wide text-maroon-700/70">
              Maximum reached
            </span>
          )}
        </p>
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto">
        {collections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gold-200 bg-gold-50/40 p-4 text-sm text-maroon-700/70">
            Create a parent collection first to manage it here.
          </div>
        ) : (
          collections.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-gold-100 p-4 shadow-[0_1px_0_rgba(120,61,33,0.06)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between h-full">
                <div className="flex flex-col gap-2 justify-between h-full w-[32vw] lg:w-[16vw]">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.isActive !== false}
                      onChange={(event) =>
                        handleToggle(item._id, event.target.checked)
                      }
                      className="mt-1 h-4 w-4 rounded border-gold-200 text-maroon-900 focus:ring-maroon-900"
                    />
                    <span>
                      <span className="block font-semibold text-maroon-900">
                        {item.name}
                      </span>
                      <span className="text-sm text-maroon-700/70">
                        {item.description || 'Collection display card'}
                      </span>
                    </span>
                  </label>

                  <div className="mt-4 rounded-xl border border-gold-100 bg-gold-50/40 p-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageChange(item._id, event)}
                      className="w-full rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm text-maroon-800"
                    />

                    {item.image ? (
                      <div className="mt-3 overflow-hidden rounded-xl border border-gold-100">
                        <img
                          src={item.image}
                          alt={`${item.name} preview`}
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-maroon-700/70">
                        No image selected yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-5 rounded-xl bg-maroon-900 px-4 py-2.5 text-sm font-semibold text-gold-100 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? 'Saving...' : 'Save homepage collections'}
      </button>
    </div>
  );
}
