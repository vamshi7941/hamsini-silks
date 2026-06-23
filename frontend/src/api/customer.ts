import { CartItem } from '@/context/StoreContext';

export const getCustomerData = async (
  customerId: string,
  onCartDataFetched?: (cartItems: any[]) => void,
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

    if (data.success && data.data.cartItems) {
      if (onCartDataFetched) {
        onCartDataFetched(data.data.cartItems);
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
    } else {
      const data = await response.json();
      console.log('Cart updated successfully:', data);
    }
  } catch (error) {
    console.error('Error updating cart:', error);
  }
};
