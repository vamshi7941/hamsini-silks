import { useEffect } from 'react';
import { useStore } from './context/StoreContext';
import { ProductsApi } from './api/products';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Categories from './components/Categories';
import Products from './components/Products';
import Bridal from './components/Bridal';
import Heritage from './components/Heritage';
import Testimonials from './components/Testimonials';
import Instagram from './components/Instagram';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

// Page views
import ShopPage from './components/pages/ShopPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import CartPage from './components/pages/CartPage';
import CheckoutPage from './components/pages/CheckoutPage';
import LoginPage from './components/pages/LoginPage';
import AdminDashboard from './components/pages/AdminDashboard';
import WishlistPage from './components/pages/WishlistPage';
import MyOrdersPage from './components/pages/MyOrdersPage';
import { AdminApi } from './api/admin';
import { CustomerApi } from './api/customer';

export default function App() {
  const { currentPage, user, imagesLoaded } = useStore();
  const { fetchAllProducts } = ProductsApi();
  const { fetchAllOrders } = AdminApi();
  const { fetchCart } = CustomerApi();

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if(!imagesLoaded) return;
    if (user.role === 'admin') {
      fetchAllOrders();
    }

    if (user.role === 'customer') {
      fetchCart();
    }
  }, [user, imagesLoaded]);

  return (
    <div className="min-h-screen bg-[#fdf8f1] text-maroon-900 flex flex-col justify-between font-sans selection:bg-gold-200 selection:text-maroon-900">
      <Header />

      <main className="flex-1">
        {currentPage === 'home' && (
          <div className="animate-fadeIn">
            <Hero />
            <Features />
            <Categories />
            <Products />
            <Bridal />
            <Heritage />
            <Testimonials />
            <Instagram />
            <Newsletter />
          </div>
        )}

        {currentPage === 'wishlist' && <WishlistPage />}
        {currentPage === 'shop' && <ShopPage />}
        {currentPage === 'product-detail' && <ProductDetailPage />}
        {currentPage === 'cart' && <CartPage />}
        {currentPage === 'checkout' && <CheckoutPage />}
        {currentPage === 'login' && <LoginPage />}
        {currentPage === 'admin' && <AdminDashboard />}
        {currentPage === 'my-orders' && <MyOrdersPage />}
      </main>

      <Footer />
    </div>
  );
}
