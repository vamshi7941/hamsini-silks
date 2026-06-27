import { Link } from 'react-router-dom';
import { BagIcon, StarIcon } from './Icons';
import { useStore } from '../context/StoreContext';
import { CustomerApi } from '@/api/customer';
import { generateSlug } from '@/utils/slug';
import { Product } from '@/context/contextTypes';

export default function ProductCard({ product }: { product: Product }) {
  const { isInWishlist, user } = useStore();
  const { addToCart, toggleWishlist } = CustomerApi();
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const liked = isInWishlist(product._id);
  const outOfStock = product.inStock === false;
  const isAdmin = user.role === 'admin';
  const productUrl = `/product/${generateSlug(product._id, product.name)}`;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gold-100 hover:border-gold-400 hover:shadow-xl hover:shadow-maroon-900/10 transition-all duration-300 flex flex-col h-full shadow-xs">
      {/* Image section */}
      <Link
        to={productUrl}
        className="relative aspect-[3/4] overflow-hidden bg-maroon-50 cursor-pointer block"
      >
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            outOfStock ? 'opacity-65 grayscale-[30%]' : ''
          }`}
        />

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-maroon-950/60 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
            <span className="bg-maroon-900 text-gold-200 text-xs font-bold tracking-widest px-4 py-2 rounded-full uppercase border border-gold-300 shadow-2xl">
              Out of stock
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.badge && (
            <span className="bg-maroon-800 text-gold-100 text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow-lg">
              {product.badge.toUpperCase()}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-gold-500 text-white text-[9px] font-extrabold tracking-wider px-2.5 py-1 rounded-full shadow-lg">
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist toggle */}
        {!isAdmin && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product._id);
            }}
            className={`absolute top-3 right-3 h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10 cursor-pointer ${
              liked
                ? 'bg-maroon-900 text-gold-300 scale-100'
                : 'bg-white/90 backdrop-blur-sm text-maroon-500 hover:bg-white hover:text-maroon-900'
            }`}
            title={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              viewBox="0 0 24 24"
              fill={liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={liked ? 0 : 1.8}
              className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Quick add on hover */}
        {!outOfStock && !isAdmin && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
              className="w-full bg-maroon-800 hover:bg-maroon-900 text-gold-100 text-xs font-bold tracking-wider py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.97] cursor-pointer"
            >
              <BagIcon className="h-4 w-4 text-gold-400" />
              ADD TO BAG
            </button>
          </div>
        )}
      </Link>

      {/* Info section */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <Link
          to={productUrl}
          className="text-[9px] sm:text-[10px] tracking-[0.2em] text-gold-700 mb-1 uppercase font-bold cursor-pointer hover:underline"
        >
          {product.category}
        </Link>
        <p className="text-[9px] sm:text-[10px] text-maroon-700/70 mb-1.5 font-medium truncate">
          {product.subcategory}
        </p>
        <Link
          to={productUrl}
          className="font-display text-sm sm:text-base lg:text-lg text-maroon-900 mb-1.5 leading-tight font-bold cursor-pointer hover:text-maroon-700 transition-colors"
        >
          {product.name}
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${i < Math.round(product.rating) ? 'text-gold-500' : 'text-gold-200'}`}
            />
          ))}
          <span className="text-[10px] sm:text-xs text-maroon-700/70 ml-1 font-medium">
            {product.rating}
          </span>
        </div>

        {/* Size Spec */}
        {product.size && (
          <div className="text-[11px] text-maroon-800/80 mb-3 font-medium bg-gold-50/50 px-2.5 py-1 rounded-lg border border-gold-200/40 inline-block self-start">
            📏{' '}
            <span className="font-semibold text-maroon-900">
              {product.size}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-2.5 border-t border-gold-100 justify-between">
          <div>
            <span className="font-display text-base sm:text-lg lg:text-xl text-maroon-900 font-bold">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-maroon-400 line-through ml-2">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {outOfStock && (
            <span className="text-[10px] text-maroon-500 font-bold uppercase tracking-wider">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
