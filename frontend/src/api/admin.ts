import { useStore } from '@/context/StoreContext';
import { ProductsApi } from './products';
import { Product } from '@/context/contextTypes';

export type CategoryItem = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  type?: 'category' | 'subcategory';
  isActive?: boolean;
  order?: number;
};

export type HeroContent = {
  _id?: string;
  eyebrow?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  description?: string;
  primaryButtonLabel?: string;
  primaryButtonTarget?: string;
  secondaryButtonLabel?: string;
  secondaryButtonTarget?: string;
  featuredTitle?: string;
  featuredPrice?: string;
  image?: string;
  featuredProductId?: string;
  badgeText?: string;
};

export type FeatureItem = {
  _id?: string;
  title: string;
  description: string;
  icon: {
    name: string;
    svg: string;
  };
};

export type RibbonContent = string[];

export type HeritageContent = {
  title: string;
  subtitle: string;
};

export type HandpickedContent = {
  title: string;
  subtitle: string;
  productIds: string[];
};

export type BridalImageContent = {
  src?: string;
  alt?: string;
};

export type BridalContent = {
  eyebrow: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  subtitle: string;
  description: string;
  badgePercent: string;
  badgeText: string;
  couponCode: string;
  couponLabel: string;
  savingsText: string;
  buttonLabel: string;
  buttonTarget: string;
  images: BridalImageContent[];
};

export const AdminApi = () => {
  const apiUrl =
    (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';

  const { products, showToast, setOrders, user } = useStore();
  const { fetchAllProducts } = ProductsApi();

  const addProduct = async (product: Product, onClose: () => void) => {
    try {
      const response = await fetch(`${apiUrl}/api/products/addProduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(product),
      });
      const json = await response.json();

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

      if (response.ok) {
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
      const response = await fetch(`${apiUrl}/api/products/updateProduct/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(updates),
      });
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
      const response = await fetch(`${apiUrl}/api/products/deleteProduct/${id}`, {
        method: 'DELETE',
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

  const saveCategory = async (category: Partial<CategoryItem>) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(category),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save category');
      }
      showToast('Category saved successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save category',
        'error',
      );
      return null;
    }
  };

  const updateCategory = async (id: string, updates: Partial<CategoryItem>) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(updates),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to update category');
      }
      showToast('Category updated successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update category',
        'error',
      );
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to delete category');
      }
      showToast('Category deleted successfully', 'success');
      return true;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete category',
        'error',
      );
      return false;
    }
  };

  const fetchSiteContent = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/site-content`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to fetch hero content');
      }
      return json || null;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to fetch hero content',
        'error',
      );
      return null;
    }
  };

  const saveHeroContent = async (content: HeroContent) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/hero-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(content),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save hero content');
      }
      showToast('Hero section updated successfully', 'success');
      return json.heroContent;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save hero content',
        'error',
      );
      return null;
    }
  };

  const saveFeatures = async (features: FeatureItem[]) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ features }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save features');
      }
      showToast('Features updated successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save features',
        'error',
      );
      return null;
    }
  };

  const saveRibbonContent = async (ribbon: RibbonContent) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/ribbon-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ ribbon }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save ribbon content');
      }
      showToast('Ribbon updated successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save ribbon content',
        'error',
      );
      return null;
    }
  };

  const saveHeritageContent = async (content: HeritageContent) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/heritage-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(content),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save heritage content');
      }
      showToast('Heritage section updated successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save heritage content',
        'error',
      );
      return null;
    }
  };

  const saveHandpickedProducts = async (content: HandpickedContent) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/handpicked-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          title: content.title,
          subtitle: content.subtitle,
          handpickedProducts: content.productIds,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save handpicked products');
      }
      showToast('Handpicked products updated successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Failed to save handpicked products',
        'error',
      );
      return null;
    }
  };

  const saveBridalContent = async (content: BridalContent) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/bridal-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(content),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save bridal content');
      }
      showToast('Bridal section updated successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save bridal content',
        'error',
      );
      return null;
    }
  };

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    fetchAllOrders,
    fetchSiteContent,
    saveCategory,
    updateCategory,
    deleteCategory,
    saveHeroContent,
    saveFeatures,
    saveRibbonContent,
    saveHeritageContent,
    saveHandpickedProducts,
    saveBridalContent,
  };
};
