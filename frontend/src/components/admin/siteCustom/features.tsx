import { AdminApi, FeatureItem } from '@/api/admin';
import { useStore } from '@/context/StoreContext';
import { useEffect, useState } from 'react';

const emptyFeature = (): FeatureItem => ({
  title: '',
  description: '',
  icon: {
    name: '',
    svg: '',
  },
});

const ICON_SET: { name: string; svg: string }[] = [
  {
    name: 'Truck',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" stroke-linejoin="round"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  },
  {
    name: 'Shield',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    name: 'Star',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  },
  {
    name: 'Card',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4" stroke-linecap="round"/></svg>',
  },
];

export default function Features() {
  const { siteContent, setSiteContent } = useStore();
  const { fetchSiteContent, saveFeatures } = AdminApi();

  const [featuresForm, setFeaturesForm] = useState<FeatureItem[]>([]);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [customIconMode, setCustomIconMode] = useState(false);

  const activeIndex = activeFeatureIndex ?? 0;
  const activeFeature = featuresForm[activeIndex] || emptyFeature();

  useEffect(() => {
    if (
      Array.isArray(siteContent?.features) &&
      siteContent.features.length > 0
    ) {
      setFeaturesForm(
        siteContent.features.map((feature) => ({
          _id: feature._id,
          title: feature.title || '',
          description: feature.description || '',
          icon: feature.icon || { name: '', svg: '' },
        })),
      );
      setActiveFeatureIndex(null);
      setIsAdding(false);
      return;
    }

    setFeaturesForm([]);
    setActiveFeatureIndex(null);
  }, [siteContent?.features]);

  const handleFeatureChange = (
    field: keyof FeatureItem,
    value: string,
    index?: number,
  ) => {
    const targetIndex = index ?? activeFeatureIndex;
    if (targetIndex === null) return;

    const updatedFeatures = [...featuresForm];
    updatedFeatures[targetIndex] = {
      ...updatedFeatures[targetIndex],
      [field]: value,
    } as FeatureItem;
    setFeaturesForm(updatedFeatures);
  };

  const handleIconSelect = (
    index: number | null,
    icon: { name: string; svg: string },
  ) => {
    const targetIndex = index ?? activeFeatureIndex;
    if (targetIndex === null) return;
    const updated = [...featuresForm];
    updated[targetIndex] = {
      ...updated[targetIndex],
      icon,
    } as FeatureItem;
    setFeaturesForm(updated);
  };

  const handleAddFeature = () => {
    const nextFeatures = [...featuresForm, emptyFeature()];
    setFeaturesForm(nextFeatures);
    setActiveFeatureIndex(nextFeatures.length - 1);
    setIsAdding(true);
    setCustomIconMode(false);
  };

  const handleEditFeature = (index: number) => {
    setActiveFeatureIndex(index);
    setIsAdding(true);
    const iconName = featuresForm[index]?.icon?.name || '';
    const customIconSaved = Boolean(
      iconName && !ICON_SET.some((item) => item.name === iconName),
    );
    setCustomIconMode(customIconSaved);
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = featuresForm.filter(
      (_, featureIndex) => featureIndex !== index,
    );

    setFeaturesForm(updatedFeatures);
    if (isAdding && activeFeatureIndex === index) {
      setIsAdding(false);
      setActiveFeatureIndex(null);
    } else {
      setActiveFeatureIndex(
        updatedFeatures.length > 0 ? updatedFeatures.length - 1 : null,
      );
    }
  };

  const handleFeaturesSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedFeatures = featuresForm
      .filter(
        (feature) =>
          feature.title?.trim() ||
          feature.description?.trim() ||
          feature.icon?.name?.trim() ||
          feature.icon?.svg?.trim(),
      )
      .map((feature) => ({
        _id: feature._id,
        title: feature.title?.trim() || '',
        description: feature.description?.trim() || '',
        icon: feature.icon || { name: '', svg: '' },
      }));

    const saved = await saveFeatures(sanitizedFeatures);
    if (saved?.success) {
      const refreshed = await fetchSiteContent();
      if (refreshed?.success) {
        setSiteContent((prev) => ({
          ...prev,
          features: refreshed.features || [],
          categories: refreshed.categories || prev.categories,
          heroContent: refreshed.heroContent || prev.heroContent,
        }));
        setIsAdding(false);
        setActiveFeatureIndex(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gold-100 p-5 shadow-xs">
      <h4 className="font-semibold text-maroon-900 mb-4">
        Features Section Content
      </h4>

      <form onSubmit={handleFeaturesSave} className="space-y-5">
        <div className="rounded-2xl border border-gold-100 bg-gold-50/50 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h5 className="text-sm font-semibold text-maroon-900">
              Current Features
            </h5>
            <button
              type="button"
              onClick={handleAddFeature}
              className="rounded-xl bg-maroon-900 px-3.5 py-2 text-sm font-semibold text-gold-100"
            >
              Add Feature
            </button>
          </div>

          <div className="space-y-2">
            {featuresForm.map((feature, index) => (
              <div
                key={feature._id || `${feature.title}-${index}`}
                className="flex items-center justify-between rounded-xl border border-gold-200 bg-white px-3 py-2.5"
              >
                <div>
                  <div className="text-xs text-maroon-700/70 line-clamp-1">
                    {feature.icon?.name?.trim() || 'No icon yet'}
                  </div>
                  <div className="font-semibold text-maroon-900">
                    {feature.title?.trim() || `Feature ${index + 1}`}
                  </div>
                  <div className="text-xs text-maroon-700/70 line-clamp-1">
                    {feature.description?.trim() || 'No description yet'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditFeature(index)}
                    className="rounded-lg border border-gold-200 px-2.5 py-1.5 text-xs font-semibold text-maroon-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isAdding && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Icon
              </label>
              <div className="flex flex-col gap-2 items-center">
                <select
                  value={
                    customIconMode ? 'custom' : activeFeature.icon?.name || ''
                  }
                  required
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setCustomIconMode(true);
                      handleIconSelect(activeFeatureIndex, {
                        name: '',
                        svg: '',
                      });
                      return;
                    }
                    setCustomIconMode(false);
                    const sel = ICON_SET.find((i) => i.name === e.target.value);
                    if (sel) handleIconSelect(activeFeatureIndex, sel);
                  }}
                  className="w-full rounded-xl border border-gold-200 px-3 py-2"
                >
                  <option value="">Select an icon</option>
                  {ICON_SET.map((ic) => (
                    <option key={ic.name} value={ic.name}>
                      {ic.name}
                    </option>
                  ))}
                  <option value="custom">Custom (paste SVG below)</option>
                </select>
                {customIconMode && (
                  <div className="w-full space-y-2 mt-2">
                    <span className="text-xs text-maroon-700/70">Icon Name:</span>
                    <input
                      value={activeFeature.icon?.name || ''}
                      onChange={(e) =>
                        handleIconSelect(activeFeatureIndex, {
                          name: e.target.value,
                          svg: activeFeature.icon?.svg || '',
                        })
                      }
                      placeholder="Enter custom icon name"
                      className="w-full rounded-xl border border-gold-200 px-3 py-2"
                    />
                    <textarea
                      value={activeFeature.icon?.svg || ''}
                      onChange={(e) =>
                        handleIconSelect(activeFeatureIndex, {
                          name: activeFeature.icon?.name || '',
                          svg: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Paste SVG code here"
                      className="w-full rounded-xl border border-gold-200 px-3 py-2"
                    />
                  </div>
                )}
                {!customIconMode && (
                  <span className="text-xs text-maroon-700/70">Preview:</span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-center rounded-xl border border-gold-200 bg-white p-2">
                <div className="w-10 h-10 flex items-center justify-center">
                  <div
                    className="text-maroon-900 text-lg"
                    dangerouslySetInnerHTML={{
                      __html:
                        featuresForm[activeFeatureIndex ?? 0]?.icon?.svg || '',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                  Title
                </label>
                <input
                  value={featuresForm[activeFeatureIndex ?? 0]?.title || ''}
                  onChange={(e) => handleFeatureChange('title', e.target.value)}
                  required
                  className="w-full rounded-xl border border-gold-200 px-3 py-2"
                  placeholder="e.g. Premium Quality"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                  Description
                </label>
                <input
                  value={
                    featuresForm[activeFeatureIndex ?? 0]?.description || ''
                  }
                  onChange={(e) =>
                    handleFeatureChange('description', e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-gold-200 px-3 py-2"
                  placeholder="Describe the feature"
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="submit"
                className="rounded-xl bg-maroon-900 px-4 py-2.5 text-sm font-semibold text-gold-100"
              >
                Save Features
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
