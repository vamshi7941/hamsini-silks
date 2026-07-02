import {
  BridalContent,
  FeatureItem,
  HandpickedContent,
  HeroContent,
  HeritageContent,
  VideoItem,
} from '@/api/admin';
import { OrderData, OrderStatus } from '@/types';

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
  sizes?: Array<{ name: string; units: number }>;
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
  status: OrderStatus;
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

  orderData: OrderData | null;
  setOrderData: React.Dispatch<React.SetStateAction<OrderData | null>>;

  imagesLoaded: Boolean;
  setImagesLoaded: React.Dispatch<React.SetStateAction<Boolean>>;

  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;

  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  siteContent: {
    categories: CategoryConfig[];
    heroContent: HeroContent | null;
    features: FeatureItem[];
    ribbon: string[];
    heritage: HeritageContent;
    handpickedProducts: HandpickedContent;
    bridal: BridalContent;
    videos: VideoItem[];
  };
  setSiteContent: React.Dispatch<
    React.SetStateAction<{
      categories: CategoryConfig[];
      heroContent: HeroContent | null;
      features: FeatureItem[];
      ribbon: string[];
      heritage: HeritageContent;
      handpickedProducts: HandpickedContent;
      bridal: BridalContent;
      videos: VideoItem[];
    }>
  >;

  toast: Toast | null;
  showToast: (msg: string, type?: ToastType) => void;
}
