import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../ProductCard';

const SORTS = [
  { label: 'Featured', value: 'default' },
  { label: 'Price: Low → High', value: 'price-low' },
  { label: 'Price: High → Low', value: 'price-high' },
  { label: 'Highest Rated', value: 'rating' },
];

const catMeta: Record<string, { emoji: string; desc: string }> = {
  All: { emoji: '🪷', desc: 'Complete Heritage Collection' },
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function ShopPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, setSelectedCategory, categories } = useStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  const selectedCategoryConfig = useMemo(() => {
    if (!slug || slug === 'all') return null;

    return (
      categories.find((cat) => {
        const slugMatch = cat.slug === slug;
        const nameMatch = slugify(cat.name) === slug;
        return slugMatch || nameMatch;
      }) ?? null
    );
  }, [categories, slug]);

  const categoryName = selectedCategoryConfig?.name ?? 'All';
  const isSubcategory = selectedCategoryConfig?.type === 'subcategory';

  useEffect(() => {
    setSelectedCategory(categoryName);
  }, [categoryName, setSelectedCategory]);

  const filtered = products
    .filter((p) => {
      const matchCat =
        categoryName === 'All'
          ? true
          : isSubcategory
            ? p.subcategory === categoryName
            : p.category === categoryName;
      const matchSrch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSrch;
    })
    .sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      return 0;
    });

  const meta = catMeta[categoryName] ?? {
    emoji: '🪷',
    desc: 'Complete Heritage Collection',
  };

  return (
    <div className="bg-[#fdf8f1] min-h-screen">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-maroon-900 to-maroon-800 text-white px-4 sm:px-8 py-8 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-gold-200 mb-1">
            {categoryName === 'All' ? 'Full Heritage Catalogue' : categoryName}
          </h1>
          <p className="text-sm text-gold-100/70">
            {meta.desc} · {filtered.length} pieces
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-3 border border-gold-100 shadow-xs flex flex-wrap gap-3 items-center mb-8">
          <div className="relative flex-1 min-w-[180px]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-maroon-400"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sarees…"
              className="w-full pl-9 pr-4 py-2 bg-maroon-50/40 rounded-xl text-sm text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-200 placeholder:text-maroon-400 border border-transparent focus:border-maroon-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-maroon-700/60 hidden sm:block">
              Sort:
            </span>
            {SORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  sort === s.value
                    ? 'bg-maroon-900 text-gold-200'
                    : 'bg-maroon-50 text-maroon-800 hover:bg-maroon-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-maroon-500 underline hover:text-maroon-700 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-bold text-maroon-900 mb-2">
              No sarees found
            </h3>
            <p className="text-sm text-maroon-700/60 mb-4">
              Try changing the category or clearing your search.
            </p>
            <button
              onClick={() => {
                setSearch('');
                navigate('/category/all');
              }}
              className="px-5 py-2.5 bg-maroon-900 text-gold-100 rounded-full text-sm font-bold cursor-pointer hover:bg-maroon-800 transition-colors"
            >
              Show all weaves
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
