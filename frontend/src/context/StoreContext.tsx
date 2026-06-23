import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Product } from '../data';
import { updateCart, getCustomerData, updateWishlist } from '../api/customer';

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: 'Placed' | 'Pending' | 'Processing' | 'Dispatched' | 'Delivered';
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
  | 'wishlist';

interface StoreContextType {
  products: Product[];
  fetchProducts: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;

  // Wishlist — full state
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  user: User;
  login: (
    email: string,
    role: 'customer' | 'admin',
    name?: string,
    _id?: string,
  ) => void;
  logout: () => void;

  currentPage: PageType;
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
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]); // product IDs in wishlist
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

  // ── Products ──
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchCustomerCart = useCallback(async () => {
    if (user.loggedIn && user._id) {
      await getCustomerData(user._id, (cartItems, wishlistItems) => {
        const updatedCart = cartItems
          .map((item: any) => {
            const product = products.find((p) => p._id === item.productId);
            if (product) {
              return {
                product,
                quantity: item.quantity,
              };
            }
            return null;
          })
          .filter((item) => item !== null) as CartItem[];

        setCart(updatedCart);
        setWishlist(wishlistItems);
      });
    }
  }, [user, products]);

  useEffect(() => {
    fetchCustomerCart();
  }, [fetchCustomerCart]);

  // ── Cart ──
  const addToCart = async (product: Product, quantity = 1) => {
    const newCart =
      cart.length > 0
        ? cart.find((item) => item.product._id === product._id)
          ? cart.map((item) =>
              item.product._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...cart, { product, quantity }]
        : [{ product, quantity }];

    await updateCart(newCart, user).then((res) => {
      if (res.success) {
        setCart(newCart);
        showToast('Added item(s) to your bag!');
      }
    });
  };

  const removeFromCart = async (productId: string) => {
    const newCart = cart.filter((item) => item.product._id !== productId);

    await updateCart(newCart, user).then((res) => {
      if (res.success) {
        setCart(newCart);
        showToast('Removed item from your bag!');
      }
    });
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const newCart = cart.map((item) =>
      item.product._id === productId ? { ...item, quantity } : item,
    );

    await updateCart(newCart, user).then((res) => {
      if (res.success) {
        setCart(newCart);
        showToast('Updated item quantity!');
      }
    });
  };

  const clearCart = async () => {
    const newCart: CartItem[] = [];
    await updateCart(newCart, user).then((res) => {
      if (res.success) {
        setCart(newCart);
        showToast('Cleared your bag!');
      }
    });
  };
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Wishlist (real state) ──
  const toggleWishlist = (productId: string) => {
    const updatedWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    setWishlist(updatedWishlist);
    updateWishlist(updatedWishlist, user).then(() => {
      showToast(
        wishlist.includes(productId)
          ? 'Removed from heirloom wishlist'
          : 'Saved to your heirloom wishlist!',
      );
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const wishlistCount = wishlist.length;


  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
    showToast(`Order #${orderId} → ${status}`);
  };

  // ── User ──
  const login = (
    email: string,
    role: 'customer' | 'admin',
    name?: string,
    _id?: string,
  ) => {
    const displayName =
      name ||
      (role === 'admin' ? 'Hamsini Atelier Admin' : email.split('@')[0]);
    const newUser = {
      name: displayName,
      email,
      role,
      loggedIn: true,
      _id,
    } as User;
    setUser(newUser);
    try {
      localStorage.setItem('hamsini_user', JSON.stringify(newUser));
    } catch (e) {
      // ignore storage errors
    }
    showToast(`Welcome back, ${displayName}!`);
    setCurrentPage(role === 'admin' ? 'admin' : 'home');
  };

  const logout = () => {
    const guest = {
      name: 'Guest Patron',
      email: '',
      role: 'customer',
      loggedIn: false,
    } as User;
    setUser(guest);
    try {
      localStorage.removeItem('hamsini_user');
    } catch (e) {
      // ignore
    }
    showToast('Logged out successfully');
    setCurrentPage('home');
  };

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
        products,
        fetchProducts,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        buyNowItem,
        setBuyNowItem,
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        orders,
        updateOrderStatus,
        user,
        login,
        logout,
        currentPage,
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
