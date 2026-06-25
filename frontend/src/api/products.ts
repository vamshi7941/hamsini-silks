import { useStore } from '@/context/StoreContext';
import { Product } from '@/data';

const apiUrl =
  (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';
const IMAGE_CACHE_KEY = 'hamsini_product_image_cache';

type ImageCacheEntry = {
  image: string;
  updatedAt: string;
};

type ImageCache = Record<string, ImageCacheEntry>;

const loadImageCache = (): ImageCache => {
  try {
    const raw = localStorage.getItem(IMAGE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as ImageCache) : {};
  } catch {
    return {};
  }
};

const saveImageCache = (cache: ImageCache) => {
  try {
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage failures
  }
};

export const ProductsApi = () => {
  const { setProducts, setImagesLoaded } = useStore();

  const fetchAllProducts = async () => {
    console.log('apiUrl: ', apiUrl);
    try {
      const response = await fetch(`${apiUrl}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data: Product[] = await response.json();

      const imageCache = loadImageCache();
      let hasCacheChanges = false;
      const currentProductIds = new Set(data.map((product) => product._id));

      const productsWithImages = await Promise.all(
        data.map(async (product) => {
          const cached = imageCache[product._id];
          if (
            cached &&
            (!product.updatedAt || cached.updatedAt === product.updatedAt)
          ) {
            return { ...product, image: cached.image };
          }

          try {
            const imageResponse = await fetch(
              `${apiUrl}/api/products/${product._id}/image`,
            );
            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              if (imageData.image) {
                const updatedAt = product.updatedAt ?? '';
                imageCache[product._id] = { image: imageData.image, updatedAt };
                hasCacheChanges = true;
                return { ...product, image: imageData.image };
              }
            }
          } catch (error) {
            console.error(
              `Error fetching image for product ${product._id}:`,
              error,
            );
          }

          return product;
        }),
      );

      Object.keys(imageCache).forEach((productId) => {
        if (!currentProductIds.has(productId)) {
          delete imageCache[productId];
          hasCacheChanges = true;
        }
      });

      if (hasCacheChanges) {
        saveImageCache(imageCache);
      }

      setProducts(productsWithImages);
      const allImagesLoaded =
        productsWithImages.length > 0 &&
        productsWithImages.every((p) => Boolean(p.image));
      setImagesLoaded(allImagesLoaded);
    } catch (error) {
      console.error('Error fetching products:', error);
      setImagesLoaded(false);
    }
  };

  return {
    fetchAllProducts,
  };
};
