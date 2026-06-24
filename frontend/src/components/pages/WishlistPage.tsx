import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import ProductCard from "../ProductCard";

export default function WishlistPage() {
  const { products, wishlist } = useStore();
  let savedItems = products.filter((p) => wishlist.includes(p._id));

  return (
    <div className="min-h-screen bg-[#fdf8f1]">
      {/* Banner */}
      <div className="bg-gradient-to-r from-maroon-900 to-maroon-800 text-white px-4 sm:px-8 py-8 sm:py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto flex items-center gap-4">
          <div className="text-4xl">❤️</div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gold-200">Heirloom Wishlist</h1>
            <p className="text-sm text-gold-100/70">
              {wishlist.length === 0
                ? "Your wishlist is empty — start saving your favourite weaves!"
                : `${wishlist.length} ${wishlist.length === 1 ? "saree" : "sarees"} saved for you`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🪷</div>
            <h2 className="font-display text-xl font-bold text-maroon-900 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-maroon-700/70 mb-6 max-w-md mx-auto">
              Click the heart icon on any saree to save your favourite traditional weaves here.
            </p>
            <Link
              to="/shop"
              className="px-7 py-3 bg-maroon-900 text-gold-100 rounded-full font-bold text-sm hover:bg-maroon-800 transition-colors cursor-pointer shadow-md inline-block"
            >
              Explore Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {savedItems.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Quick tip */}
        <div className="mt-10 bg-white rounded-2xl border border-gold-200 p-5 text-center">
          <p className="text-xs text-maroon-700/80">
            💡 Items in your wishlist are saved locally. Share this list with family to pick your wedding trousseau!
          </p>
        </div>
      </div>
    </div>
  );
}
