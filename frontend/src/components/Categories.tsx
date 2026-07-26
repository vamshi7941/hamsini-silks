import { useNavigate } from 'react-router-dom';
import SectionHeader from './SectionHeader';
import { ChevronRightIcon } from './Icons';
import { useStore } from '../context/StoreContext';
import { slugify } from '@/utils/cn';

export default function Categories() {
  const navigate = useNavigate();
  const { setSelectedCategory, siteContent } = useStore();

  return (
    <section id="collections" className="py-12 sm:py-16 lg:py-20 bg-[#fdf8f1]">
      <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="OUR COLLECTIONS"
          title={siteContent?.heritage?.title || 'Heritage Weaves of India'}
          subtitle={siteContent?.heritage?.subtitle || ''}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {siteContent.categories
            .filter(
              (cat) => cat.type !== 'subcategory' && cat.isActive !== false,
            )
            .slice(0, 4)
            .map((cat, i) => (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  navigate(`/category/${slugify(cat.name)}`);
                }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl aspect-[3/4] bg-maroon-900 text-left block w-full cursor-pointer transition-transform duration-300 hover:-translate-y-1"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-900 via-maroon-900/40 to-transparent" />

                {/* decorative border */}
                <div className="absolute inset-2 sm:inset-3 border border-gold-300/30 rounded-xl sm:rounded-2xl pointer-events-none" />

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="font-display text-base sm:text-xl lg:text-2xl text-gold-100 mb-0.5 sm:mb-1 leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] sm:text-sm text-gold-100/80 mb-2 sm:mb-4 hidden sm:block">
                    {cat.description || 'Curated heirloom collection'}
                  </p>
                  <div className="inline-flex items-center gap-1 sm:gap-1.5 text-gold-300 text-[10px] sm:text-xs font-semibold tracking-wider group-hover:text-gold-100 transition-colors">
                    EXPLORE{' '}
                    <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}
