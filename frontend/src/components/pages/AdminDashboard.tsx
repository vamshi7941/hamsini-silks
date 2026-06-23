import { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Order } from '../../context/StoreContext';
import type { Product } from '../../data';
import { Admin } from '@/api/admin';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icon = {
  dashboard: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-5 h-5"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  orders: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-5 h-5"
    >
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  ),
  catalogue: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-5 h-5"
    >
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  image: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-5 h-5"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  add: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className="w-5 h-5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  edit: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  save: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  close: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className="w-4 h-4"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  upload: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-8 h-8"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  ),
  check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className="w-4 h-4"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  logout: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-5 h-5"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  home: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-5 h-5"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  star: () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3.5 h-3.5 text-gold-400"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  bell: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-5 h-5"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  search: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  print: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  ),
  sun: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  contrast: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 010 20V2z" />
    </svg>
  ),
  rotate: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0115-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 01-15 6.7L3 16" />
    </svg>
  ),
  expand: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
    </svg>
  ),
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const statusMap: Record<string, string> = {
  Pending: 'status-pending',
  Processing: 'status-processing',
  Dispatched: 'status-dispatched',
  Delivered: 'status-delivered',
};
const statusIcon: Record<string, string> = {
  Pending: '⏳',
  Processing: '⚙️',
  Dispatched: '🚚',
  Delivered: '✅',
};

type AdminTab = 'overview' | 'orders' | 'catalogue' | 'media';

function StatCard({
  label,
  value,
  sub,
  color,
  emoji,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  emoji: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 text-white relative overflow-hidden ${color} shadow-lg`}
    >
      <div className="absolute -right-4 -top-4 text-6xl opacity-10 select-none">
        {emoji}
      </div>
      <div className="text-3xl font-bold font-display mb-1">{value}</div>
      <div className="text-sm font-semibold opacity-90">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
  );
}

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
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

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Product>) => void;
}) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [origPrice, setOrigPrice] = useState(product.originalPrice ?? '');
  const [badge, setBadge] = useState(product.badge ?? '');
  const [image, setImage] = useState(product.image);
  const [category, setCategory] = useState(product.category);
  const [inStock, setInStock] = useState(product.inStock !== false);
  const [size, setSize] = useState(product.size ?? '6.2m (incl. blouse)');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto admin-scroll">
        <div className="flex items-center justify-between p-6 border-b border-gold-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-maroon-900 flex items-center justify-center text-gold-300">
              <Icon.edit />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-maroon-900">
                Edit Saree
              </h2>
              <p className="text-xs text-maroon-700/70">
                Changes go live immediately
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-maroon-50 text-maroon-700 cursor-pointer"
          >
            <Icon.close />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
              📸 Image
            </label>
            <ImageUploadZone value={image} onChange={setImage} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Saree Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 font-medium transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 bg-white cursor-pointer transition-colors"
              >
                <option>Bridal Kanjivaram</option>
                <option>Banarasi Silk</option>
                <option>Soft Silk Pattu</option>
                <option>Designer Silk</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm font-bold text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Original Price{' '}
                <span className="text-maroon-400 font-normal">optional</span>
              </label>
              <input
                type="number"
                value={origPrice}
                onChange={(e) => setOrigPrice(e.target.value)}
                placeholder="For discount display"
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors placeholder:text-maroon-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Badge{' '}
                <span className="text-maroon-400 font-normal">optional</span>
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Bestseller, New, Limited"
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors placeholder:text-maroon-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Size / Length Specs
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 6.2m (incl. blouse)"
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors placeholder:text-maroon-300"
              />
            </div>
            <div className="sm:col-span-2 bg-maroon-50/50 p-3 rounded-xl border border-gold-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-maroon-900 block">
                  Stock Availability Status
                </span>
                <span className="text-[10px] text-maroon-700/80">
                  If disabled, product shows "Out of stock" overlay on website
                </span>
              </div>
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
          </div>
          <div className="bg-maroon-50 rounded-2xl p-4 flex items-center gap-4">
            <img
              src={image}
              alt=""
              className="w-14 h-18 object-cover rounded-xl border-2 border-gold-200 shrink-0"
            />
            <div>
              <span className="text-[10px] text-gold-700 font-bold uppercase block">
                {category}
              </span>
              <h4 className="font-display text-base font-bold text-maroon-900">
                {name || '—'}
              </h4>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-bold text-maroon-900">
                  ₹{Number(price).toLocaleString('en-IN')}
                </span>
                {origPrice && (
                  <span className="text-xs text-maroon-400 line-through">
                    ₹{Number(origPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                >
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                <span className="text-[10px] text-maroon-700 font-medium">
                  📏 {size}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gold-200 text-maroon-900 text-sm font-bold hover:bg-gold-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(product._id, {
                name,
                price: Number(price),
                originalPrice: origPrice ? Number(origPrice) : undefined,
                badge: badge || undefined,
                image,
                category,
                inStock,
                size,
              });
            }}
            className="flex-1 py-3 rounded-xl bg-maroon-900 text-gold-100 text-sm font-bold hover:bg-maroon-800 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Icon.save /> Save to Live Store
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Product Modal ────────────────────────────────────────────────────────────
function AddProductModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (p: Product) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bridal Kanjivaram');
  const [price, setPrice] = useState<number | ''>('');
  const [origPrice, setOrigPrice] = useState('');
  const [badge, setBadge] = useState('');
  const [image, setImage] = useState('');
  const [inStock, setInStock] = useState(true);
  const [size, setSize] = useState('6.2m (incl. blouse)');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      _id: `HSPID-${Date.now()}`,
      name,
      category,
      price: Number(price),
      originalPrice: origPrice ? Number(origPrice) : undefined,
      badge: badge || undefined,
      image,
      rating: 4.9, // hardcoded
      inStock,
      size,
    });
  };
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
                Add New Saree
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
        <form onSubmit={handleAdd} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
              📸 Image
            </label>
            <ImageUploadZone value={image} onChange={setImage} />
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 bg-white cursor-pointer"
              >
                <option>Bridal Kanjivaram</option>
                <option>Banarasi Silk</option>
                <option>Soft Silk Pattu</option>
                <option>Designer Silk</option>
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
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Size Specs
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 6.2m (incl. blouse)"
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors placeholder:text-maroon-300"
              />
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

// ── Delete Confirmation Modal ──────────────────────────────────────────────────
function DeleteConfirmModal({
  product,
  onConfirm,
  onCancel,
}: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <Icon.trash />
          </div>
          <div className="text-center">
            <h3 className="font-display text-lg font-bold text-maroon-900 mb-2">
              Delete Product?
            </h3>
            <p className="text-sm text-maroon-700/70 mb-4">
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{product.name}"</span>? This
              action cannot be undone.
            </p>
            <div className="bg-maroon-50 rounded-xl p-3 mb-4 flex items-center gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-16 object-cover rounded-lg"
              />
              <div className="text-left flex-1">
                <span className="text-[9px] font-bold text-gold-600 uppercase block">
                  {product.category}
                </span>
                <h4 className="text-sm font-bold text-maroon-900">
                  {product.name}
                </h4>
                <span className="text-xs font-bold text-maroon-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gold-200 text-maroon-900 text-sm font-bold hover:bg-gold-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Icon.trash /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Print Invoice Component ────────────────────────────────────────────────────
function PrintInvoice({ order }: { order: Order }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const itemsHtml = order.items
      .map(
        (i) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${i.product.price.toLocaleString('en-IN')}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${(i.product.price * i.quantity).toLocaleString('en-IN')}</td></tr>`,
      )
      .join('');

    printWindow.document.write(`
      <html><head><title>Hamsini Invoice #${order._id}</title>
      <style>
        body { font-family: 'Inter',Arial,sans-serif; background:#fff; color:#3d0e0a; max-width:700px; margin:40px auto; padding:30px; }
        .header { text-align:center; border-bottom:2px solid #d97706; padding-bottom:20px; margin-bottom:20px; }
        .header h1 { font-size:28px; margin:0; font-weight:700; }
        .header p { color:#8a3b0c; margin:2px 0 0; font-size:13px; }
        .details { display:flex; justify-content:space-between; margin-bottom:20px; font-size:13px; }
        .details .col { background:#fdf4f2; padding:12px 16px; border-radius:12px; flex:1; }
        .details .col:first-child { margin-right:12px; }
        .details strong { display:block; margin-bottom:4px; }
        table { width:100%; border-collapse:collapse; margin-bottom:20px; }
        th { background:#3d0e0a; color:#fdf9ed; padding:10px; text-align:left; font-size:12px; }
        td { font-size:13px; }
        .total { text-align:right; font-size:16px; font-weight:700; margin-top:20px; border-top:2px solid #d97706; padding-top:12px; }
        .footer { text-align:center; margin-top:30px; font-size:11px; color:#8a3b0c; border-top:1px solid #eee; padding-top:15px; }
        .status { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; }
        .badge { display:inline-block; background:#3d0e0a; color:#fdf9ed; padding:2px 10px; border-radius:20px; font-size:10px; }
        @media print { body { margin:0; padding:20px; } }
      </style></head><body>
        <div class="header">
          <h1>🪷 HAMSINI SILKS</h1>
          <p>◆ SILKS OF HERITAGE ◆</p>
          <p style="font-size:12px;color:#666">No.42, Silk Road, T.Nagar, Chennai – 600017</p>
        </div>
        <div class="details">
          <div class="col">
            <strong>Order #${order._id}</strong>
            ${order.orderedDate} · <span class="status" style="background:${order.status === 'Delivered' ? '#d1fae5' : order.status === 'Dispatched' ? '#dbeafe' : order.status === 'Processing' ? '#fef3c7' : '#fce6e3'};color:${order.status === 'Delivered' ? '#065f46' : order.status === 'Dispatched' ? '#1e40af' : order.status === 'Processing' ? '#92400e' : '#7e1c12'}">${statusIcon[order.status]} ${order.status}</span>
          </div>
          <div class="col">
            <strong>Shipping To</strong>
            ${order.name}<br>${order.email}<br>${order.phone}<br>${order.address}
          </div>
        </div>
        <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table>
        <div class="total">Total: ₹${order.total.toLocaleString('en-IN')}<br><span style="font-size:12px;font-weight:400">via ${order.paymentMethod}</span></div>
        <p style="font-size:12px">🛡️ Certified pure mulberry silk · Silk Mark registered</p>
        <div class="footer">॥ वस्त्रं तेजः ॥ &nbsp; A drape is a blessing.<br>© Hamsini Silks · Thank you for your patronage</div>
        <script>
          setTimeout(() => { window.print(); }, 300);
        </script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-maroon-900 text-gold-100 rounded-lg text-[10px] font-bold hover:bg-maroon-800 transition-colors cursor-pointer shrink-0 shadow-sm"
    >
      <Icon.print /> Print Invoice
    </button>
  );
}

// ── Order Row ──────────────────────────────────────────────────────────────────
function OrderRow({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, s: Order['status']) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statuses: Order['status'][] = [
    'Pending',
    'Processing',
    'Dispatched',
    'Delivered',
  ];

  return (
    <div
      className={`bg-white rounded-2xl border border-gold-100 shadow-xs overflow-hidden transition-all ${expanded ? 'shadow-md' : ''}`}
    >
      <div
        className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 cursor-pointer hover:bg-maroon-50/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-[110px]">
          <span className="font-display text-sm font-bold text-maroon-900 block">
            #{order._id}
          </span>
          <span className="text-[11px] text-maroon-700/60">{order.orderedDate}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-maroon-900 block truncate">
            {order.name}
          </span>
          <span className="text-[11px] text-maroon-700/70 truncate block">
            {order.email}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          {order.items.slice(0, 2).map((item, i) => (
            <img
              key={i}
              src={item.product.image}
              alt=""
              className="w-8 h-10 object-cover rounded-lg border border-gold-100"
            />
          ))}
          {order.items.length > 2 && (
            <span className="text-xs text-maroon-700 font-medium">
              +{order.items.length - 2}
            </span>
          )}
        </div>
        <div className="min-w-[90px] text-right hidden sm:block">
          <span className="font-display text-sm font-bold text-maroon-900">
            ₹{order.total.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-maroon-700/60 block">
            {order.paymentMethod}
          </span>
        </div>
        <div className="min-w-[110px]">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusMap[order.status]}`}
          >
            {statusIcon[order.status]} {order.status}
          </span>
        </div>
        {/* Print button always visible */}
        <PrintInvoice order={order} />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`w-4 h-4 text-maroon-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-gold-100 p-4 animate-fadeIn">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider">
                Delivery Details
              </h4>
              <div className="bg-maroon-50 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Name:
                  </span>
                  <span className="font-semibold text-maroon-900">
                    {order.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Email:
                  </span>
                  <span className="text-maroon-900">{order.email}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Phone:
                  </span>
                  <span className="text-maroon-900">{order.phone}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Address:
                  </span>
                  <span className="text-maroon-900 leading-relaxed">
                    {order.address}
                  </span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider pt-1">
                Items
              </h4>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gold-100"
                  >
                    <img
                      src={item.product.image}
                      alt=""
                      className="w-10 h-12 object-cover rounded-lg border border-gold-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-maroon-900 block truncate">
                        {item.product.name}
                      </span>
                      <span className="text-[10px] text-maroon-700/70">
                        {item.product.category} · Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-maroon-900 shrink-0">
                      ₹
                      {(item.product.price * item.quantity).toLocaleString(
                        'en-IN',
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
                Update Status
              </h4>
              <div className="space-y-2">
                {statuses.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onStatusChange(order._id, s)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2 ${
                      order.status === s
                        ? 'border-maroon-900 bg-maroon-900 text-white shadow-md'
                        : 'border-gold-100 hover:border-gold-300 text-maroon-900 bg-white'
                    }`}
                  >
                    <span className="text-base">{statusIcon[s]}</span>
                    <span>{s}</span>
                    {order.status === s && <Icon.check />}
                  </button>
                ))}
              </div>
              <div className="mt-4 bg-gold-50 rounded-xl p-3 border border-gold-200">
                <div className="text-xs font-bold text-maroon-900 mb-1">
                  Summary
                </div>
                <div className="flex justify-between text-xs text-maroon-800">
                  <span>Items:</span>
                  <span className="font-bold">
                    {order.items.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-maroon-800">
                  <span>Payment:</span>
                  <span className="font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-maroon-900 mt-2 pt-2 border-t border-gold-200">
                  <span>Total:</span>
                  <span>₹{order.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gold-100 flex justify-center">
                  <PrintInvoice order={order} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Image Editor Component (Media Library enhancement) ─────────────────────────
function ImageEditor({
  src,
  label,
  onClose,
}: {
  src: string;
  label: string;
  onClose: () => void;
}) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gold-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-maroon-800 to-maroon-900 flex items-center justify-center text-gold-300">
              <Icon.image />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-maroon-900">
                Image Editor · {label}
              </h2>
              <p className="text-[11px] text-maroon-700/60">
                Adjust brightness, contrast, rotation & zoom
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-maroon-50 text-maroon-700 cursor-pointer"
          >
            <Icon.close />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 grid lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="lg:col-span-2 bg-maroon-50 rounded-2xl flex items-center justify-center p-4 border border-gold-100 overflow-hidden min-h-[300px]">
            <div
              className="transition-all duration-200 ease-linear"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              }}
            >
              <img
                src={src}
                alt={label}
                className="max-h-[400px] w-auto rounded-xl shadow-lg border border-gold-200"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            {/* Brightness */}
            <div>
              <div className="flex justify-between text-xs font-bold text-maroon-900 mb-1">
                <span>
                  <Icon.sun /> Brightness
                </span>
                <span>{brightness}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="180"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-maroon-900 cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-xs font-bold text-maroon-900 mb-1">
                <span>
                  <Icon.contrast /> Contrast
                </span>
                <span>{contrast}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-maroon-900 cursor-pointer"
              />
            </div>

            {/* Rotation */}
            <div>
              <div className="flex justify-between text-xs font-bold text-maroon-900 mb-1">
                <span>
                  <Icon.rotate /> Rotation
                </span>
                <span>{rotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-maroon-900 cursor-pointer"
              />
            </div>

            {/* Zoom */}
            <div>
              <div className="flex justify-between text-xs font-bold text-maroon-900 mb-1">
                <span>
                  <Icon.expand /> Zoom
                </span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-maroon-900 cursor-pointer"
              />
            </div>

            {/* Preset filters */}
            <div>
              <p className="text-xs font-bold text-maroon-900 mb-2">
                Quick Presets
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Normal', b: 100, c: 100 },
                  { label: 'Warm Glow', b: 110, c: 115 },
                  { label: 'Silk Sheen', b: 105, c: 125 },
                  { label: 'Gold Tint', b: 95, c: 120 },
                  { label: 'Vintage', b: 85, c: 90 },
                ].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setBrightness(p.b);
                      setContrast(p.c);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-maroon-50 hover:bg-maroon-100 text-maroon-900 transition-colors border border-gold-100 cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset & Done */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setRotation(0);
                  setZoom(1);
                }}
                className="py-2.5 rounded-xl border-2 border-gold-200 text-maroon-900 text-xs font-bold hover:bg-gold-50 transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                onClick={onClose}
                className="py-2.5 rounded-xl bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1"
              >
                <Icon.check /> Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ADMIN DASHBOARD ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const {
    orders,
    updateOrderStatus,
    products,
    showToast,
    logout,
    navigateTo,
    user,
  } = useStore();
  const { addProduct, updateProduct, deleteProduct } = Admin();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    product: Product;
    isOpen: boolean;
  } | null>(null);

  // Image Editor state
  const [editingImage, setEditingImage] = useState<{
    src: string;
    label: string;
  } | null>(null);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const dispatchedOrders = orders.filter(
    (o) => o.status === 'Dispatched',
  ).length;

  const filteredOrders = orders.filter((o) => {
    const ms =
      o.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o._id.includes(orderSearch);
    const mf = orderFilter === 'All' || o.status === orderFilter;
    return ms && mf;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Icon.dashboard,
      badge: orders.length,
    },
    { id: 'orders', label: 'Orders', icon: Icon.orders, badge: orders.length },
    {
      id: 'catalogue',
      label: 'Catalogue',
      icon: Icon.catalogue,
      badge: products.length,
    },
    { id: 'media', label: 'Media', icon: Icon.image },
  ];

  return (
    <div className="min-h-screen bg-[#f5ede3] flex">
      {/* ── Sidebar ── */}
      <aside className="w-16 md:w-60 admin-sidebar flex flex-col shrink-0 sticky top-0 h-screen z-40">
        <div className="px-3 md:px-5 py-4 border-b border-white/10 flex justify-center md:justify-start">
          <div className="bg-white p-1.5 rounded-lg inline-flex max-w-full">
            <img
              src="https://storage.googleapis.com/a1aa/image/wM9tOQer8g4eQ1vVvL6P0m38d_UjL-R3Qj0rQpYw848.jpg"
              alt="Hamsini Admin"
              className="h-8 md:h-12 w-auto object-contain"
            />
          </div>
        </div>
        <nav className="flex-1 px-2 md:px-3 py-4 space-y-1 overflow-y-auto admin-scroll">
          {sidebarItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center gap-3 px-2.5 md:px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative group ${
                activeTab === item.id
                  ? 'bg-gold-500/20 text-gold-200 border border-gold-500/30'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon />
              <span className="hidden md:block">{item.label}</span>
              {item.badge !== undefined && (
                <span className="hidden md:flex ml-auto h-5 min-w-[20px] px-1 rounded-full bg-gold-500 text-maroon-900 text-[10px] font-bold items-center justify-center">
                  {item.badge}
                </span>
              )}
              <span className="md:hidden absolute left-full ml-2 bg-maroon-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg z-50">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
        <div className="px-2 md:px-3 pb-4 border-t border-white/10 pt-4 space-y-1">
          <button
            onClick={() => navigateTo('home')}
            className="w-full flex items-center gap-3 px-2.5 md:px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer group relative"
          >
            <Icon.home />
            <span className="hidden md:block">View Store</span>
            <span className="md:hidden absolute left-full ml-2 bg-maroon-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg z-50">
              View Store
            </span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-2.5 md:px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer group relative"
          >
            <Icon.logout />
            <span className="hidden md:block">Logout</span>
            <span className="md:hidden absolute left-full ml-2 bg-maroon-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg z-50">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-gold-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="font-display text-lg md:text-xl font-bold text-maroon-900 capitalize">
              {activeTab === 'overview'
                ? 'Dashboard'
                : activeTab === 'orders'
                  ? 'Orders & Invoicing'
                  : activeTab === 'catalogue'
                    ? 'Catalogue'
                    : 'Media Studio'}
            </h1>
            <p className="text-xs text-maroon-700/60 hidden sm:block mt-0.5">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('No new notifications')}
              className="p-2 rounded-full hover:bg-maroon-50 text-maroon-700 relative cursor-pointer"
            >
              <Icon.bell />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 bg-maroon-50 rounded-full pl-2 pr-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-maroon-900 text-gold-200 font-display font-bold text-xs flex items-center justify-center">
                {user.name?.[0] ?? 'A'}
              </div>
              <span className="text-xs font-semibold text-maroon-900 hidden sm:block max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto admin-scroll space-y-6 animate-fadeIn">
          {/* ═══════════════════ OVERVIEW ═══════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Revenue"
                  value={`₹${(totalRevenue / 1000).toFixed(0)}K`}
                  sub="All time"
                  color="bg-gradient-to-br from-maroon-800 to-maroon-900"
                  emoji="💰"
                />
                <StatCard
                  label="Orders"
                  value={orders.length}
                  sub={`${pendingOrders} pending`}
                  color="bg-gradient-to-br from-blue-700 to-blue-900"
                  emoji="📦"
                />
                <StatCard
                  label="Dispatched"
                  value={dispatchedOrders}
                  sub="In transit"
                  color="bg-gradient-to-br from-emerald-700 to-emerald-900"
                  emoji="🚚"
                />
                <StatCard
                  label="SKUs"
                  value={products.length}
                  sub="In catalogue"
                  color="bg-gradient-to-br from-gold-600 to-gold-700"
                  emoji="🪷"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 border border-gold-100 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display text-base font-bold text-maroon-900">
                      Recent Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-gold-600 font-bold hover:text-gold-700 cursor-pointer"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((o: Order, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-maroon-50/40 transition-colors"
                      >
                        <div className="h-9 w-9 rounded-full bg-maroon-100 text-maroon-800 font-bold text-sm flex items-center justify-center shrink-0">
                          {o.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-maroon-900 block truncate">
                            {o.name}
                          </span>
                          <span className="text-[11px] text-maroon-700/60">
                            #{o._id}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-maroon-900 block">
                            ₹{o.total.toLocaleString('en-IN')}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusMap[o.status]}`}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gold-100 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display text-base font-bold text-maroon-900">
                      Top Catalogue
                    </h3>
                    <button
                      onClick={() => setActiveTab('catalogue')}
                      className="text-xs text-gold-600 font-bold cursor-pointer"
                    >
                      Manage →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {products.slice(0, 4).map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-maroon-50/30 transition-colors"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-12 object-cover rounded-lg border border-gold-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-maroon-900 block truncate">
                            {p.name}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Icon.star />
                            <span className="text-[10px] text-maroon-700/70">
                              {p.rating}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-maroon-900 shrink-0">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-gold-500 text-white rounded-xl text-sm font-bold hover:bg-gold-400 transition-colors cursor-pointer shadow"
                >
                  ➕ Add New Saree
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors cursor-pointer shadow"
                >
                  📦 View Orders
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors cursor-pointer shadow"
                >
                  🖼️ Media Studio
                </button>
                <button
                  onClick={() => navigateTo('shop')}
                  className="px-6 py-3 bg-maroon-900 text-gold-200 rounded-xl text-sm font-bold hover:bg-maroon-800 transition-colors cursor-pointer shadow"
                >
                  🏪 View Store
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════ ORDERS ═══════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-4 border border-gold-100 shadow-xs flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-400">
                    <Icon.search />
                  </span>
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search name or order ID…"
                    className="w-full pl-9 pr-4 py-2 border border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'All',
                    'Pending',
                    'Processing',
                    'Dispatched',
                    'Delivered',
                  ].map((f, i) => (
                    <button
                      key={i}
                      onClick={() => setOrderFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${orderFilter === f ? 'bg-maroon-900 text-gold-200' : 'bg-maroon-50 text-maroon-900 hover:bg-maroon-100'}`}
                    >
                      {f}{' '}
                      {f !== 'All' &&
                        `(${orders.filter((o) => o.status === f).length})`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gold-100">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="font-semibold text-maroon-900">
                      No orders found
                    </p>
                    <p className="text-xs text-maroon-700/60 mt-1">
                      Try adjusting your search or filter
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((order, i) => (
                    <OrderRow
                      key={i}
                      order={order}
                      onStatusChange={updateOrderStatus}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════ CATALOGUE ═══════════════════ */}
          {activeTab === 'catalogue' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-4 border border-gold-100 shadow-xs flex flex-wrap gap-3 items-center justify-between">
                <div className="relative min-w-[220px] flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-400">
                    <Icon.search />
                  </span>
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search sarees…"
                    className="w-full pl-9 pr-4 py-2 border border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-gold-500 text-white rounded-xl text-sm font-bold hover:bg-gold-600 transition-colors cursor-pointer shadow-xs"
                >
                  <Icon.add /> Add New Saree
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((p, i) => {
                  const d = p.originalPrice
                    ? Math.round(
                        ((p.originalPrice - p.price) / p.originalPrice) * 100,
                      )
                    : 0;
                  const outOfStock = p.inStock === false;

                  return (
                    <div
                      key={i}
                      className={`bg-white rounded-2xl border border-gold-100 shadow-xs overflow-hidden hover:shadow-md hover:border-gold-300 transition-all group flex flex-col justify-between ${
                        outOfStock ? 'opacity-75' : ''
                      }`}
                    >
                      <div>
                        <div className="relative aspect-[3/4] overflow-hidden bg-maroon-50">
                          <img
                            src={p.image}
                            alt={p.name}
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                              outOfStock ? 'grayscale-[30%]' : ''
                            }`}
                          />

                          {outOfStock && (
                            <div className="absolute inset-0 bg-maroon-950/60 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                              <span className="bg-maroon-900 text-gold-200 text-xs font-bold tracking-widest px-3 py-1.5 rounded-full uppercase border border-gold-300">
                                Sold Out
                              </span>
                            </div>
                          )}

                          {p.badge && (
                            <span className="absolute top-2 left-2 text-[10px] font-bold bg-maroon-800 text-gold-100 px-2 py-0.5 rounded-full z-10">
                              {p.badge}
                            </span>
                          )}
                          {d > 0 && (
                            <span className="absolute top-2 right-2 text-[10px] font-bold bg-gold-500 text-white px-2 py-0.5 rounded-full z-10">
                              -{d}%
                            </span>
                          )}

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-white text-maroon-900 rounded-xl text-xs font-bold hover:bg-gold-50 cursor-pointer"
                            >
                              <Icon.edit /> Edit
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({ product: p, isOpen: true })
                              }
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 cursor-pointer"
                            >
                              <Icon.trash /> Delete
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <span className="text-[9px] font-bold text-gold-600 uppercase tracking-wider block">
                            {p.category}
                          </span>
                          <h4 className="font-display text-sm font-bold text-maroon-900 mt-0.5 truncate">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-1 my-1">
                            <Icon.star />
                            <span className="text-[10px] text-maroon-700/70">
                              {p.rating}
                            </span>
                          </div>

                          {p.size && (
                            <span className="text-[10px] text-maroon-800 font-medium block mt-1">
                              📏 {p.size}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 border-t border-gold-50 flex items-center justify-between mt-auto bg-gold-50/20">
                        <div>
                          <span className="font-bold text-maroon-900 text-sm">
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                          {p.originalPrice && (
                            <span className="text-xs text-maroon-400 line-through ml-1">
                              ₹{p.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 rounded-lg bg-maroon-50 hover:bg-maroon-100 text-maroon-700 cursor-pointer"
                        >
                          <Icon.edit />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════ MEDIA LIBRARY ═══════════════════ */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gold-100 shadow-xs">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-display text-xl font-bold text-maroon-900">
                      🖼️ Media Studio
                    </h3>
                    <p className="text-xs text-maroon-700/70 mt-1">
                      Browse, edit, and manage all website images. Click any
                      image to adjust brightness, contrast, rotation & zoom.
                    </p>
                  </div>
                  <span className="text-xs bg-maroon-50 px-3 py-1.5 rounded-lg font-bold text-maroon-800">
                    {products.length} products using these
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                  {[
                    {
                      label: 'Hero Bridal',
                      path: '/images/hero-bride.jpg',
                      usage: 'Hero Banner',
                      usedIn: products.filter(
                        (p) => p.image === '/images/hero-bride.jpg',
                      ).length,
                    },
                    {
                      label: 'Kanjivaram Silk',
                      path: '/images/saree-kanjivaram.jpg',
                      usage: 'Catalogue & Category',
                      usedIn: products.filter(
                        (p) => p.image === '/images/saree-kanjivaram.jpg',
                      ).length,
                    },
                    {
                      label: 'Banarasi Brocade',
                      path: '/images/saree-banarasi.jpg',
                      usage: 'Catalogue & Category',
                      usedIn: products.filter(
                        (p) => p.image === '/images/saree-banarasi.jpg',
                      ).length,
                    },
                    {
                      label: 'Soft Silk Pattu',
                      path: '/images/saree-pattu.jpg',
                      usage: 'Catalogue & Category',
                      usedIn: products.filter(
                        (p) => p.image === '/images/saree-pattu.jpg',
                      ).length,
                    },
                    {
                      label: 'Designer Silk',
                      path: '/images/saree-designer.jpg',
                      usage: 'Catalogue & Category',
                      usedIn: products.filter(
                        (p) => p.image === '/images/saree-designer.jpg',
                      ).length,
                    },
                    {
                      label: 'Model – Pink',
                      path: '/images/model1.jpg',
                      usage: 'Bridal Section',
                      usedIn: products.filter(
                        (p) => p.image === '/images/model1.jpg',
                      ).length,
                    },
                    {
                      label: 'Model – Mustard',
                      path: '/images/model2.jpg',
                      usage: 'Bridal Section',
                      usedIn: products.filter(
                        (p) => p.image === '/images/model2.jpg',
                      ).length,
                    },
                    {
                      label: 'Master Artisan',
                      path: '/images/artisan.jpg',
                      usage: 'Heritage Section',
                      usedIn: products.filter(
                        (p) => p.image === '/images/artisan.jpg',
                      ).length,
                    },
                  ].map((img, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-gold-100 shadow-xs overflow-hidden hover:shadow-md hover:border-gold-300 transition-all group"
                    >
                      <div className="relative aspect-square overflow-hidden bg-maroon-50">
                        <img
                          src={img.path}
                          alt={img.label}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Edit overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              setEditingImage({
                                src: img.path,
                                label: img.label,
                              })
                            }
                            className="px-3 py-2 bg-white text-maroon-900 rounded-xl text-xs font-bold hover:bg-gold-50 flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform hover:scale-105"
                          >
                            <Icon.edit /> Edit Image
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('catalogue');
                              showToast('Go to Catalogue to assign this image');
                            }}
                            className="px-3 py-2 bg-maroon-900 text-gold-100 rounded-xl text-xs font-bold hover:bg-maroon-800 flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform hover:scale-105"
                          >
                            <Icon.image /> Use in Product
                          </button>
                        </div>
                        {/* Quick quality indicators */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                          <span className="text-[8px] bg-white/90 backdrop-blur text-maroon-900 px-1.5 py-0.5 rounded font-bold">
                            {img.usage}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-maroon-900 truncate">
                          {img.label}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] bg-maroon-100 text-maroon-800 px-2 py-0.5 rounded-full font-medium">
                            {img.usedIn} product{img.usedIn !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() =>
                              setEditingImage({
                                src: img.path,
                                label: img.label,
                              })
                            }
                            className="text-[10px] text-gold-600 font-bold hover:text-gold-700 cursor-pointer flex items-center gap-1"
                          >
                            <Icon.edit /> Adjust
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload section */}
              <div className="bg-gradient-to-br from-maroon-900 to-maroon-800 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-mandala opacity-20 pointer-events-none" />
                <div className="relative">
                  <div className="text-4xl mb-3">📸</div>
                  <h3 className="font-display text-xl font-bold text-gold-200 mb-2">
                    Upload New Images
                  </h3>
                  <p className="text-sm text-gold-100/70 mb-4 max-w-lg mx-auto">
                    Open the{' '}
                    <strong className="text-gold-300">Catalogue</strong> tab,
                    click <strong className="text-gold-300">Edit</strong> on any
                    saree, and use the drag-and-drop upload zone. You can adjust
                    brightness/contrast in the editor.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('catalogue');
                      setShowAddModal(true);
                    }}
                    className="px-6 py-3 bg-gold-500 text-white rounded-full text-sm font-bold hover:bg-gold-400 transition-colors cursor-pointer shadow-lg"
                  >
                    Go to Catalogue & Upload
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={(id, up) => {
            updateProduct(id, up, () => setEditingProduct(null));
          }}
        />
      )}
      {deleteConfirm?.isOpen && deleteConfirm.product && (
        <DeleteConfirmModal
          product={deleteConfirm.product}
          onConfirm={() => {
            deleteProduct(deleteConfirm.product._id, () => {
              setDeleteConfirm(null);
            });
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdd={(p: Product) => {
            addProduct(p, () => setShowAddModal(false));
          }}
        />
      )}
      {editingImage && (
        <ImageEditor
          src={editingImage.src}
          label={editingImage.label}
          onClose={() => setEditingImage(null)}
        />
      )}
    </div>
  );
}
