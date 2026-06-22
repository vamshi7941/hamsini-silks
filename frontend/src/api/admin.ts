import { useStore } from '@/context/StoreContext';
import { Product } from '@/data';

export const Admin = () => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  const { products, fetchProducts, showToast } = useStore();

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
        fetchProducts(); // Refresh the product list
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
        fetchProducts();
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
        fetchProducts();
        showToast('Product deleted!');
        onClose();
      } else {
        showToast(json.error || 'Unknown error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return { addProduct, updateProduct, deleteProduct };
};
