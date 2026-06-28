import { CartItem, useStore } from '@/context/StoreContext';
import { Product } from '@/data';
import { OrderData, OrderItem } from '@/types';

export const CustomerApi = () => {
  const apiUrl =
    (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';

  const { products, cart, setCart, user, showToast, wishlist, setWishlist } =
    useStore();

  const getCustomerData = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/customer/getUser?_id=${user._id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

      const returnData = await response.json();

      if (returnData.success) {
        const cartItems = returnData.data.cartItems || [];
        const wishlistItems = returnData.data.wishlist || [];

        const updatedCart = cartItems
          .map((item: any) => {
            const product = products.find((p) => p._id === item.productId);
            if (product) {
              return {
                product,
                quantity: item.quantity,
                size: item.size,
              };
            }
            return null;
          })
          .filter((item: any) => item !== null) as CartItem[];

        setCart(updatedCart);
        setWishlist(wishlistItems);
      }
    } catch (error) {
      showToast('Failed to fetch customer data.', 'error');
      console.error('Error fetching customer data:', error);
    }
  };

  const updateCart = async (cart: CartItem[], user: any) => {
    if (!user.loggedIn) {
      showToast('Please log in to update your cart.', 'warning');
      return;
    }
    if (user.role !== 'customer') {
      showToast('Only customers can update the cart.', 'warning');
      return;
    }
    const payload = {
      customerId: user._id,
      products: cart.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        size: item.size,
      })),
    };

    try {
      const response = await fetch(`${apiUrl}/api/customer/updateCart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

      return response.json();
    } catch (error) {
      showToast('Failed to update cart.', 'error');
      console.error('Error updating cart:', error);
    }
  };

  const updateWishlist = async (wishlist: string[], user: any) => {
    if (!user.loggedIn) {
      showToast('Please log in to update your wishlist.', 'warning');
      return;
    }
    if (user.role !== 'customer') {
      showToast('Only customers can update the wishlist.', 'warning');
      return;
    }

    const payload = {
      customerId: user._id,
      wishlist: wishlist,
    };

    try {
      const response = await fetch(`${apiUrl}/api/customer/updateWishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

      return response.json();
    } catch (error) {
      showToast('Failed to update wishlist.', 'error');
      console.error('Error updating wishlist:', error);
    }
  };

  const validatePhone = async (phone: string, otp: string) => {
    if (!user.loggedIn) {
      showToast('Please log in to verify your phone.', 'warning');
      return;
    }
    if (user.role !== 'customer') {
      showToast('Only customers can verify a phone for COD orders.', 'warning');
      return;
    }

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    const normalizedOtp = otp.replace(/\D/g, '').slice(-6);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      showToast('Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      showToast('Please enter a valid 6-digit OTP.', 'error');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/customer/validatePhone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ phone: normalizedPhone, otp: normalizedOtp }),
      });

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

      const json = await response.json();
      if (!json.success) {
        showToast(
          json.message || 'OTP verification failed. Please try again.',
          'error',
        );
      }

      return json;
    } catch (error) {
      showToast('Failed to verify OTP.', 'error');
      console.error('Error verifying OTP:', error);
    }
  };

  const SHIPROCKET_TOKEN_KEY = 'hamsini_shiprocket_token';

  const getStoredShiprocketToken = (): {
    token: string;
    expiresAt: number;
  } | null => {
    try {
      const raw = localStorage.getItem(SHIPROCKET_TOKEN_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { token: string; expiresAt: number };
      if (!parsed.token || !parsed.expiresAt) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  };

  const storeShiprocketToken = (token: string) => {
    try {
      const expiresAt = Date.now() + 23 * 60 * 60 * 1000;
      localStorage.setItem(
        SHIPROCKET_TOKEN_KEY,
        JSON.stringify({ token, expiresAt }),
      );
    } catch (error) {
      // ignore storage errors
    }
  };

  const getShiprocketToken = async () => {
    const stored = getStoredShiprocketToken();
    if (stored && stored.expiresAt > Date.now()) {
      return stored.token;
    }

    const response = await fetch(`${apiUrl}/api/shiprocket/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await response.json();

    if (!response.ok || !json.success || !json.data?.token) {
      throw new Error(json.message || 'Failed to authenticate with Shiprocket');
    }

    storeShiprocketToken(json.data.token);
    return json.data.token;
  };

  const checkShiprocketRates = async ({
    pickup_code = '502032',
    delivery_code,
    cod = 0,
    order_price,
    order_weight = 1,
  }: {
    pickup_code?: string;
    delivery_code: string;
    cod?: number;
    order_price: number;
    order_weight?: number;
  }) => {
    try {
      const params = new URLSearchParams({
        pickup_code,
        delivery_code,
        cod: String(cod),
        order_price: String(order_price),
        order_weight: String(order_weight),
      });

      const response = await fetch(
        `${apiUrl}/api/shiprocket/checkRates?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to check Shiprocket rates');
      }
      return json.data;
    } catch (error) {
      console.error('Error checking Shiprocket rates:', error);
      throw error;
    }
  };

  const createShiprocketOrder = async (orderData: any) => {
    try {
      const token = await getShiprocketToken();
      const response = await fetch(`${apiUrl}/api/shiprocket/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ token, orderData }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to create Shiprocket order');
      }
      return json.data;
    } catch (error) {
      console.error('Error creating Shiprocket order:', error);
      throw error;
    }
  };

  const assignShiprocketAwb = async ({
    order_id,
    courier_id,
  }: {
    order_id: string;
    courier_id: number;
  }) => {
    try {
      const token = await getShiprocketToken();
      const response = await fetch(`${apiUrl}/api/shiprocket/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ token, order_id, courier_id }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to assign Shiprocket AWB');
      }
      return json.data;
    } catch (error) {
      console.error('Error assigning Shiprocket AWB:', error);
      throw error;
    }
  };

  const validateCoupon = async (couponCode: string) => {
    if (!user.loggedIn || user.role !== 'customer') {
      showToast('Please log in as a customer to apply coupons.', 'warning');
      return null;
    }

    try {
      const response = await fetch(`${apiUrl}/api/customer/validateCoupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ couponCode }),
      });

      const data = await response.json();
      if (data.success) {
        return data.data;
      }

      showToast(data.message || 'Invalid coupon code', 'warning');
      return null;
    } catch (error) {
      showToast('Failed to validate coupon.', 'error');
      console.error('Error validating coupon:', error);
      return null;
    }
  };

  const getPaymentMethods = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/customer/paymentMethods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await response.json();
      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return [];
      }

      if (data.success) {
        return data.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  };

  const createRazorpayOrder = async ({
    amount,
    orderData,
  }: {
    amount: number;
    orderData: any;
  }) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/customer/createRazorpayOrder`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            customerId: user._id,
            amount,
            orderData,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        showToast(data.message || 'Unable to initialize Razorpay.', 'error');
      }

      return data;
    } catch (error) {
      showToast('Failed to initialize Razorpay.', 'error');
      console.error('Error creating Razorpay order:', error);
      return null;
    }
  };

  const verifyRazorpayPayment = async (payload: any) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/customer/verifyRazorpayPayment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            customerId: user._id,
            ...payload,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        showToast(data.message || 'Payment verification failed.', 'error');
      }

      return data;
    } catch (error) {
      showToast('Failed to verify payment.', 'error');
      console.error('Error verifying Razorpay payment:', error);
      return null;
    }
  };

  const placeOrder = async (orderData: OrderData) => {
    const payload = {
      customerId: user._id,
      orderData,
    };

    try {
      const response = await fetch(`${apiUrl}/api/customer/placeOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
      }

      const res = await response.json();
      return res;
    } catch (error) {
      showToast('Failed to place order.', 'error');
      console.error('Error placing order:', error);
    }
  };

  const addToCart = async (
    product: Product,
    quantity = 1,
    activeSize = '6.2m (with blouse)',
  ) => {
    const newCart =
      cart.length > 0
        ? cart.find((item) => item.product._id === product._id)
          ? cart.map((item) =>
              item.product._id === product._id
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    size: activeSize,
                  }
                : item,
            )
          : [...cart, { product, quantity, size: activeSize }]
        : [{ product, quantity, size: activeSize }];

    await updateCart(newCart, user).then((res: any) => {
      if (res.success) {
        setCart(newCart);
        showToast('Added item(s) to your bag!', 'success');
      } else {
        showToast('Failed to add item to cart.', 'error');
      }
    });
  };

  const removeFromCart = async (productId: string) => {
    const newCart = cart.filter((item) => item.product._id !== productId);

    await updateCart(newCart, user).then((res) => {
      if (res.success) {
        setCart(newCart);
        showToast('Removed item from your bag!', 'success');
      } else {
        showToast('Failed to remove item from cart.', 'error');
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
        showToast('Updated item quantity!', 'success');
      } else {
        showToast('Failed to update item quantity.', 'error');
      }
    });
  };

  const clearCart = async () => {
    const newCart: CartItem[] = [];
    await updateCart(newCart, user).then((res) => {
      if (res.success) {
        setCart(newCart);
        showToast('Cleared your bag!', 'success');
      } else {
        showToast('Failed to clear cart.', 'error');
      }
    });
  };

  const toggleWishlist = (productId: string) => {
    const updatedWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    updateWishlist(updatedWishlist, user).then((res) => {
      if (res.success) {
        setWishlist(updatedWishlist);
        showToast(
          wishlist.includes(productId)
            ? 'Removed from your wishlist!'
            : 'Added to your wishlist!',
          'success',
        );
      } else {
        showToast('Failed to update wishlist.', 'error');
      }
    });
  };

  const fetchMyOrders = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/customer/getOrders?_id=${user._id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return [];
      }
      if (data.success) {
        const ordersWithProducts: OrderData[] = (data.orders || []).map(
          (order: any) => ({
            ...order,
            items: order.items.map((item: OrderItem) => {
              const product = products.find((p) => p._id === item.sku);
              return {
                _id: item.sku,
                name: item.name,
                category: product?.category,
                selling_price: item.selling_price,
                image: product?.image || '',
                units: item.units,
                size: item.size,
              };
            }),
          }),
        );

        return ordersWithProducts ?? [];
      } else {
        showToast(data.message || 'Failed to fetch my orders.', 'error');
        return [];
      }
    } catch (error) {
      showToast('Failed to fetch my orders.', 'error');
      console.error('Error fetching my orders:', error);
    }
  };

  return {
    getCustomerData,
    addToCart,
    updateCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    validateCoupon,
    validatePhone,
    placeOrder,
    fetchMyOrders,
    getPaymentMethods,
    createRazorpayOrder,
    verifyRazorpayPayment,
    checkShiprocketRates,
  };
};
