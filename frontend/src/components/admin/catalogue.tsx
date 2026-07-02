import { useState } from 'react';
import { Icon } from '../Icons';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/context/contextTypes';

export default function Catalogue({
  setShowAddModal,
  setEditingProduct,
  setDeleteConfirm,
}: {
  setShowAddModal: (show: boolean) => void;
  setEditingProduct: (product: Product) => void;
  setDeleteConfirm: ({
    product,
    isOpen,
  }: {
    product: Product;
    isOpen: boolean;
  }) => void;
}) {
  const { products } = useStore();

  const [productSearch, setProductSearch] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
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
          <Icon.add /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((p, i) => {
          const d = p.originalPrice
            ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
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
                  <span className="text-[9px] font-medium text-maroon-700/70 uppercase tracking-wider block">
                    {p.subcategory}
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

                  {p.sizes?.length ? (
                    <span className="text-[10px] text-maroon-800 font-medium block mt-1">
                      📏{' '}
                      {p.sizes
                        .filter((entry: any) => entry.units > 0)
                        .map((entry) => entry.name)
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  ) : null}
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
  );
}
