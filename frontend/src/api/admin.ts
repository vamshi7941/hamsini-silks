import { Order, useStore } from '@/context/StoreContext';
import { Product } from '@/data';
import { ProductsApi } from './products';

export const AdminApi = () => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  const { products, showToast, setOrders } = useStore();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, _id: generatedId }),
      });
      const json = await response.json();

      if (response.ok) {
        console.log(json);
        fetchAllProducts();
        showToast('New saree published!');
        onClose();
      } else {
        showToast(json.error || 'Unknown error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unknown error');
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        },
      );
      const json = await response.json();

      if (json.success) {
        fetchAllProducts();
        showToast('Product updated!');
        onClose();
      } else {
        showToast(json.error || 'Unknown error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const deleteProduct = async (id: string, onClose: () => void) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/products/deleteProduct/${id}`,
        {
          method: 'DELETE',
        },
      );
      const json = await response.json();

      if (json.success) {
        fetchAllProducts();
        showToast('Product deleted!');
        onClose();
      } else {
        showToast(json.error || 'Unknown error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/allOrders`, {
        headers: { 'Content-Type': 'application/json' },
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
        showToast('No orders found');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to fetch orders');
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
  ) => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/updateOrderStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o)),
      );
      showToast(`Order #${orderId} → ${status}`);

      return response.json();
    } catch (err) {
      console.log(err instanceof Error ? err.message : 'Unknown error');
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
