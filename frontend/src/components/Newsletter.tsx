import { useStore } from '@/context/StoreContext';
import { useState } from 'react';

export default function Newsletter() {
  const [phone, setPhone] = useState('');
  const { showToast } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Here you can add the logic to send the phone number to your backend or API

    // for now - it's under progreess
    showToast('This Integration is in Progress', 'info');
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#fdf8f1]">
      <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[20px] sm:rounded-[32px] lg:rounded-[40px] bg-gradient-to-br from-maroon-800 via-maroon-900 to-[#3a0c08] p-8 sm:p-10 lg:p-14 text-center">
        <div className="absolute inset-0 bg-mandala opacity-20 sm:opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-gold-500/20 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-gold-300 mb-2 sm:mb-3 font-bold">
            JOIN THE HAMSINI FAMILY
          </div>
          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-gold-100 mb-2 sm:mb-3 font-bold">
            Be the first to drape{' '}
            <em className="gold-shimmer not-italic">new arrivals</em>
          </h3>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-lg mt-6 mx-auto"
          >
            <input
              type="phone"
              required
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
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
            We respect your privacy. Your data is safe with us.
          </p>
        </div>
      </div>
    </section>
  );
}
