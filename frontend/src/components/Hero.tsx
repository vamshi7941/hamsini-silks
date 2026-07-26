import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from './Icons';
import { useStore } from '../context/StoreContext';
import { generateSlug } from '@/utils/slug';

export default function Hero() {
  const navigate = useNavigate();
  const { setSelectedCategory, siteContent } = useStore();
  const { products } = useStore();

  const [featuredProduct, setFeaturedProduct] = useState<any | null>(null);
  const heroContent = siteContent?.heroContent || {};

  useEffect(() => {
    const id = (heroContent as any).featuredProductId;
    if (id) {
      const p = products.find((x) => x._id === id) || null;
      setFeaturedProduct(p);
    } else {
      setFeaturedProduct(null);
    }
  }, [heroContent, products]);

  const eyebrow = heroContent.eyebrow || 'WEDDING COLLECTION 2026';
  const titleLine1 = heroContent.titleLine1 || 'Woven in';
  const titleLine2 = heroContent.titleLine2 || 'Tradition';
  const subtitle = heroContent.subtitle || 'परम्परा • अनुग्रह • वैभव';
  const description =
    heroContent.description ||
    'Heirloom Kanjivaram, royal Banarasi and the softest Pattu silks — hand-woven by master artisans across generations. Drape a story that lasts forever.';
  const primaryButtonLabel = heroContent.primaryButtonLabel || 'SHOP BRIDAL';
  const primaryButtonTarget =
    heroContent.primaryButtonTarget || 'Bridal Kanjivaram';
  const secondaryButtonLabel =
    heroContent.secondaryButtonLabel || 'EXPLORE COLLECTIONS';
  const secondaryButtonTarget = heroContent.secondaryButtonTarget || 'All';
  const featuredImage = heroContent.image || '/images/hero-bride.jpg';
  const featuredTitle =
    featuredProduct?.name ||
    heroContent.featuredTitle ||
    'Mayura Bridal Kanjivaram';
  const featuredPrice = featuredProduct
    ? `₹${featuredProduct.price.toLocaleString('en-IN')}/-`
    : heroContent.featuredPrice || '₹54,200';
  const badgeText = heroContent.badgeText || '30% OFF';

  return (
    <section
      className={`relative overflow-hidden transition-all duration-500 ${'bg-gradient-to-br from-maroon-900 via-maroon-800 to-maroon-900 text-gold-100'}`}
    >
      {/* Decorative mandala backdrop */}
      <div className="absolute inset-0 bg-mandala opacity-30 sm:opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-maroon-500/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] mb-4 sm:mb-6 ${'bg-gold-500/15 border-gold-400/40 text-gold-200'}`}
            >
              <span>✦</span> {eyebrow} <span>✦</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl text-gold-100 leading-[1.1] mb-2 font-bold">
              {titleLine1}
            </h1>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl gold-shimmer leading-[1.1] mb-4 sm:mb-6 italic font-bold">
              {titleLine2}
            </h1>

            <p className="font-serif text-base sm:text-xl text-gold-200/90 italic mb-2 sm:mb-3">
              {subtitle}
            </p>

            <p className="text-sm sm:text-base lg:text-lg text-gold-100/80 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed px-4 lg:px-0">
              {description}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-10">
              <button
                onClick={() => {
                  setSelectedCategory(primaryButtonTarget);
                  navigate(
                    '/category/' +
                      primaryButtonTarget
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, ''),
                  );
                }}
                className={`group inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full font-semibold text-xs sm:text-sm tracking-wider shadow-lg hover:scale-[1.02] transition-all cursor-pointer ${'bg-gradient-to-r from-gold-500 to-gold-400 text-maroon-900 shadow-gold-900/40'}`}
              >
                {primaryButtonLabel}
                <ChevronRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(secondaryButtonTarget);
                  navigate(
                    '/category/' +
                      secondaryButtonTarget
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, ''),
                  );
                }}
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full border border-gold-400/60 text-gold-100 font-semibold text-xs sm:text-sm tracking-wider hover:bg-gold-500/10 transition-all cursor-pointer"
              >
                {secondaryButtonLabel}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto lg:mx-0 pt-6 sm:pt-8 border-t border-gold-400/20">
              <div>
                <div className="font-display text-xl sm:text-2xl md:text-3xl text-gold-300 font-bold">
                  50+
                </div>
                <div className="text-[10px] sm:text-xs text-gold-100/70 tracking-wider mt-1">
                  YEARS
                </div>
              </div>
              <div>
                <div className="font-display text-xl sm:text-2xl md:text-3xl text-gold-300 font-bold">
                  2000+
                </div>
                <div className="text-[10px] sm:text-xs text-gold-100/70 tracking-wider mt-1">
                  WEAVES
                </div>
              </div>
              <div>
                <div className="font-display text-xl sm:text-2xl md:text-3xl text-gold-300 font-bold">
                  300+
                </div>
                <div className="text-[10px] sm:text-xs text-gold-100/70 tracking-wider mt-1">
                  WEAVERS
                </div>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-none">
              {/* Decorative frame */}
              <div className="absolute -inset-3 sm:-inset-4 rounded-[28px] sm:rounded-[40px] border-2 border-gold-400/40 pointer-events-none" />
              <div className="absolute -inset-6 sm:-inset-8 rounded-[36px] sm:rounded-[48px] border border-gold-400/20 pointer-events-none" />

              {/* Corner ornaments */}
              {[
                '-top-1.5 -left-1.5',
                '-top-1.5 -right-1.5',
                '-bottom-1.5 -left-1.5',
                '-bottom-1.5 -right-1.5',
              ].map((pos) => (
                <div
                  key={pos}
                  className={`absolute ${pos} h-5 w-5 sm:h-6 sm:w-6 text-gold-400`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
                  </svg>
                </div>
              ))}

              <div
                className="relative rounded-[24px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-black/50 aspect-[4/5] hover:cursor-pointer"
                onClick={() => {
                  navigate(
                    '/product/' +
                      (generateSlug(
                        featuredProduct?._id,
                        featuredProduct?.name,
                      ) || ''),
                  );
                }}
              >
                <img
                  src={featuredImage}
                  alt="Hero showcase"
                  className="w-full h-full object-cover"
                />
                {/* Floating tag */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 backdrop-blur-md bg-maroon-900/60 border border-gold-400/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[8px] sm:text-[10px] tracking-[0.3em] text-gold-300 mb-0.5 sm:mb-1 font-semibold">
                      FEATURED
                    </div>
                    <div className="font-display text-sm sm:text-lg text-gold-100 font-medium">
                      {featuredTitle}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] sm:text-[10px] text-gold-300/80">
                      FROM
                    </div>
                    <div className="font-display text-sm sm:text-xl text-gold-100 font-bold">
                      {featuredPrice}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 lg:-right-6 animate-float">
                <div
                  className={`h-16 w-16 sm:h-24 sm:w-24 rounded-full flex items-center justify-center shadow-2xl ${'bg-gradient-to-br from-gold-400 to-gold-600 text-maroon-900'}`}
                >
                  <div className="text-center">
                    <div className="font-display text-lg sm:text-2xl leading-none font-bold">
                      {badgeText.split(' ')[0]}
                    </div>
                    <div className="text-[8px] sm:text-[9px] tracking-widest sm:mt-1 font-extrabold">
                      {badgeText.split(' ').slice(1).join(' ') || 'OFF'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom temple-arch divider */}
      <div className="pattern-temple h-4 sm:h-5 bg-[#fdf8f1]" />
    </section>
  );
}
