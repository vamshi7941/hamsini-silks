import { useStore } from '@/context/StoreContext';
import { Product } from '@/data';

export const Admin = () => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  const { products } = useStore();

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const generatedId = `HSPID-${products.length + 1}`;

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
      } else {
        // show toast notification for failed login
      }
    } catch (err) {
      console.error('Admin login failed', err);
    }
  };

  return { addProduct };
};
