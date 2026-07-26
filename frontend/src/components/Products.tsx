import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import SectionHeader from './SectionHeader';
import { useStore } from '../context/StoreContext';

export default function Products() {
  const { products, siteContent } = useStore();

  const filtered = products.filter((product) => {
    if (siteContent?.handpickedProducts?.productIds?.length > 0) {
      return siteContent?.handpickedProducts?.productIds?.includes(product._id);
    }
  });
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-maroon-50/30 to-[#fdf8f1] pattern-paisley">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="HANDPICKED FOR YOU"
          title={siteContent?.handpickedProducts?.title}
          subtitle={siteContent?.handpickedProducts?.subtitle}
        />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
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
          <Link
            to="/shop"
            className="inline-block px-8 sm:px-10 py-3 sm:py-3.5 rounded-full border-2 border-maroon-700 text-maroon-800 font-semibold text-xs sm:text-sm tracking-wider hover:bg-maroon-800 hover:text-gold-100 transition-all cursor-pointer"
          >
            VIEW ALL SAREES IN STORE
          </Link>
        </div>
      </div>
    </section>
  );
}
