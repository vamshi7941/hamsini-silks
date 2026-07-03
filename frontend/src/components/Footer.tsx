import { Link } from 'react-router-dom';
import { InstagramIcon, FacebookIcon, WhatsAppIcon } from './Icons';
import { useStore } from '../context/StoreContext';
import { slugify } from '@/utils/cn';

export default function Footer() {
  const { showToast, siteContent } = useStore();
  const categories =
    siteContent.categories.filter((cat) => !cat.parentId) || [];

  const footerData = siteContent.footer;

  const cols = [
    {
      title: 'Shop',
      links: categories.map((cat) => ({
        label: cat.name,
        href: `/category/${slugify(cat.name)}`,
      })),
    },
    {
      title: 'Help',
      links: footerData.help.map((link) => ({
        label: link.label,
        href: `/help/${slugify(link.label)}`,
      })),
    },
    {
      title: 'About',
      links: footerData.about.map((link) => ({
        label: link.label,
        href: `/about/${slugify(link.label)}`,
      })),
    },
  ];

  return (
    <footer className="bg-[#1a0805] text-gold-100 pt-12 sm:pt-16 pb-6 sm:pb-8 relative overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-mandala opacity-10 pointer-events-none" />
      <div className="pattern-temple h-4 sm:h-5 absolute top-0 left-0 right-0 rotate-180 opacity-50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-8 sm:pb-12 border-b border-gold-700/30">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 group p-4 text-left cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="Hamsini Silks Logo"
                className="h-auto w-[130px] object-contain transition-transform duration-500 group-hover:scale-105 rounded"
              />
            </Link>
            <p className="text-gold-200/70 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 max-w-xs">
              Five decades of weaving stories into silk. From the temple looms
              of Kanchipuram, draping the women of India since 1972.
            </p>

            <div className="space-y-2 text-xs sm:text-sm text-gold-200/80">
              <div className="flex gap-2">
                <span className="text-gold-400">📍</span>
                <span>No. 42, Silk Road, T. Nagar, Chennai – 600017</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gold-400">✆</span>
                <span>+91 98400 12345</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gold-400">✉</span>
                <span>care@hamsinisilks.com</span>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 my-4 sm:mt-6">
              {[InstagramIcon, FacebookIcon, WhatsAppIcon].map((Icon, i) => (
                <button
                  key={i}
                  onClick={() =>
                    showToast('Opening official social channel feed...', 'info')
                  }
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-gold-700/40 flex items-center justify-center text-gold-300 hover:bg-gold-500 hover:text-maroon-900 hover:border-gold-500 transition-colors cursor-pointer"
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Link cols */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-8 grid grid-cols-3 gap-6 sm:gap-8">
            {cols.map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-sm sm:text-base lg:text-lg text-gold-300 mb-3 sm:mb-4 tracking-wide font-bold">
                  {col.title}
                </h4>
                <ul className="space-y-2 sm:space-y-2.5">
                  {col.links.map((link) => (
                    <li key={`${col.title}-${link.label}-${link.href}`}>
                      <Link
                        to={link.href}
                        className="text-xs sm:text-sm text-gold-200/70 hover:text-gold-300 transition-colors text-left block cursor-pointer"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Payment + bottom */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
          <div className="text-[10px] sm:text-sm text-gold-200/60 text-center sm:text-left">
            © 2026 Hamsini Silks Pvt. Ltd. · Option A Premium Atelier ·
            <button
              onClick={() =>
                showToast('Loading traditional privacy contract...', 'info')
              }
              className="hover:text-gold-300 ml-1 underline cursor-pointer"
            >
              Privacy
            </button>{' '}
            ·
            <button
              onClick={() => showToast('Loading service guidelines...', 'info')}
              className="hover:text-gold-300 ml-1 underline cursor-pointer"
            >
              Terms
            </button>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gold-200/60 flex-wrap justify-center">
            <span className="px-2 py-0.5 sm:py-1 rounded border border-gold-700/40 font-bold">
              VISA
            </span>
            <span className="px-2 py-0.5 sm:py-1 rounded border border-gold-700/40 font-bold">
              MC
            </span>
            <span className="px-2 py-0.5 sm:py-1 rounded border border-gold-700/40 font-bold">
              UPI
            </span>
            <span className="px-2 py-0.5 sm:py-1 rounded border border-gold-700/40 font-bold">
              Razorpay
            </span>
            <span className="px-2 py-0.5 sm:py-1 rounded border border-gold-700/40 font-bold">
              COD
            </span>
          </div>
        </div>

        <div className="text-center mt-6 sm:mt-8">
          <p className="font-serif italic text-gold-400/60 text-xs sm:text-sm">
            ॥ वस्त्रं तेजः ॥ &nbsp; A drape is a blessing.
          </p>
        </div>
      </div>
    </footer>
  );
}
