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
  token?: string;
  _id?: string;
};

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type Toast = {
  message: string;
  type: ToastType;
};

interface StoreContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;

  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;

  cartTotal: number;
  cartCount: number;

  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;

  wishlist: string[];
  setWishlist: React.Dispatch<React.SetStateAction<string[]>>;

  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;

  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

  imagesLoaded: Boolean;
  setImagesLoaded: React.Dispatch<React.SetStateAction<Boolean>>;

  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;

  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  themeOption: 'A' | 'B';
  setThemeOption: (option: 'A' | 'B') => void;

  toast: Toast | null;
  showToast: (msg: string, type?: ToastType) => void;
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

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const setThemeOption = (opt: 'A' | 'B') => {
    setThemeOptionState(opt);
    showToast(`Switched to Option ${opt} Design Theme!`, 'success');
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

        selectedCategory,
        setSelectedCategory,

        themeOption,
        setThemeOption,

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
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
