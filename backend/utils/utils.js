const normalizeShiprocketStatus = (rawStatus) => {
  const status = String(rawStatus || '')
    .trim()
    .toUpperCase();
  if (!status) return undefined;

  if (status.includes('RETURN')) {
    return status.includes('PENDING') ? 'RETURN PENDING' : 'RETURNED';
  }
  if (status.includes('CANCEL')) return 'CANCELLED';
  if (status.includes('PICKLIST')) return 'PICKLISTED';
  if (status.includes('PACKED')) return 'PACKED';
  if (
    status.includes('SHIPPED') ||
    status.includes('IN TRANSIT') ||
    status.includes('OUT FOR DELIVERY') ||
    status.includes('OUT FOR SHIPMENT')
  ) {
    return 'SHIPPED';
  }
  if (status.includes('READY')) return 'READY TO PACK';
  if (status === 'NEW' || status === 'NEW ORDER') return 'NEW';
  if (status.includes('PROCESSING') || status.includes('PENDING')) return 'NEW';
  if (status.includes('DELIVERED')) return 'DELIVERED';

  return undefined;
};

export const mapOrdersWithShiprocketStatus = (orders, shiprocketOrders) => {
  const srOrdersWithStatus = (shiprocketOrders || []).map((order) => ({
    id: order.channel_order_id,
    status: normalizeShiprocketStatus(order.status) || order.status,
    etd: order?.shipments[0]?.etd,
    awb: order?.shipments[0]?.awb,
  }));

  const shiprocketStatusMap = new Map(
    srOrdersWithStatus.map(({ id, status, etd }) => [
      String(id),
      { status, etd },
    ]),
  );

  const updatedOrders = orders.map((order) => {
    const orderData = order.toObject ? order.toObject() : order;
    const matchingData =
      shiprocketStatusMap.get(String(orderData.order_id)) ||
      shiprocketStatusMap.get(String(orderData._id));

    return {
      ...orderData,
      status: matchingData?.status || orderData.status,
      etd: matchingData?.etd ?? orderData.etd,
    };
  });

  return updatedOrders;
};
