import { CartItem, Order, useStore } from '@/context/StoreContext';
import { Product } from '@/data';

export const CustomerApi = () => {
  const { products, cart, setCart, user, showToast, wishlist, setWishlist } =
    useStore();

  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  const getCustomerData = async (
    customerId: string,
    onDataFetched?: (cartItems: any[], wishlist: string[]) => void,
  ) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/customer/getUser?_id=${customerId}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        if (onDataFetched) {
          onDataFetched(data.data.cartItems, data.data.wishlist);
        }
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const updateCart = async (cart: CartItem[], user: any) => {
    // should pass only customerId: user._id and products: {productId: string, quantity: number}[]
    const payload = {
      customerId: user._id,
      products: cart.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const updateWishlist = async (wishlist: string[], user: any) => {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const fetchCart = async () => {
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
  };

  const placeOrder = async (
    orderData: Omit<Order, '_id' | 'status' | 'date' | 'items' | 'total'>,
    buyNowItem: CartItem | null,
    cart: CartItem[],
    cartTotal: number,
    user: any,
  ) => {
    const orderItems = buyNowItem ? [buyNowItem] : cart;
    const orderTotal = buyNowItem
      ? buyNowItem.product.price * buyNowItem.quantity
      : cartTotal;

    const payload = {
      customerId: user._id,
      orderData: {
        ...orderData,
        items: orderItems.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total: orderTotal,
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      return res.data._id;
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

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

    await updateCart(newCart, user).then((res: any) => {
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
        );
      }
    });
  };

  return {
    fetchCart,
    addToCart,
    updateCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    placeOrder,
  };
};
