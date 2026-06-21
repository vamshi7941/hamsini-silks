import SectionHeader from "./SectionHeader";
import { InstagramIcon } from "./Icons";

const posts = [
  "/images/saree-kanjivaram.jpg",
  "/images/saree-banarasi.jpg",
  "/images/saree-pattu.jpg",
  "/images/saree-designer.jpg",
  "/images/model1.jpg",
  "/images/model2.jpg",
];

export default function Instagram() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#fdf8f1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="@HAMSINISILKS"
          title="Follow Our Journey"
          subtitle="Behind-the-loom moments, new arrivals and our brides — straight from our atelier to your feed."
        />

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {posts.map((p, i) => (
            <a
              key={i}
              href="https://www.instagram.com/hamsinisilks/?hl=en"
              target="_blank"
              rel="noreferrer"
              className="relative group overflow-hidden rounded-xl sm:rounded-2xl aspect-square"
            >
              <img src={p} alt={`Instagram ${i}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-br from-maroon-900/0 to-maroon-900/0 group-hover:from-maroon-900/70 group-hover:to-gold-700/40 transition-all flex items-center justify-center">
                <InstagramIcon className="h-5 w-5 sm:h-7 sm:w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <a
            href="https://www.instagram.com/hamsinisilks/?hl=en"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-maroon-800 font-semibold tracking-wider text-xs sm:text-sm hover:text-maroon-700"
          >
            <InstagramIcon /> FOLLOW @HAMSINISILKS
          </a>
        </div>
      </div>
    </section>
  );
}