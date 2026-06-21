import { useState } from "react";
import { useStore } from "../../context/StoreContext";

export default function ProductDetailPage() {
  const { selectedProduct, addToCart, navigateTo, showToast, products, toggleWishlist, isInWishlist } = useStore();
  const [qty, setQty] = useState(1);
  const [activeSize, setActiveSize] = useState("6.2m (with blouse)");

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-[#fdf8f1] flex items-center justify-center">
        <div className="text-center py-20 px-4">
          <div className="text-5xl mb-4">🪷</div>
          <p className="text-maroon-800 font-serif italic text-lg mb-4">No saree selected.</p>
          <button
            onClick={() => navigateTo("shop")}
            className="px-6 py-3 rounded-full bg-maroon-900 text-gold-100 text-sm font-bold cursor-pointer hover:bg-maroon-800 transition-colors"
          >
            Return to Catalogue
          </button>
        </div>
      </div>
    );
  }

  const p = selectedProduct;
  const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
  const related = products.filter((r) => r.category === p.category && r.id !== p.id).slice(0, 4);
  const outOfStock = p.inStock === false;
  const liked = isInWishlist(p.id);

  const features = [
    { icon: "🏛️", text: "Pure mulberry silk certified by Silk Mark India" },
    { icon: "🧵", text: "Hand-woven by hereditary artisans of Kanchipuram" },
    { icon: "🚚", text: "Free insured doorstep delivery across India" },
    { icon: "↩️", text: "7-day premium exchange & return policy" },
  ];

  const sizeOptions = ["5.5m (Saree only)", "6.2m (with blouse)", "Custom Pallu Weave"];

  return (
    <div className="min-h-screen bg-[#fdf8f1]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gold-100 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-maroon-700">
          <button onClick={() => navigateTo("home")} className="hover:text-maroon-900 cursor-pointer">Home</button>
          <span>›</span>
          <button onClick={() => navigateTo("shop")} className="hover:text-maroon-900 cursor-pointer">Catalogue</button>
          <span>›</span>
          <span className="text-maroon-900 font-semibold truncate">{p.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          {/* ── Left: Image ── */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-maroon-50 border-2 border-gold-100 shadow-lg">
              <img
                src={p.image}
                alt={p.name}
                className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${
                  outOfStock ? "opacity-75 grayscale-[20%]" : ""
                }`}
              />

              {outOfStock && (
                <div className="absolute inset-0 bg-maroon-950/60 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
                  <span className="bg-maroon-900 text-gold-200 text-sm font-bold tracking-widest px-6 py-3 rounded-full uppercase border border-gold-300 shadow-2xl">
                    Out of stock
                  </span>
                </div>
              )}

              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-gold-500 text-white text-sm font-extrabold px-3 py-1 rounded-full shadow-md z-10">
                  {discount}% OFF
                </div>
              )}
              {p.badge && (
                <div className="absolute top-4 right-4 bg-maroon-800 text-gold-100 text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                  {p.badge}
                </div>
              )}
              <button
                onClick={() => toggleWishlist(p.id)}
                className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all z-10 cursor-pointer ${
                  liked ? "bg-maroon-900 text-gold-300" : "bg-white/90 backdrop-blur text-maroon-500 hover:text-maroon-900"
                }`}
                title="Wishlist"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={liked ? 0 : 1.8}
                  className="w-6 h-6"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="grid grid-cols-4 gap-2">
              {[p.image, "/images/artisan.jpg", "/images/model1.jpg", "/images/model2.jpg"].map((img, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer ${
                    i === 0 ? "border-maroon-800" : "border-gold-100 hover:border-gold-400"
                  } transition-colors`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Details ── */}
          <div className="flex flex-col">
            {/* Category & name */}
            <div className="mb-4">
              <span className="text-xs font-bold text-gold-600 tracking-widest uppercase">{p.category}</span>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-maroon-900 mt-1 leading-snug">
                {p.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    fill={i < Math.round(p.rating) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className={`w-4 h-4 ${i < Math.round(p.rating) ? "text-gold-500" : "text-gold-200"}`}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-maroon-800">{p.rating}</span>
              <span className="text-sm text-maroon-700/50">· Verified patron reviews</span>
            </div>

            {/* Price block */}
            <div className="bg-maroon-50 rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div>
                <span className="font-display text-3xl font-bold text-maroon-900">
                  ₹{p.price.toLocaleString("en-IN")}
                </span>
                {p.originalPrice && (
                  <span className="ml-3 text-sm text-maroon-400 line-through">
                    ₹{p.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                {discount > 0 && (
                  <span className="ml-2 text-sm text-emerald-700 font-bold">
                    You save ₹{(p.originalPrice! - p.price).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {outOfStock ? (
                <span className="text-xs bg-maroon-100 text-maroon-800 font-bold px-3 py-1.5 rounded-full">
                  Sold Out
                </span>
              ) : (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-full">
                  ✓ In Stock
                </span>
              )}
            </div>

            {/* ── Size / Length Selection ── */}
            <div className="mb-6 space-y-2">
              <label className="block text-xs font-bold text-maroon-900 uppercase tracking-wider">
                📏 Traditional Size / Cut Specs
              </label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setActiveSize(sz)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
                      activeSize === sz
                        ? "border-maroon-900 bg-maroon-900 text-gold-200 shadow-sm"
                        : "border-gold-200 bg-white text-maroon-900 hover:bg-gold-50"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-maroon-700/70 pt-1">
                Selected spec: <strong className="text-maroon-900">{activeSize}</strong>. Handloom unstitched blouse material matching the Korvai zari border is included.
              </p>
            </div>

            {/* Description */}
            <div className="text-sm text-maroon-800/90 leading-relaxed mb-6 space-y-2">
              <p>
                Crafted on ancestral pit-looms of Kanchipuram, each saree takes up to 45 days to complete. The intricate Korvai border integrates warp and weft in a single unbroken thread, representing the sacred bond of matrimony.
              </p>
              <p>
                Dry clean only. Comes in signature Hamsini velvet trousseau box with heritage certificate.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-gold-100">
                  <span className="text-base shrink-0">{f.icon}</span>
                  <span className="text-xs text-maroon-800 leading-snug font-medium">{f.text}</span>
                </div>
              ))}
            </div>

            {/* Quantity */}
            {!outOfStock && (
              <div className="flex items-center gap-4 mb-5">
                <span className="text-xs font-bold text-maroon-900 uppercase tracking-wider">Qty:</span>
                <div className="flex items-center border-2 border-gold-200 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center text-maroon-900 font-bold hover:bg-maroon-50 transition-colors cursor-pointer text-lg"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-maroon-900">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 flex items-center justify-center text-maroon-900 font-bold hover:bg-maroon-50 transition-colors cursor-pointer text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="space-y-3 mt-auto">
              {outOfStock ? (
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full py-4 rounded-2xl bg-maroon-300 text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 cursor-not-allowed uppercase"
                  >
                    Sold Out Currently
                  </button>
                  <button
                    onClick={() => showToast(`We will notify you when ${p.name} is back on looms!`)}
                    className="w-full py-3.5 rounded-2xl border-2 border-maroon-900 text-maroon-900 hover:bg-maroon-50 font-bold text-sm tracking-wider transition-colors cursor-pointer shadow-xs"
                  >
                    🔔 Notify Me When Restocked
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => addToCart(p, qty)}
                    className="w-full py-4 rounded-2xl bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                  >
                    🛍️ Add to Bag · {qty > 1 ? `${qty} pieces` : "1 piece"}
                  </button>
                  <button
                    onClick={() => {
                      addToCart(p, qty);
                      navigateTo("checkout");
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-white font-bold text-sm tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    ⚡ Buy Now — ₹{(p.price * qty).toLocaleString("en-IN")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-300" />
              <h2 className="font-display text-xl font-bold text-maroon-900 px-2">More from {p.category}</h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-300" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => {
                const d = r.originalPrice ? Math.round(((r.originalPrice - r.price) / r.originalPrice) * 100) : 0;
                return (
                  <button
                    key={r.id}
                    onClick={() => navigateTo("product-detail", r)}
                    className="text-left bg-white rounded-2xl border border-gold-100 shadow-xs hover:shadow-md hover:border-gold-300 overflow-hidden group transition-all cursor-pointer flex flex-col"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-maroon-50 relative w-full">
                      <img src={r.image} alt={r.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      {d > 0 && <span className="absolute top-2 right-2 bg-gold-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">-{d}%</span>}
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <p className="font-display text-sm font-bold text-maroon-900 truncate">{r.name}</p>
                      <p className="font-bold text-maroon-900 text-sm mt-1">₹{r.price.toLocaleString("en-IN")}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
