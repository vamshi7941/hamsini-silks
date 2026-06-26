export type Product = {
  _id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  badge?: string;
  rating: number;
  inStock?: boolean;
  size?: string;
  updatedAt?: string;
};

export type CategoryConfig = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  type?: 'category' | 'subcategory';
  isActive?: boolean;
  order?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
  size: string;
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
  phone?: string;
  role: 'customer' | 'admin' | 'promoter';
  loggedIn: boolean;
  token: string;
  _id: string;
  promoCode?: string;
  discountPercentage?: number;
};

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type Toast = {
  message: string;
  type: ToastType;
};

export interface StoreContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;

  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;

  cartTotal: number;
  cartCount: number;

  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;

  couponCode: string;
  setCouponCode: React.Dispatch<React.SetStateAction<string>>;
  couponDiscountPercentage: number;
  setCouponDiscountPercentage: React.Dispatch<React.SetStateAction<number>>;

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

  siteContent: {
    categories: CategoryConfig[];
    heroContent: any;
  };
  setSiteContent: React.Dispatch<
    React.SetStateAction<{ categories: CategoryConfig[]; heroContent: any }>
  >;

  themeOption: 'A' | 'B';
  setThemeOption: (option: 'A' | 'B') => void;

  toast: Toast | null;
  showToast: (msg: string, type?: ToastType) => void;
}
