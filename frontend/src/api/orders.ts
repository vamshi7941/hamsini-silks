export const fetchAllOrders = async () => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  try {
    const response = await fetch(`${apiUrl}/api/orders/allOrders`, {
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    return result.orders || [];
  } catch (err) {
    console.log(err instanceof Error ? err.message : 'Unknown error');
    return [];
  }
};

export const updateOrderStatusApi = async (orderId: string, status: string) => {
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  try {
    const response = await fetch(`${apiUrl}/api/orders/updateOrderStatus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    console.log(err instanceof Error ? err.message : 'Unknown error');
    return null;
  }
};
