import SectionHeader from "./SectionHeader";

export default function Heritage() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#fdf8f1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left image */}
          <div className="relative">
            <div className="rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] overflow-hidden shadow-2xl shadow-maroon-900/20 aspect-[4/5]">
              <img
                src="/images/artisan.jpg"
                alt="Master weaver"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 sm:-bottom-6 lg:-bottom-8 -right-4 sm:-right-8 hidden sm:block bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-gold-200 max-w-[200px] sm:max-w-[240px]">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gold-500/20 flex items-center justify-center text-maroon-700 font-display text-base sm:text-xl">
                  ✦
                </div>
                <div>
                  <div className="font-display text-sm sm:text-base text-maroon-900">Silk Mark</div>
                  <div className="text-[10px] sm:text-xs text-maroon-700/70">Certified Pure</div>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-maroon-700/80 leading-relaxed">
                Every Hamsini saree carries the Silk Mark of authenticity issued by the Government of India.
              </p>
            </div>
          </div>

          {/* Right content */}
          <div>
            <SectionHeader
              eyebrow="OUR HERITAGE"
              title="Five Decades of Craft"
              subtitle=""
            />
            <div className="space-y-4 sm:space-y-5 text-maroon-800/90 leading-relaxed">
              <p>
                Founded in <strong className="text-maroon-900">1972</strong> in the
                weaving town of Kanchipuram, Hamsini Silks began as a single
                loom workshop nurtured by three generations of weavers. Today, our
                ateliers span Tamil Nadu, Varanasi and Mysuru — yet every saree
                still passes through hands that have woven for a lifetime.
              </p>
              <p>
                We work with over <strong className="text-maroon-900">300 master weavers</strong>,
                preserving native motifs of the Chola dynasty, Mughal jaal patterns
                and the temple gopuram borders that define our craft. Each saree
                takes between <strong className="text-maroon-900">15 to 90 days</strong> to weave, and is
                blessed at our family temple before it travels to you.
              </p>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6">
                {[
                  { num: "1972", label: "Established" },
                  { num: "₹0", label: "Middlemen" },
                  { num: "100%", label: "Handloom" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-maroon-50 border border-gold-200/60">
                    <div className="font-display text-lg sm:text-2xl text-maroon-900">{s.num}</div>
                    <div className="text-[10px] sm:text-xs tracking-wider text-maroon-700 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <a
                href="#"
                className="inline-flex items-center gap-2 mt-3 sm:mt-4 text-maroon-800 font-semibold tracking-wider text-xs sm:text-sm border-b-2 border-gold-500 pb-1 hover:text-maroon-900"
              >
                READ OUR FULL STORY →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}