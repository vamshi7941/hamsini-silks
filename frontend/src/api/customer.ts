import { CartItem, Order, useStore } from '@/context/StoreContext';
import { Product } from '@/data';

export const CustomerApi = () => {
  const apiUrl =
    (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';

  const {
    products,
    cart,
    setCart,
    user,
    showToast,
    wishlist,
    setWishlist,
    buyNowItem,
    cartTotal,
    couponCode,
    couponDiscountPercentage,
  } = useStore();

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

  const placeOrder = async (
    orderData: Omit<Order, '_id' | 'status' | 'date' | 'items' | 'total'>,
  ) => {
    const orderItems = buyNowItem ? [buyNowItem] : cart;
    const orderTotal = buyNowItem
      ? buyNowItem.product.price * buyNowItem.quantity
      : cartTotal;

    const discountAmount = Math.round(
      orderTotal * (couponDiscountPercentage / 100),
    );
    const totalAfterDiscount = orderTotal - discountAmount;

    const payload = {
      customerId: user._id,
      orderData: {
        ...orderData,
        items: orderItems.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size,
        })),
        total: totalAfterDiscount,
        promoCode: couponCode || null,
        discountApplied: discountAmount,
      },
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
        const ordersWithProducts = (data.orders || []).map((order: any) => ({
          ...order,
          items: order.items.map((item: any) => {
            const product = products.find((p) => p._id === item.productId);
            return {
              product: product || { _id: item.productId },
              quantity: item.quantity,
              size: item.size,
            };
          }),
        }));

        return ordersWithProducts;
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
    placeOrder,
    fetchMyOrders,
  };
};
