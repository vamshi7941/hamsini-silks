import { useStore } from '@/context/StoreContext';

export const PromoterApi = () => {
  const { user, showToast } = useStore();
  const apiUrl =
    (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';

  const createPromoter = async (
    fullName: string,
    phone: string,
    discountPercentage: number,
    password: string,
    onSuccess?: () => void,
  ) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/promoter/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ fullName, phone, discountPercentage, password }),
      });
      const json = await response.json();

      if (json.success) {
        showToast('Promoter created successfully', 'success');
        onSuccess?.();
        return json.promoter;
      } else {
        showToast(json.error || 'Failed to create promoter', 'error');
      }
    } catch (error) {
      console.error('Create promoter error:', error);
      showToast('Failed to create promoter', 'error');
    }
  };

  const getAllPromoters = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/promoter/allPromoters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const json = await response.json();

      if (json.success) {
        return json.promoters;
      } else {
        showToast(json.error || 'Failed to fetch promoters', 'error');
      }
    } catch (error) {
      console.error('Get promoters error:', error);
      showToast('Failed to fetch promoters', 'error');
    }
  };

  const updatePromoter = async (
    promoterId: string,
    fullName?: string,
    phone?: string,
    discountPercentage?: number,
    isActive?: boolean,
    onSuccess?: () => void,
  ) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/admin/promoter/${promoterId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            fullName,
            phone,
            isActive,
          }),
        },
      );
      const json = await response.json();

      if (json.success) {
        // If discountPercentage is provided, treat as adding new promo code
        if (discountPercentage) {
          showToast('Promo code added successfully', 'success');
        } else {
          showToast('Promoter updated successfully', 'success');
        }
        onSuccess?.();
        return json.promoter;
      } else {
        showToast(json.error || 'Failed to update promoter', 'error');
      }
    } catch (error) {
      console.error('Update promoter error:', error);
      showToast('Failed to update promoter', 'error');
    }
  };

  const deletePromoter = async (promoterId: string, onSuccess?: () => void) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/admin/promoter/${promoterId}`,
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
        showToast('Promoter deleted successfully', 'success');
        onSuccess?.();
      } else {
        showToast(json.error || 'Failed to delete promoter', 'error');
      }
    } catch (error) {
      console.error('Delete promoter error:', error);
      showToast('Failed to delete promoter', 'error');
    }
  };

  const getPromoterStats = async (promoterId: string) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/promoter/stats/${promoterId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      const json = await response.json();

      if (json.success) {
        return json.stats;
      } else {
        showToast(json.error || 'Failed to fetch promoter stats', 'error');
      }
    } catch (error) {
      console.error('Get promoter stats error:', error);
      showToast('Failed to fetch promoter stats', 'error');
    }
  };

  return {
    createPromoter,
    getAllPromoters,
    updatePromoter,
    deletePromoter,
    getPromoterStats,
  };
};
