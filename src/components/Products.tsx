import { useState } from "react";
import ProductCard from "./ProductCard";
import SectionHeader from "./SectionHeader";
import { useStore } from "../context/StoreContext";

const tabs = ["All", "Kanjivaram", "Banarasi", "Pattu", "Designer"];

export default function Products() {
  const [active, setActive] = useState("All");
  const { products, navigateTo } = useStore();

  const categoryMap: Record<string, string> = {
    All: "All",
    Kanjivaram: "Bridal Kanjivaram",
    Banarasi: "Banarasi Silk",
    Pattu: "Soft Silk Pattu",
    Designer: "Designer Silk",
  };

  const filtered = active === "All"
    ? products.slice(0, 8) // Show top 8 bestsellers on Home
    : products.filter((p) => p.category === categoryMap[active]);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-maroon-50/30 to-[#fdf8f1] pattern-paisley">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="HANDPICKED FOR YOU"
          title="Curated Bestsellers"
          subtitle="Each piece carries the soul of an artisan and the beauty of centuries-old motifs. Store updates reflect instantly below."
        />

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all ${
                active === tab
                  ? "bg-maroon-800 text-gold-100 shadow-md"
                  : "bg-white/80 text-maroon-700 border border-gold-200 hover:border-maroon-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-maroon-700/60 font-serif italic text-lg">
              No products found in this category.
            </p>
          </div>
        )}

        <div className="text-center mt-10 sm:mt-12">
          <button
            onClick={() => navigateTo("shop")}
            className="inline-block px-8 sm:px-10 py-3 sm:py-3.5 rounded-full border-2 border-maroon-700 text-maroon-800 font-semibold text-xs sm:text-sm tracking-wider hover:bg-maroon-800 hover:text-gold-100 transition-all cursor-pointer"
          >
            VIEW ALL SAREES IN STORE
          </button>
        </div>
      </div>
    </section>
  );
}
