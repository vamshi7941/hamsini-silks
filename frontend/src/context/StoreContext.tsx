import React, { createContext, useContext, useState } from 'react';
import { Product } from '../data';

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Dispatched' | 'Delivered';
  orderedDate?: string;
};

export type User = {
  name: string;
  email: string;
  role: 'customer' | 'admin';
  loggedIn: boolean;
  token?: string; // for admin
  _id?: string; // for customer
};

type PageType =
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'login'
  | 'admin'
  | 'wishlist'
  | 'my-orders';

interface StoreContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;

  // Cart
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;

  cartTotal: number;
  cartCount: number;

  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;

  // Wishlist — full state
  wishlist: string[];
  setWishlist: React.Dispatch<React.SetStateAction<string[]>>;

  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;

  // Orders
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

  imagesLoaded: Boolean;
  setImagesLoaded: React.Dispatch<React.SetStateAction<Boolean>>;

  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;

  currentPage: PageType;
  setCurrentPage: React.Dispatch<React.SetStateAction<PageType>>;

  navigateTo: (page: PageType, param?: any) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedProduct: Product | null;

  // Theme / Design Option Switcher ("both" Option A and Option B support)
  themeOption: 'A' | 'B';
  setThemeOption: (option: 'A' | 'B') => void;

  // Notification toast
  toast: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState<Boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [themeOption, setThemeOptionState] = useState<'A' | 'B'>('A');

  const [user, setUser] = useState<User>(() => {
    try {
      const raw = localStorage.getItem('hamsini_user');
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        return {
          name: parsed.name || 'Guest Patron',
          email: parsed.email || '',
          role: parsed.role === 'admin' ? 'admin' : 'customer',
          loggedIn: !!parsed.loggedIn,
          token: parsed.token || '',
          _id: parsed._id || '',
        };
      }
    } catch (e) {
      // ignore and fall back to defaults
    }
    return {
      name: 'Guest Patron',
      email: '',
      role: 'customer',
      loggedIn: false,
      token: '',
      _id: '',
    };
  });

  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const setThemeOption = (opt: 'A' | 'B') => {
    setThemeOptionState(opt);
    showToast(`Switched to Option ${opt} Design Theme!`);
  };

  // ── Cart ──
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const wishlistCount = wishlist.length;

  // ── Navigation ──
  const navigateTo = (page: PageType, param?: any) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'product-detail' && param) setSelectedProduct(param);
    if (page === 'shop' && typeof param === 'string')
      setSelectedCategory(param);
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,

        products,
        setProducts,

        orders,
        setOrders,

        imagesLoaded,
        setImagesLoaded,

        cart,
        setCart,

        cartTotal,
        cartCount,

        buyNowItem,
        setBuyNowItem,

        wishlist,
        setWishlist,

        isInWishlist,
        wishlistCount,

        currentPage,
        setCurrentPage,

        navigateTo,

        selectedCategory,
        setSelectedCategory,

        selectedProduct,
        
        themeOption,
        setThemeOption,

        toast,
        showToast,
      }}
    >
      {children}

      {/* Universal Floating Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-maroon-900 text-gold-100 px-6 py-3.5 rounded-2xl shadow-2xl border border-gold-400/40 flex items-center gap-3 animate-float transition-all max-w-sm">
          <span className="text-gold-400 text-lg">🪷</span>
          <span className="text-sm font-medium tracking-wide">{toast}</span>
        </div>
      )}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
