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
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Dispatched' | 'Delivered';
  date: string;
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

  // Wishlist — full state
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;

  // Orders
  orders: Order[];
  placeOrder: (
    orderData: Omit<Order, 'id' | 'status' | 'date' | 'items' | 'total'>,
  ) => string;
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

const mockInitialOrders: Order[] = [
  {
    id: 'ORD-9281',
    customerName: 'Aishwarya Iyer',
    customerEmail: 'aishwarya@gmail.com',
    phone: '+91 98401 23456',
    address: 'Flat 4B, Shanti Apartments, Alwarpet, Chennai – 600018',
    items: [
      {
        product: {
          _id: '1',
          name: 'Shrestha Kanjivaram',
          category: 'Bridal Kanjivaram',
          price: 48500,
          image: '/images/saree-kanjivaram.jpg',
          rating: 4.9,
        },
        quantity: 1,
      },
    ],
    total: 48500,
    paymentMethod: 'UPI (Google Pay)',
    status: 'Dispatched',
    date: '2026-03-08',
  },
  {
    id: 'ORD-8432',
    customerName: 'Rohan Varma',
    customerEmail: 'rohan.v@outlook.com',
    phone: '+91 91234 56789',
    address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru – 560066',
    items: [
      {
        product: {
          _id: '2',
          name: 'Smarthika Banarasi',
          category: 'Banarasi Silk',
          price: 32900,
          image: '/images/saree-banarasi.jpg',
          rating: 4.8,
        },
        quantity: 1,
      },
      {
        product: {
          _id: '3',
          name: 'Vaichitrya Pattu',
          category: 'Soft Silk Pattu',
          price: 18750,
          image: '/images/saree-pattu.jpg',
          rating: 4.7,
        },
        quantity: 2,
      },
    ],
    total: 70400,
    paymentMethod: 'Card (Visa)',
    status: 'Pending',
    date: '2026-03-10',
  },
  {
    id: 'ORD-7765',
    customerName: 'Deepa Srinivasan',
    customerEmail: 'deepa.s@yahoo.com',
    phone: '+91 98765 43210',
    address: 'A-201, Lotus Heights, Nungambakkam, Chennai – 600034',
    items: [
      {
        product: {
          _id: '4',
          name: 'Nilambari Designer',
          category: 'Designer Silk',
          price: 27400,
          image: '/images/saree-designer.jpg',
          rating: 4.9,
        },
        quantity: 1,
      },
      {
        product: {
          _id: '5',
          name: 'Mayura Kanjivaram',
          category: 'Bridal Kanjivaram',
          price: 54200,
          image: '/images/saree-kanjivaram.jpg',
          rating: 4.8,
        },
        quantity: 1,
      },
    ],
    total: 81600,
    paymentMethod: 'UPI (PhonePe)',
    status: 'Processing',
    date: '2026-03-12',
  },
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(mockInitialOrders);
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
  const addToCart = (product: Product, quantity = 1) => {
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

    setCart(newCart);
    updateCart(newCart, user);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter((item) => item.product._id !== productId);
    setCart(newCart);
    updateCart(newCart, user);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map((item) =>
      item.product._id === productId ? { ...item, quantity } : item,
    );
    setCart(newCart);
    updateCart(newCart, user);
  };

  const clearCart = () => {
    const newCart: CartItem[] = [];
    setCart(newCart);
    updateCart(newCart, user);
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

  // ── Orders ──
  const placeOrder = (
    orderData: Omit<Order, 'id' | 'status' | 'date' | 'items' | 'total'>,
  ) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...cart],
      total: cartTotal,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder.id;
  };

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
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        orders,
        placeOrder,
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
