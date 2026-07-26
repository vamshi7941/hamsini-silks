import { Product } from '@/context/contextTypes';
import { useStore } from '@/context/StoreContext';

const apiUrl =
  (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';
const IMAGE_CACHE_KEY = 'hamsini_product_image_cache';

type ImageCacheEntry = {
  image: string;
  images: string[];
  updatedAt: string;
};

const getImageCache = async (): Promise<Cache | null> => {
  if (typeof window === 'undefined' || !('caches' in window)) return null;
  try {
    return await caches.open(IMAGE_CACHE_KEY);
  } catch {
    return null;
  }
};

const getCachedImageEntry = async (
  productId: string,
): Promise<ImageCacheEntry | null> => {
  const cache = await getImageCache();
  if (!cache) return null;

  const request = new Request(`${apiUrl}/api/products/${productId}/image`);
  const response = await cache.match(request);
  if (!response) return null;

  try {
    return (await response.json()) as ImageCacheEntry;
  } catch {
    return null;
  }
};

const writeCachedImageEntry = async (
  productId: string,
  entry: ImageCacheEntry,
): Promise<void> => {
  const cache = await getImageCache();
  if (!cache) return;

  const request = new Request(`${apiUrl}/api/products/${productId}/image`);
  const response = new Response(JSON.stringify(entry), {
    headers: { 'Content-Type': 'application/json' },
  });

  try {
    await cache.put(request, response);
  } catch {
    // ignore cache failures
  }
};

const deleteCachedImageEntriesNotIn = async (
  validProductIds: Set<string>,
): Promise<void> => {
  const cache = await getImageCache();
  if (!cache) return;

  const entries = await cache.keys();
  await Promise.all(
    entries.map(async (request) => {
      const segments = new URL(request.url).pathname.split('/');
      const productId =
        segments[segments.length - 2] === 'products'
          ? segments[segments.length - 1]
          : null;
      if (productId && !validProductIds.has(productId)) {
        await cache.delete(request);
      }
    }),
  );
};

export const ProductsApi = () => {
  const { setProducts, setImagesLoaded } = useStore();

  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data: Product[] = await response.json();

      const currentProductIds = new Set(data.map((product) => product._id));

      const productsWithImages = await Promise.all(
        data.map(async (product) => {
          const cached = await getCachedImageEntry(product._id);
          if (
            cached &&
            (!product.updatedAt || cached.updatedAt === product.updatedAt)
          ) {
            return { ...product, image: cached.image, images: cached.images };
          }

          try {
            const imageResponse = await fetch(
              `${apiUrl}/api/products/${product._id}/image`,
            );
            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              if (
                imageData.image ||
                (Array.isArray(imageData.images) && imageData.images.length > 0)
              ) {
                const updatedAt = product.updatedAt ?? '';
                const cacheEntry: ImageCacheEntry = {
                  image: imageData.image ?? product.image,
                  images: Array.isArray(imageData.images)
                    ? imageData.images
                    : [],
                  updatedAt,
                };
                await writeCachedImageEntry(product._id, cacheEntry);
                return {
                  ...product,
                  image: cacheEntry.image,
                  images: cacheEntry.images,
                };
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

      await deleteCachedImageEntriesNotIn(currentProductIds);

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
