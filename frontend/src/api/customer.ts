import { CartItem } from '@/context/StoreContext';

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
