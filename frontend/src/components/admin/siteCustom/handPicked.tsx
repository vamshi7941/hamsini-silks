import { AdminApi } from '@/api/admin';
import { useStore } from '@/context/StoreContext';
import { useEffect, useRef, useState } from 'react';

type HandpickedForm = {
  title: string;
  subtitle: string;
  productIds: string[];
};

export default function HandPicked() {
  const { products, siteContent, setSiteContent } = useStore();
  const { fetchSiteContent, saveHandpickedProducts } = AdminApi();
  const [form, setForm] = useState<HandpickedForm>({
    title: '',
    subtitle: '',
    productIds: [],
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const persisted = siteContent?.handpickedProducts;
    setForm({
      title: persisted?.title || '',
      subtitle: persisted?.subtitle || '',
      productIds: Array.isArray(persisted?.productIds)
        ? persisted.productIds
        : [],
    });
  }, [siteContent?.handpickedProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const toggleProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      productIds: form.productIds,
    };

    const saved = await saveHandpickedProducts(payload);
    if (saved?.success) {
      const refreshed = await fetchSiteContent();
      if (refreshed?.success) {
        setSiteContent((prev) => ({
          ...prev,
          handpickedProducts: refreshed.handpickedProducts || {
            title: '',
            subtitle: '',
            productIds: [],
          },
          categories: refreshed.categories || prev.categories,
          heroContent: refreshed.heroContent || prev.heroContent,
          features: refreshed.features || prev.features,
          ribbon: refreshed.ribbon || prev.ribbon,
          heritage: refreshed.heritage || prev.heritage,
        }));
      }
    }

    setIsSaving(false);
  };

  const selectedProducts = products.filter((product) =>
    form.productIds.includes(product._id),
  );

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    return [product.name, product.category, product.subcategory]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(query));
  });

  return (
    <div className="bg-white rounded-2xl border border-gold-100 p-5 shadow-xs">
      <h4 className="font-semibold text-maroon-900 mb-4">
        Handpicked Section Content
      </h4>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
            Section title
          </label>
          <input
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            className="w-full rounded-xl border border-gold-200 px-3 py-2 text-sm text-maroon-900 focus:border-maroon-700 focus:outline-none"
            placeholder="Handpicked for You"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
            Section subtitle
          </label>
          <input
            value={form.subtitle}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, subtitle: event.target.value }))
            }
            className="w-full rounded-xl border border-gold-200 px-3 py-2 text-sm text-maroon-900 focus:border-maroon-700 focus:outline-none"
            placeholder="Discover our curated selection"
          />
        </div>

        <div className="relative">
          <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
            Select products
          </label>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl border border-gold-200 bg-gold-50/60 px-3 py-2.5 text-left text-sm text-maroon-800"
          >
            <span>
              {form.productIds.length > 0
                ? `${form.productIds.length} product${form.productIds.length > 1 ? 's' : ''} selected`
                : 'Choose products'}
            </span>
            <span className="text-xs uppercase tracking-wide text-maroon-600">
              {isDropdownOpen ? 'Hide' : 'Show'}
            </span>
          </button>

          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute z-10 mt-2 max-h-72 w-full overflow-hidden rounded-xl border border-gold-200 bg-white shadow-lg"
            >
              <div className="border-b border-gold-100 p-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-gold-200 px-3 py-2 text-sm text-maroon-900 focus:border-maroon-700 focus:outline-none"
                />
              </div>

              <div className="max-h-56 overflow-auto p-2">
                {products.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-maroon-700/70">
                    No products are available yet.
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-maroon-700/70">
                    No products match your search.
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const checked = form.productIds.includes(product._id);
                    return (
                      <label
                        key={product._id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-gold-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProduct(product._id)}
                          className="h-4 w-4 rounded border-gold-300 text-maroon-900 focus:ring-maroon-700"
                        />
                        <span className="text-sm text-maroon-800">
                          {product.name}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((product) => (
              <span
                key={product._id}
                className="rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-xs font-medium text-maroon-800"
              >
                {product.name}
              </span>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-maroon-900 px-4 py-2 text-sm font-semibold text-gold-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? 'Saving...' : 'Save Handpicked Selection'}
        </button>
      </form>
    </div>
  );
}
