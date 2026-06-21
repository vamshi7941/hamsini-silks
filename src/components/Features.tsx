import { TruckIcon, ReturnIcon, ShieldIcon, CardIcon } from "./Icons";

const features = [
  { Icon: TruckIcon, title: "Free Shipping", desc: "On orders above ₹5,000" },
  { Icon: ReturnIcon, title: "Easy Returns", desc: "7-day return policy" },
  { Icon: ShieldIcon, title: "100% Authentic", desc: "Silk Mark certified" },
  { Icon: CardIcon, title: "Secure Payment", desc: "All cards & UPI" },
];

export default function Features() {
  return (
    <section className="py-8 sm:py-12 bg-gradient-to-b from-[#fdf8f1] to-maroon-50/40 border-y border-gold-200/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {features.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white/70 border border-gold-200/60 hover:border-gold-400 hover:shadow-lg hover:shadow-gold-200/40 transition-all"
            >
              <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-maroon-700 to-maroon-900 text-gold-300 flex items-center justify-center">
                <Icon />
              </div>
              <div>
                <h3 className="font-display text-xs sm:text-base text-maroon-900 mb-0.5">{title}</h3>
                <p className="text-[10px] sm:text-xs text-maroon-700/70 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}