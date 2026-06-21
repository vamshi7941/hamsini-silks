import { testimonials } from "../data";
import SectionHeader from "./SectionHeader";
import { StarIcon } from "./Icons";

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-maroon-50/40 to-[#fdf8f1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="WORDS OF LOVE"
          title="From Our Patrons"
          subtitle="Stories drape themselves in our silks. Here are a few that have come back to us."
        />

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-gold-200 shadow-sm hover:shadow-xl hover:border-gold-400 transition-all ${
                i === 1 ? "md:-translate-y-2 sm:md:-translate-y-4" : ""
              }`}
            >
              {/* Decorative quote */}
              <div className="absolute -top-3 sm:-top-4 left-6 sm:left-8 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-maroon-900 font-display text-xl sm:text-2xl flex items-center justify-center shadow-md">
                ❝
              </div>

              <div className="flex gap-0.5 mb-3 sm:mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <StarIcon key={j} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold-500" />
                ))}
              </div>

              <p className="font-serif text-sm sm:text-lg italic text-maroon-800 leading-relaxed mb-4 sm:mb-6">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-gold-100">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-maroon-700 to-maroon-900 text-gold-300 font-display text-base sm:text-xl flex items-center justify-center">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-display text-sm sm:text-base text-maroon-900">{t.name}</div>
                  <div className="text-[10px] sm:text-xs text-maroon-700/70 tracking-wider">{t.location.toUpperCase()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}