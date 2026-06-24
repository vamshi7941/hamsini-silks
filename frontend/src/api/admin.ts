import { Order, useStore } from '@/context/StoreContext';
import { Product } from '@/data';
import { ProductsApi } from './products';

export const AdminApi = () => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  const { products, showToast, setOrders, user } = useStore();
  const { fetchAllProducts } = ProductsApi();

  const getNextProductId = (products: Product[]) => {
    if (products.length === 0) return 'HSPID-0001';

    const highestNumber = products.reduce((max, product) => {
      const match = product._id.match(/(?:HSPID-)?0*(\d+)$/i);
      const value = match ? Number(match[1]) : NaN;
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0);

    return `HSPID-${String(highestNumber + 1).padStart(4, '0')}`;
  };

  const addProduct = async (product: Product, onClose: () => void) => {
    const generatedId = getNextProductId(products);

    // Here you would typically make an API call to your backend to add the product
    try {
      const response = await fetch(`${apiUrl}/api/products/addProduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ ...product, _id: generatedId }),
      });
      const json = await response.json();

      if (response.ok) {
        console.log(json);
        fetchAllProducts();
        showToast('New saree published!', 'success');
        onClose();
      } else {
        showToast(json.error || 'Failed to add product', 'error');
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to add product',
        'error',
      );
    }
  };

  const updateProduct = async (
    id: string,
    updates: Partial<Product>,
    onClose: () => void,
  ) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/products/updateProduct/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(updates),
        },
      );
      const json = await response.json();

      if (json.success) {
        fetchAllProducts();
        showToast('Product updated!', 'success');
        onClose();
      } else {
        showToast(json.error || 'Failed to update product', 'error');
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update product',
        'error',
      );
    }
  };

  const deleteProduct = async (id: string, onClose: () => void) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/products/deleteProduct/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );
      const json = await response.json();

      if (json.success) {
        fetchAllProducts();
        showToast('Product deleted!', 'success');
        onClose();
      } else {
        showToast(json.error || 'Failed to delete product', 'error');
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete product',
        'error',
      );
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/allOrders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const json = await response.json();

      if (json.success) {
        const ordersWithProducts = (json.orders || []).map((order: any) => ({
          ...order,
          items: order.items.map((item: any) => {
            const product = products.find((p) => p._id === item.productId);
            return {
              product: product || { _id: item.productId },
              quantity: item.quantity,
            };
          }),
        }));
        setOrders(ordersWithProducts);
      } else {
        showToast('No orders found', 'warning');
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to fetch orders',
        'error',
      );
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
  ) => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/updateOrderStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o)),
      );
      showToast(`Order #${orderId} → ${status}`, 'success');

      return response.json();
    } catch (err) {
      console.log(err instanceof Error ? err.message : 'Unknown error');
      showToast('Failed to update order status', 'error');
      return null;
    }
  };

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    fetchAllOrders,
    updateOrderStatus,
  };
};
