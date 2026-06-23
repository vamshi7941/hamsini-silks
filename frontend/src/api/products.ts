import { useStore } from '@/context/StoreContext';
import { Product } from '@/data';

const apiUrl = (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

export const ProductsApi = () => {
  const { setProducts, setImagesLoaded } = useStore();

  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data: Product[] = await response.json();

      setProducts(data);

      const imagePromises = data.map(async (product) => {
        try {
          const imageResponse = await fetch(
            `${apiUrl}/api/products/${product._id}/image`,
          );
          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            if (imageData.image) {
              setProducts((prevProducts) =>
                prevProducts.map((p) =>
                  p._id === product._id ? { ...p, image: imageData.image } : p,
                ),
              );
              return true;
            }
          }
        } catch (error) {
          console.error(
            `Error fetching image for product ${product._id}:`,
            error,
          );
        }
        return false;
      });

      await Promise.all(imagePromises);

      setProducts((prevProducts) => {
        const allImagesLoaded =
          prevProducts.length > 0 && prevProducts.every((p) => p.image);
        setImagesLoaded(allImagesLoaded);
        return prevProducts;
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      setImagesLoaded(false);
    }
  };

  return {
    fetchAllProducts,
  };
};
