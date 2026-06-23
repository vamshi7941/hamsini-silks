import { CartItem, Order } from '@/context/StoreContext';

export const getCustomerData = async (
  customerId: string,
  onDataFetched?: (cartItems: any[], wishlist: string[]) => void,
) => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

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

export const updateCart = async (cart: CartItem[], user: any) => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

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

export const updateWishlist = async (wishlist: string[], user: any) => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

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
  } catch (error) {
    console.error('Error updating wishlist:', error);
  }
};

export const placeOrder = async (
  orderData: Omit<Order, 'id' | 'status' | 'date' | 'items' | 'total'>,
  buyNowItem: CartItem | null,
  cart: CartItem[],
  cartTotal: number,
  user: any,
) => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

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
