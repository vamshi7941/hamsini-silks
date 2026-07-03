import { useEffect, useRef } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useStore } from './context/StoreContext';
import { ProductsApi } from './api/products';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import Hero from './components/Hero';
import Features from './components/Features';
import Categories from './components/Categories';
import Products from './components/Products';
import Bridal from './components/Bridal';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

import ShopPage from './components/pages/ShopPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import CartPage from './components/pages/CartPage';
import CheckoutPage from './components/pages/CheckoutPage';
import LoginPage from './components/pages/LoginPage';
import AdminLoginPage from './components/pages/AdminLoginPage';
import AdminDashboard from './components/pages/AdminDashboard';
import PromotersDashboard from './components/pages/PromotersDashboard';
import WishlistPage from './components/pages/WishlistPage';
import MyOrdersPage from './components/pages/MyOrdersPage';
import { AdminApi } from './api/admin';
import { CustomerApi } from './api/customer';
import ProfilePage from './components/pages/Profile';
import VerifyPhonePage from './components/pages/VerifyPhonePage';

function HomePage() {
  return (
    <div className="animate-fadeIn">
      <Hero />
      <Features />
      <Categories />
      <Products />
      <Bridal />
      <Testimonials />
      <Newsletter />
    </div>
  );
}

export default function App() {
  const { user, imagesLoaded, setSiteContent } = useStore();
  const { fetchAllProducts } = ProductsApi();
  const { fetchAllOrders, fetchSiteContent } = AdminApi();
  const { getCustomerData } = CustomerApi();
  const location = useLocation();
  const navigate = useNavigate();

  const hasFetchedProducts = useRef(false);
  const hasFetchedOrders = useRef(false);

  useEffect(() => {
    if (hasFetchedProducts.current) return;
    hasFetchedProducts.current = true;
    fetchAllProducts();
    fetchSiteContent().then((content) =>
      setSiteContent({
        categories: content.categories || [],
        heroContent: content.heroContent || null,
        features: content.features || [],
        ribbon: content.ribbon || [],
        heritage: content.heritage || null,
        handpickedProducts: content.handpickedProducts || {
          title: '',
          subtitle: '',
          productIds: [],
        },
        bridal: content.bridal || {
          eyebrow: '',
          titlePrefix: '',
          titleHighlight: '',
          titleSuffix: '',
          subtitle: '',
          description: '',
          badgePercent: '',
          badgeText: '',
          couponCode: '',
          couponLabel: '',
          savingsText: '',
          buttonLabel: '',
          buttonTarget: '',
          images: [],
        },
        footer: content.footer || {
          help: [
            { label: 'Track Order', href: '/track-order' },
            { label: 'Shipping & Delivery', href: '/shipping-and-delivery' },
            { label: 'Returns & Exchange', href: '/returnes-and-exchange' },
            { label: 'FAQs', href: '/faqs' },
          ],
          about: [{ label: 'Our Heritage', href: '/our-heritage' }],
        },
        videos: content.videos || [],
      }),
    );
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;
    if (user.role === 'admin') {
      if (!hasFetchedOrders.current) {
        hasFetchedOrders.current = true;
        fetchAllOrders();
      }
    }
    if (user.loggedIn && user.role === 'customer') {
      getCustomerData();
    }
  }, [user, imagesLoaded]);

  useEffect(() => {
    const customerPages = [
      '/profile',
      '/cart',
      '/checkout',
      '/wishlist',
      '/my-orders',
    ];

    if (
      user.loggedIn &&
      user.role === 'customer' &&
      !user.phone &&
      customerPages.includes(location.pathname)
    ) {
      navigate('/verify-phone', { replace: true });
    }
  }, [user.loggedIn, user.role, user.phone, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-[#fdf8f1] text-maroon-900 flex flex-col justify-between font-sans selection:bg-gold-200 selection:text-maroon-900">
      <Header />
      <ScrollToTop />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/category/:slug" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/promoter" element={<PromotersDashboard />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route
            path="/verify-phone"
            element={
              user.loggedIn && user.role === 'customer' && !user.phone ? (
                <VerifyPhonePage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
