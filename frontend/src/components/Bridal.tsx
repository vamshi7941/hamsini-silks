import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from './Icons';
import { useStore } from '../context/StoreContext';
import { slugify } from '@/utils/cn';

export default function Bridal() {
  const navigate = useNavigate();
  const { setSelectedCategory, siteContent } = useStore();
  const bridal = siteContent?.bridal || {};

  const eyebrow = bridal.eyebrow || 'LIMITED TIME OFFER';
  const titlePrefix = bridal.titlePrefix || 'Flat';
  const titleHighlight = bridal.titleHighlight || '30% Off';
  const titleSuffix = bridal.titleSuffix || 'on Bridal Collection';
  const subtitle = bridal.subtitle || '॥ शुभ विवाह ॥';
  const description =
    bridal.description ||
    'Celebrate your most sacred day in heirloom Kanjivaram silks hand-woven over months by master craftsmen of Kanchipuram. Each saree is registered, certified, and gifted in a velvet trousseau box.';
  const badgePercent = bridal.badgePercent || '30%';
  const badgeText = bridal.badgeText || 'OFF';
  const couponCode = bridal.couponCode || 'BRIDE30';
  const couponLabel = bridal.couponLabel || 'USE CODE AT CHECKOUT';
  const savingsText = bridal.savingsText || 'Save up to ₹20,000';
  const buttonLabel = bridal.buttonLabel || 'SHOP BRIDAL';
  const buttonTarget = bridal.buttonTarget || 'Bridal Kanjivaram';
  const galleryImages =
    Array.isArray(bridal.images) && bridal.images.length
      ? bridal.images.slice(0, 4)
      : [
          { src: '/images/model1.jpg', alt: 'Bridal pink saree' },
          { src: '/images/saree-banarasi.jpg', alt: 'Banarasi saree' },
          { src: '/images/saree-kanjivaram.jpg', alt: 'Kanjivaram saree' },
          { src: '/images/model2.jpg', alt: 'Bridal mustard saree' },
        ];

  return (
    <section
      id="bridal"
      className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-maroon-900 via-maroon-800 to-[#3a0c08]"
    >
      <div className="absolute inset-0 bg-mandala opacity-20 sm:opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 pattern-temple h-4 sm:h-5 rotate-180 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-10">
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-gold-400/40 shadow-2xl aspect-[3/4]">
                  <img
                    src={galleryImages[0]?.src || '/images/model1.jpg'}
                    alt={galleryImages[0]?.alt || 'Bridal pink saree'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-gold-400/40 shadow-2xl aspect-square">
                  <img
                    src={galleryImages[1]?.src || '/images/saree-banarasi.jpg'}
                    alt={galleryImages[1]?.alt || 'Banarasi saree'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-gold-400/40 shadow-2xl aspect-square">
                  <img
                    src={
                      galleryImages[2]?.src || '/images/saree-kanjivaram.jpg'
                    }
                    alt={galleryImages[2]?.alt || 'Kanjivaram saree'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-gold-400/40 shadow-2xl aspect-[3/4]">
                  <img
                    src={galleryImages[3]?.src || '/images/model2.jpg'}
                    alt={galleryImages[3]?.alt || 'Bridal mustard saree'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Floating circular badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-2xl border-2 sm:border-4 border-maroon-900 animate-float pointer-events-none">
              <div className="text-center text-maroon-900">
                <div className="font-display text-2xl sm:text-3xl lg:text-4xl leading-none font-bold">
                  {badgePercent}
                </div>
                <div className="text-[8px] sm:text-[10px] tracking-widest mt-0.5 sm:mt-1 font-bold">
                  {badgeText}
                </div>
                <div className="text-[6px] sm:text-[8px] mt-0.5 tracking-wider hidden sm:block font-extrabold">
                  {couponCode}
                </div>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div>
            <div className="inline-flex items-center gap-3 text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-gold-300 mb-3 sm:mb-4">
              <span className="h-px w-6 sm:w-8 bg-current" />
              {eyebrow}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl 2xl:text-6xl text-gold-100 leading-[1.15] mb-4 sm:mb-6">
              {titlePrefix}{' '}
              <span className="gold-shimmer font-bold">{titleHighlight}</span>{' '}
              {titleSuffix}
            </h2>

            <p className="font-serif italic text-base sm:text-lg lg:text-xl text-gold-200/90 mb-2 sm:mb-3">
              {subtitle}
            </p>

            <p className="text-sm sm:text-base text-gold-100/80 leading-relaxed mb-6 sm:mb-8 max-w-lg">
              {description}
            </p>

            {/* Coupon block */}
            <div className="inline-flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 p-2 rounded-xl sm:rounded-2xl bg-gold-400/10 border border-dashed border-gold-400/60">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gold-500 text-maroon-900 font-bold tracking-[0.15em] sm:tracking-[0.2em] rounded-lg sm:rounded-xl text-xs sm:text-sm">
                {couponCode}
              </div>
              <div>
                <div className="text-[10px] sm:text-xs text-gold-300 font-medium">
                  {couponLabel}
                </div>
                <div className="text-xs sm:text-sm text-gold-100 font-semibold">
                  {savingsText}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setSelectedCategory(buttonTarget);
                  navigate(`/category/${slugify(buttonTarget)}`);
                }}
                className="group inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 text-maroon-900 font-semibold text-xs sm:text-sm tracking-wider shadow-lg shadow-black/40 hover:scale-[1.02] transition-all cursor-pointer"
              >
                {buttonLabel}
                <ChevronRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pattern-temple h-4 sm:h-5 pointer-events-none" />
    </section>
  );
}
