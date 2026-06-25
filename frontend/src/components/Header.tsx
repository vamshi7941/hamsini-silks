import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SearchIcon,
  HeartIcon,
  BagIcon,
  UserIcon,
  MenuIcon,
  ChevronRightIcon,
} from './Icons';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {
    cartCount,
    user,
    setSelectedCategory,
    wishlistCount,
    themeOption,
    setThemeOption,
  } = useStore();

  const handleNav = (cat: string) => {
    setSelectedCategory(cat);
    navigate('/shop');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fdf8f1]/95 backdrop-blur-md border-b border-gold-200/60 shadow-xs">
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-800 text-gold-100 text-[10px] sm:text-xs">
        <div className="overflow-hidden whitespace-nowrap">
          <div className="inline-flex animate-marquee py-1.5 sm:py-2 gap-16">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="inline-flex gap-8 sm:gap-16 px-4 sm:px-8 items-center"
              >
                <span>✦ Free Shipping on orders above ₹5,000</span>
                <span>
                  ✦ Flat 30% off on Bridal — Use code{' '}
                  <strong className="text-gold-300">BRIDE30</strong>
                </span>
                <span>✦ Handloom Silk Mark Certified Pure</span>
                <span>
                  ✦ Hamsini Atelier Preview: Both Option A & B Available
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 p-4 text-left cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Hamsini Silks Logo"
              className="w-[100px] h-auto transition-transform duration-500 group-hover:scale-105 rounded block"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex justify-center gap-8 xl:gap-12 pb-2.5 pt-2.5 bg-gradient-to-r from-transparent via-maroon-50/20 to-transparent">
            {[
              { label: 'Home', to: '/', isCat: false },
              { label: 'All Weaves', cat: 'All', isCat: true },
              {
                label: 'Bridal Kanjivaram',
                cat: 'Bridal Kanjivaram',
                isCat: true,
              },
              { label: 'Banarasi Heritage', cat: 'Banarasi Silk', isCat: true },
              { label: 'Soft Silk Pattu', cat: 'Soft Silk Pattu', isCat: true },
              { label: 'Designer Atelier', cat: 'Designer Silk', isCat: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.isCat) {
                    handleNav(item.cat!);
                  } else {
                    navigate('/');
                  }
                }}
                className="text-xs whitespace-nowrap sm:text-sm tracking-widest uppercase font-medium text-maroon-900 hover:text-maroon-600 transition-colors relative group py-1 cursor-pointer"
              >
                {item.label}
                {item.label.includes('Bridal') && (
                  <span className="ml-1 text-[8px] bg-gold-500 text-white px-1.5 py-0.2 rounded-xs align-super font-bold">
                    30% OFF
                  </span>
                )}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-500 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Icons & Actions */}
          <div className="flex items-center px-4 gap-1.5 sm:gap-3">
            {user.loggedIn && user.role === 'customer' && (
              <Link
                to="/wishlist"
                className="p-1.5 sm:p-2 text-maroon-700 hover:bg-maroon-50 rounded-full relative transition-all sm:inline-flex cursor-pointer"
                title="Saved Favs"
              >
                <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-gold-500 text-white text-[8px] flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              to={user.loggedIn ? '/profile' : '/login'}
              className={`p-1.5 sm:p-2 rounded-full relative transition-colors cursor-pointer ${
                user.loggedIn
                  ? 'text-gold-600 bg-gold-50'
                  : 'text-maroon-700 hover:bg-maroon-50'
              }`}
              title={
                user.loggedIn ? `Logged in as ${user.name}` : 'Patron Login'
              }
            >
              <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              {user.loggedIn ? (
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-600" />
              ) : null}
            </Link>

            {user.loggedIn && user.role === 'customer' && (
              <Link
                to="/cart"
                className="p-1.5 sm:p-2 text-maroon-700 hover:bg-maroon-50 rounded-full relative transition-all cursor-pointer"
                title="Shopping Bag"
              >
                <BagIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-maroon-700 text-gold-200 text-[9px] sm:text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <button
              className="lg:hidden p-1.5 sm:p-2 text-maroon-700 hover:bg-maroon-50 rounded-full cursor-pointer"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drop-down menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gold-200/60 px-4 sm:px-6 py-2 space-y-1">
          <button
            onClick={() => {
              navigate('/');
              setOpen(false);
            }}
            className="w-full text-left py-2 text-maroon-900 font-semibold text-xs tracking-wider border-b border-gold-100 flex items-center justify-between uppercase cursor-pointer"
          >
            Home
            <ChevronRightIcon className="h-3.5 w-3.5 text-gold-500" />
          </button>
          <button
            onClick={() => handleNav('All')}
            className="w-full text-left py-2 text-maroon-900 font-semibold text-xs tracking-wider border-b border-gold-100 flex items-center justify-between uppercase cursor-pointer"
          >
            All Collections
            <ChevronRightIcon className="h-3.5 w-3.5 text-gold-500" />
          </button>
          <button
            onClick={() => handleNav('Bridal Kanjivaram')}
            className="w-full text-left py-2 text-maroon-800 text-xs tracking-wider border-b border-gold-100 flex items-center justify-between cursor-pointer"
          >
            Bridal Kanjivaram
            <ChevronRightIcon className="h-3.5 w-3.5 text-gold-400" />
          </button>
          <button
            onClick={() => handleNav('Banarasi Silk')}
            className="w-full text-left py-2 text-maroon-800 text-xs tracking-wider border-b border-gold-100 flex items-center justify-between cursor-pointer"
          >
            Banarasi Brocades
            <ChevronRightIcon className="h-3.5 w-3.5 text-gold-400" />
          </button>
          <button
            onClick={() => handleNav('Soft Silk Pattu')}
            className="w-full text-left py-2 text-maroon-800 text-xs tracking-wider border-b border-gold-100 flex items-center justify-between cursor-pointer"
          >
            Soft Silk Pattu
            <ChevronRightIcon className="h-3.5 w-3.5 text-gold-400" />
          </button>
          <button
            onClick={() => handleNav('Designer Silk')}
            className="w-full text-left py-2 text-maroon-800 text-xs tracking-wider border-b border-gold-100 flex items-center justify-between cursor-pointer"
          >
            Designer Atelier
            <ChevronRightIcon className="h-3.5 w-3.5 text-gold-400" />
          </button>
          {user.loggedIn && user.role === 'admin' && (
            <button
              onClick={() => {
                navigate('/admin');
                setOpen(false);
              }}
              className="w-full text-left py-2 text-maroon-900 font-bold text-xs tracking-wider bg-gold-50/50 px-2 rounded mt-1 flex items-center justify-between cursor-pointer"
            >
              ⚙️ Atelier Admin Control
              <ChevronRightIcon className="h-3.5 w-3.5 text-maroon-900" />
            </button>
          )}
        </div>
      )}
    </header>
  );
}
