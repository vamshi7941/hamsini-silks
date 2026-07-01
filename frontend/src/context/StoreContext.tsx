import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CartItem,
  CategoryConfig,
  Order,
  Product,
  StoreContextType,
  Toast,
  ToastType,
  User,
} from './contextTypes';
import { OrderData } from '@/types';
import { FeatureItem } from '@/api/admin';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState<Boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscountPercentage, setCouponDiscountPercentage] =
    useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [user, setUser] = useState<User>(() => {
    try {
      const raw = localStorage.getItem('hamsini_user');
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        return {
          name: parsed.name || 'Guest Patron',
          email: parsed.email || '',
          phone: parsed.phone || '',
          role:
            parsed.role === 'admin'
              ? 'admin'
              : parsed.role === 'promoter'
                ? 'promoter'
                : 'customer',
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
      phone: '',
      loggedIn: false,
      token: '',
      _id: '',
    };
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [siteContent, setSiteContent] = useState<{
    categories: CategoryConfig[];
    heroContent: any;
    features: FeatureItem[];
    ribbon: string[];
    heritage: {
      title: string;
      subtitle: string;
    };
    handpickedProducts: {
      title: string;
      subtitle: string;
      productIds: string[];
    };
  }>({
    categories: [],
    heroContent: null,
    features: [],
    ribbon: [],
    heritage: { title: '', subtitle: '' },
    handpickedProducts: { title: '', subtitle: '', productIds: [] },
  });
  const [globalLoadingCount, setGlobalLoadingCount] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);

  const incrementLoading = () => setGlobalLoadingCount((count) => count + 1);
  const decrementLoading = () =>
    setGlobalLoadingCount((count) => Math.max(count - 1, 0));
  const isGlobalLoading = globalLoadingCount > 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch.bind(window);
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    window.fetch = async (...args: Parameters<typeof window.fetch>) => {
      incrementLoading();
      try {
        return await originalFetch(...args);
      } finally {
        decrementLoading();
      }
    };

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      this.addEventListener('loadend', decrementLoading);
      return originalXhrOpen.apply(this, [
        method,
        url,
        async,
        username,
        password,
      ] as any);
    };

    XMLHttpRequest.prototype.send = function (
      body?: Document | BodyInit | null,
    ) {
      incrementLoading();
      return originalXhrSend.apply(this, [body] as any);
    };

    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXhrOpen;
      XMLHttpRequest.prototype.send = originalXhrSend;
    };
  }, []);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const wishlistCount = wishlist.length;

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,

        products,
        setProducts,

        orders,
        setOrders,

        orderData,
        setOrderData,

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

        couponCode,
        setCouponCode,
        couponDiscountPercentage,
        setCouponDiscountPercentage,

        isInWishlist,
        wishlistCount,

        selectedCategory,
        setSelectedCategory,

        siteContent,
        setSiteContent,

        toast,
        showToast,
      }}
    >
      {children}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-float transition-all max-w-sm ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-900'
              : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : toast.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span className="text-sm font-medium tracking-wide">
            {toast.message}
          </span>
        </div>
      )}

      {isGlobalLoading && (
        <div className="loader-overlay">
          <div className="loader-card">
            <div className="loader-spinner" />
            <p className="loader-message">
              Please wait while we load your content...
            </p>
          </div>
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
