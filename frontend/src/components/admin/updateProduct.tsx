import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Icon } from '../Icons';
import { fileToBase64 } from '../../utils/image';
import { Product } from '@/context/contextTypes';
import { normalizeProductSizes } from '@/utils/productInventory';

// ── Image upload zone (used in edit/add modals) ───────────────────────────────
function ImageUploadZone({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
      onChange(url);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const base64 = await fileToBase64(file);
    setPreview(base64);
    onChange(base64);
  };

  const handleGallerySelect = async (imagePath: string) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const base64 = await fileToBase64(blob as File);
      setPreview(base64);
      onChange(base64);
    } catch (error) {
      console.error('Error loading gallery image:', error);
    }
  };

  const gallery = [
    { label: 'Bridal Red Kanjivaram', path: '/images/saree-kanjivaram.jpg' },
    { label: 'Emerald Banarasi', path: '/images/saree-banarasi.jpg' },
    { label: 'Purple Soft Pattu', path: '/images/saree-pattu.jpg' },
    { label: 'Teal Designer Silk', path: '/images/saree-designer.jpg' },
    { label: 'Hero Bridal Portrait', path: '/images/hero-bride.jpg' },
    { label: 'Blush Pink Model', path: '/images/model1.jpg' },
    { label: 'Mustard Bridal Model', path: '/images/model2.jpg' },
    { label: 'Artisan Weaver', path: '/images/artisan.jpg' },
  ];

  return (
    <div className="space-y-4">
      <div
        className={`upload-zone rounded-2xl p-6 text-center cursor-pointer transition-all ${drag ? 'drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-36 w-full object-cover rounded-xl mx-auto"
            />
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold">
                Click to change
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="text-gold-500 flex justify-center mb-3">
              <Icon.upload />
            </div>
            <p className="text-sm font-bold text-maroon-900">
              Drop image here or click to browse
            </p>
            <p className="text-xs text-maroon-700/60 mt-1">PNG, JPG, WebP</p>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-maroon-900 uppercase tracking-wider mb-2">
          Gallery quick-pick
        </p>
        <div className="grid grid-cols-4 gap-2">
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleGallerySelect(img.path)}
              className={`relative rounded-xl overflow-hidden aspect-square group border-2 transition-all ${preview === img.path ? 'border-maroon-800' : 'border-transparent hover:border-gold-400'}`}
            >
              <img
                src={img.path}
                alt={img.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-end transition-all">
                <span className="text-[8px] text-white p-1 font-medium">
                  {img.label}
                </span>
              </div>
              {preview === img.path && (
                <div className="absolute top-1 right-1 h-4 w-4 bg-maroon-800 rounded-full flex items-center justify-center">
                  <Icon.check />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// the common component for both add and edit product modals
export default function UpdateProduct({
  action,
  product,
  onClose,
  onAdd,
  onSave,
}: {
  action: 'add' | 'edit';
  product?: Product;
  onClose: () => void;
  onAdd?: (p: Product) => void;
  onSave?: (id: string, updates: Partial<Product>) => void;
}) {
  const { siteContent } = useStore();
  const [productId, setProductId] = useState(product?._id ?? '');
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [origPrice, setOrigPrice] = useState(product?.originalPrice ?? '');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [description, setDescription] = useState(() => {
    const d = product?.description ?? '';
    return d.includes('<') ? d : d.replace(/\n/g, '<br/>');
  });
  const editorRef = useRef<HTMLDivElement | null>(null);

  const exec = (cmd: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false as any);
    // update state after command
    setDescription(editorRef.current.innerHTML);
  };

  // Set initial editor HTML only when the product changes (avoid re-applying innerHTML on every render)
  // This prevents React from overwriting the caret position while typing.
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = description;
    }
  }, [product]);

  const [badge, setBadge] = useState(product?.badge ?? '');
  const [image, setImage] = useState(product?.image ?? '');
  const [additionalImages, setAdditionalImages] = useState(
    product?.images ?? [],
  );

  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const categoryOptions = siteContent.categories.filter(
    (cat) => cat.type !== 'subcategory',
  );

  const [sizes, setSizes] = useState(
    normalizeProductSizes(product).length > 0
      ? normalizeProductSizes(product)
      : [{ name: '', units: 1 }],
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categoryOptions[0]?._id ?? '',
  );

  const subcategoryOptions = siteContent.categories.filter(
    (cat) => cat.type === 'subcategory' && cat.parentId === selectedCategoryId,
  );

  const selectedCategoryName =
    categoryOptions.find((cat) => cat._id === selectedCategoryId)?.name ??
    'Bridal Kanjivaram';
  const selectedSubcategoryName =
    subcategoryOptions.find((cat) => cat._id === subcategoryId)?.name ?? '';

  const fileListToBase64 = async (files: FileList | null) => {
    if (!files) return [] as string[];
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    );
    return Promise.all(readers);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd
      ? onAdd({
          _id: productId,
          name,
          category: selectedCategoryName,
          subcategory: selectedSubcategoryName || '',
          price: Number(price),
          originalPrice: origPrice ? Number(origPrice) : undefined,
          badge: badge || undefined,
          image,
          images: additionalImages.length > 0 ? additionalImages : [],
          rating: 4.9, // hardcoded
          inStock,
          sizes,
          description,
        })
      : null;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    product && onSave
      ? onSave(product._id, {
          name,
          price: Number(price),
          originalPrice: origPrice ? Number(origPrice) : undefined,
          badge: badge || undefined,
          image,
          images: additionalImages.length > 0 ? additionalImages : [],
          category: selectedCategoryName,
          subcategory: selectedSubcategoryName || undefined,
          inStock,
          sizes,
          description,
        })
      : null;
  };

  useEffect(() => {
    if (!selectedCategoryId && categoryOptions.length) {
      setSelectedCategoryId(categoryOptions[0]._id);
    }
    if (
      selectedCategoryId &&
      !categoryOptions.some((cat) => cat._id === selectedCategoryId)
    ) {
      setSelectedCategoryId(categoryOptions[0]?._id ?? '');
      setSubcategoryId('');
    }
  }, [categoryOptions, selectedCategoryId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto admin-scroll">
        <div className="flex items-center justify-between p-6 border-b border-gold-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gold-500 flex items-center justify-center text-white">
              <Icon.add />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-maroon-900">
                {action === 'add' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <p className="text-xs text-maroon-700/70">Publishes instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-maroon-50 text-maroon-700 cursor-pointer"
          >
            <Icon.close />
          </button>
        </div>
        <form
          onSubmit={action === 'add' ? handleAdd : handleSave}
          className="p-6 space-y-5"
        >
          <div>
            <label className="block text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
              Product Id
            </label>
            <input
              required
              type="text"
              disabled={action === 'edit'}
              value={productId ?? ''}
              onChange={(e: any) => setProductId(e.target.value)}
              className={`w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 bg-gray-50 ${action === 'edit' ? 'cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
              Main Image
            </label>
            <ImageUploadZone value={image} onChange={setImage} />
          </div>
          <div>
            <label className="block text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
              Additional Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full text-xs text-maroon-700 rounded-xl border-2 border-gold-200 p-3"
              onChange={async (e) => {
                const newImages = await fileListToBase64(e.target.files);
                setAdditionalImages((prev) => [...prev, ...newImages]);
                if (e.target) e.target.value = '';
              }}
            />
            {additionalImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {additionalImages.map((src, index) => (
                  <div
                    key={index}
                    className="relative rounded-xl overflow-hidden border border-gold-200"
                  >
                    <img
                      src={src}
                      alt={`Additional ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAdditionalImages((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-maroon-900 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Name *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mahalakshmi Kanjivaram"
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 bg-white cursor-pointer"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Subcategory{' '}
                <span className="text-maroon-400 font-normal">optional</span>
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 bg-white cursor-pointer"
              >
                <option value="">None</option>
                {subcategoryOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Price (₹) *
              </label>
              <input
                required
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm font-bold text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Original Price
              </label>
              <input
                type="number"
                value={origPrice}
                onChange={(e) => setOrigPrice(e.target.value)}
                placeholder="For discount"
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors placeholder:text-maroon-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors placeholder:text-maroon-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Size Inventory
              </label>
              <p className="text-[11px] text-maroon-700/70 mb-2">
                Add each size with available units. Customers will choose from
                these sizes.
              </p>
              <div className="space-y-2">
                {sizes.map((entry, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={entry.name}
                      onChange={(e) => {
                        const nextSizes = [...sizes];
                        nextSizes[index] = {
                          ...nextSizes[index],
                          name: e.target.value,
                        };
                        setSizes(nextSizes);
                      }}
                      placeholder="Size name"
                      className="flex-1 px-3 py-2 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
                    />
                    <input
                      type="number"
                      min="0"
                      value={entry.units}
                      onChange={(e) => {
                        const nextSizes = [...sizes];
                        nextSizes[index] = {
                          ...nextSizes[index],
                          units: Number(e.target.value) || 0,
                        };
                        setSizes(nextSizes);
                      }}
                      className="w-24 px-3 py-2 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSizes((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="px-3 py-2 rounded-xl border border-gold-200 text-maroon-700 hover:bg-gold-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setSizes((prev) => [...prev, { name: '', units: 1 }])
                }
                className="mt-3 text-xs font-bold text-maroon-900 hover:text-maroon-700"
              >
                + Add size
              </button>
            </div>
            <div className="sm:col-span-2 bg-maroon-50/50 p-3 rounded-xl border border-gold-200/60 flex items-center justify-between">
              <span className="text-xs font-bold text-maroon-900 block">
                Available in Stock immediately
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maroon-900"></div>
                <span className="ml-3 text-xs font-bold text-maroon-900 min-w-[70px]">
                  {inStock ? '✓ In Stock' : '✗ Sold Out'}
                </span>
              </label>
            </div>
            {/* description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Description
              </label>
              <div className="mb-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => exec('bold')}
                  title="Bold"
                  className="px-3 py-1 rounded-lg border border-gold-200 bg-white text-sm font-bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => exec('italic')}
                  title="Italic"
                  className="px-3 py-1 rounded-lg border border-gold-200 bg-white text-sm italic"
                >
                  I
                </button>
              </div>
              <div
                ref={editorRef}
                onInput={(e) =>
                  setDescription((e.target as HTMLDivElement).innerHTML)
                }
                contentEditable
                suppressContentEditableWarning
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors placeholder:text-maroon-300 min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gold-200 text-maroon-900 text-sm font-bold hover:bg-gold-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Icon.add /> Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
