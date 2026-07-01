import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
import {
  HeartIcon,
  BagIcon,
  UserIcon,
  MenuIcon,
  ChevronRightIcon,
} from './Icons';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mobileOpenCategory, setMobileOpenCategory] = useState<string | null>(
    null,
  );
  const headerRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { cartCount, user, setSelectedCategory, wishlistCount, siteContent } =
    useStore();

  const ribbonMessages = (siteContent?.ribbon || []).filter(Boolean);
  const marqueeRibbonMessages = ribbonMessages.length
    ? Array.from({ length: 4 }, (_, groupIndex) =>
        ribbonMessages.map((message, index) => ({
          id: `${groupIndex}-${index}-${message}`,
          text: message,
        })),
      ).flat()
    : [];

  const handleNav = (name: string, slug: string = 'all') => {
    setSelectedCategory(name);
    navigate(`/category/${slug}`);
    setOpen(false);
  };

  const closeMobileMenu = () => {
    setOpen(false);
    setMobileOpenCategory(null);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setMobileOpenCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-[#fdf8f1]/95 backdrop-blur-md border-b border-gold-200/60 shadow-xs"
    >
      {/* Top announcement bar */}
      {ribbonMessages.length > 0 && (
        <div className="bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-800 text-gold-100 text-[10px] sm:text-xs">
          <div className="overflow-hidden whitespace-nowrap">
            <div className="inline-flex animate-marquee py-1.5 sm:py-2 gap-8 sm:gap-16 min-w-full">
              <div className="inline-flex items-center gap-8 sm:gap-16 px-4 sm:px-8">
                {marqueeRibbonMessages.map((item) => (
                  <span key={item.id} className="whitespace-nowrap">
                    ✦ {item.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main nav */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center lg:justify-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
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
              {
                label: 'All Collections',
                name: 'All',
                slug: 'all',
                isCat: true,
              },
              ...siteContent?.categories
                ?.filter((cat) => cat.type !== 'subcategory')
                ?.map((cat) => ({
                  label: cat.name,
                  name: cat.name,
                  slug: slugify(cat.slug || cat.name),
                  isCat: true,
                  subcategories: siteContent.categories?.filter(
                    (item) =>
                      item.type === 'subcategory' && item.parentId === cat._id,
                  ),
                })),
            ].map((item: any) => {
              const hasSubmenu = Boolean(item.subcategories?.length);

              return (
                <div key={item.label} className="relative group">
                  <button
                    onClick={() => {
                      if (item.isCat) {
                        handleNav(item.name, item.slug);
                      } else {
                        navigate('/');
                      }
                    }}
                    className="text-[clamp(0.65rem,0.95vw,0.95rem)] whitespace-nowrap tracking-widest uppercase font-medium text-maroon-900 hover:text-maroon-600 transition-colors relative py-1 cursor-pointer"
                  >
                    {item.label}
                  </button>

                  {hasSubmenu && (
                    <div className="absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2 rounded-2xl border border-gold-200 bg-white/95 p-2 shadow-xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                      {item.subcategories?.map((subcat: any) => (
                        <button
                          key={subcat._id}
                          onClick={() =>
                            handleNav(
                              subcat.name,
                              slugify(subcat.slug || subcat.name),
                            )
                          }
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-maroon-800 hover:bg-gold-50 hover:text-maroon-700 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {subcat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Icons & Actions */}
          <div className="flex items-center px-4 gap-1.5 sm:gap-3">
            {user.loggedIn && user.role === 'customer' && (
              <Link
                to="/wishlist"
                onClick={closeMobileMenu}
                className="p-1.5 sm:p-2 text-maroon-700 hover:bg-maroon-50 rounded-full relative transition-all sm:inline-flex cursor-pointer"
                title="Saved Favs"
              >
                <HeartIcon className="h-[clamp(1rem,1.2vw,1.3rem)] w-[clamp(1rem,1.2vw,1.3rem)]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-gold-500 text-white text-[8px] flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              to={user.loggedIn ? '/profile' : '/login'}
              onClick={closeMobileMenu}
              className={`p-1.5 sm:p-2 rounded-full relative transition-colors cursor-pointer ${
                user.loggedIn
                  ? 'text-gold-600 bg-gold-50'
                  : 'text-maroon-700 hover:bg-maroon-50'
              }`}
              title={
                user.loggedIn ? `Logged in as ${user.name}` : 'Patron Login'
              }
            >
              <UserIcon className="h-[clamp(1rem,1.2vw,1.3rem)] w-[clamp(1rem,1.2vw,1.3rem)]" />
              {user.loggedIn ? (
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-600" />
              ) : null}
            </Link>

            {user.loggedIn && user.role === 'customer' && (
              <Link
                to="/cart"
                onClick={closeMobileMenu}
                className="p-1.5 sm:p-2 text-maroon-700 hover:bg-maroon-50 rounded-full relative transition-all cursor-pointer"
                title="Shopping Bag"
              >
                <BagIcon className="h-[clamp(1rem,1.2vw,1.3rem)] w-[clamp(1rem,1.2vw,1.3rem)]" />
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
              <MenuIcon className="h-[clamp(1.1rem,1.4vw,1.5rem)] w-[clamp(1.1rem,1.4vw,1.5rem)]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drop-down menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gold-200/60 px-4 sm:px-6 py-2 space-y-1">
          <button
            onClick={() => handleNav('All', 'all')}
            className="w-full text-left py-2 text-maroon-900 font-semibold text-xs tracking-wider border-b border-gold-100 flex items-center justify-between uppercase cursor-pointer"
          >
            All Collections
            <ChevronRightIcon className="h-3.5 w-3.5 text-gold-500" />
          </button>
          {(siteContent?.categories ?? [])
            .filter((cat: any) => cat.type !== 'subcategory')
            .map((cat: any) => {
              const subcategories = (siteContent?.categories ?? []).filter(
                (item: any) =>
                  item.type === 'subcategory' && item.parentId === cat._id,
              );
              const isOpen = mobileOpenCategory === cat._id;

              return (
                <div key={cat._id} className="border-b border-gold-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        handleNav(cat.name, slugify(cat.slug || cat.name))
                      }
                      className="flex-1 text-left py-2 text-maroon-800 text-xs tracking-wider cursor-pointer"
                    >
                      {cat.name}
                    </button>
                    {subcategories.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileOpenCategory(isOpen ? null : cat._id);
                        }}
                        className="p-2 text-gold-500"
                        aria-label={`Toggle ${cat.name} subcategories`}
                      >
                        <ChevronRightIcon
                          className={`h-3.5 w-3.5 transition-transform ${
                            isOpen ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {isOpen && subcategories.length > 0 && (
                    <div className="pb-2 pl-3 space-y-1">
                      {subcategories.map((subcat: any) => (
                        <button
                          key={subcat._id}
                          onClick={() =>
                            handleNav(
                              subcat.name,
                              slugify(subcat.slug || subcat.name),
                            )
                          }
                          className="block w-full rounded-md px-2 py-1.5 text-left text-[11px] text-maroon-700 hover:bg-gold-50 transition-colors cursor-pointer"
                        >
                          {subcat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          {user.loggedIn && user.role === 'admin' && (
            <button
              onClick={() => {
                navigate('/admin');
                setOpen(false);
              }}
              className="w-full text-left py-2 text-maroon-900 font-bold text-xs tracking-wider bg-gold-50/50 px-2 rounded mt-1 flex items-center justify-between cursor-pointer"
            >
              ⚙️ Admin Control
              <ChevronRightIcon className="h-3.5 w-3.5 text-maroon-900" />
            </button>
          )}
        </div>
      )}
    </header>
  );
}
