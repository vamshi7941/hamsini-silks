import { useStore } from '@/context/StoreContext';
import { Product } from '@/data';
import { ProductsApi } from './products';
import { OrderData } from '@/types';

export const AdminApi = () => {
  const apiUrl =
    (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';

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

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

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

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

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

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

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
      const response = await fetch(`${apiUrl}/api/admin/allOrders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const json = await response.json();

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

      if (json.success) {
        const ordersWithProducts = (json.orders || []).map((order: any) => ({
          ...order,
          items: order.items.map((item: any) => {
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
        }));
        const sortedOrders = ordersWithProducts?.sort(
          (
            a: { order_date: string | number | Date },
            b: { order_date: string | number | Date },
          ) =>
            new Date(b.order_date).getTime() - new Date(a.order_date).getTime(),
        );
        setOrders(sortedOrders);
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

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    fetchAllOrders,
  };
};
