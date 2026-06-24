import { useState } from "react";
import { useStore } from "../context/StoreContext";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { showToast } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showToast(`Welcome! ₹1,000 credit dispatched to ${email}`, "success");
      setEmail("");
    }
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#fdf8f1]">
      <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[20px] sm:rounded-[32px] lg:rounded-[40px] bg-gradient-to-br from-maroon-800 via-maroon-900 to-[#3a0c08] p-8 sm:p-10 lg:p-14 text-center">
        <div className="absolute inset-0 bg-mandala opacity-20 sm:opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-gold-500/20 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-gold-300 mb-2 sm:mb-3 font-bold">JOIN THE HAMSINI FAMILY</div>
          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-gold-100 mb-2 sm:mb-3 font-bold">
            Be the first to drape <em className="gold-shimmer not-italic">new arrivals</em>
          </h3>
          <p className="text-sm sm:text-base text-gold-100/70 mb-6 sm:mb-8 max-w-xl mx-auto">
            Get exclusive previews, weaver stories and a <strong className="text-gold-300">₹1,000 welcome credit</strong> on your first saree.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patron@domain.com"
              className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-white/10 border border-gold-400/40 text-gold-100 placeholder:text-gold-200/50 text-sm focus:outline-none focus:border-gold-300"
            />
            <button
              type="submit"
              className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 text-maroon-900 font-bold text-xs sm:text-sm tracking-wider hover:scale-[1.02] transition-transform whitespace-nowrap cursor-pointer shrink-0"
            >
              SUBSCRIBE
            </button>
          </form>

          <p className="text-[10px] sm:text-xs text-gold-200/50 mt-3 sm:mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
