import { OrderData, OrderStatus } from '@/types';

export const orderStatuses: OrderStatus[] = [
  'NEW',
  'READY TO PACK',
  'PACKED',
  'PICKLISTED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURN PENDING',
  'RETURNED',
];

// ── Status Icons & Maps ────────────────────────────────────────────────────────
export const statusIcon: Record<OrderStatus, string> = {
  NEW: '⏳',
  'READY TO PACK': '📦',
  PACKED: '📦',
  PICKLISTED: '🗂️',
  SHIPPED: '🚚',
  DELIVERED: '✅',
  CANCELLED: '❌',
  'RETURN PENDING': '↩️',
  RETURNED: '📥',
};

export const statusMap: Record<OrderStatus, string> = {
  NEW: 'status-new',
  'READY TO PACK': 'status-ready-to-pack',
  PACKED: 'status-packed',
  PICKLISTED: 'status-picklisted',
  SHIPPED: 'status-shipped',
  DELIVERED: 'status-delivered',
  CANCELLED: 'status-cancelled',
  'RETURN PENDING': 'status-return-pending',
  RETURNED: 'status-returned',
};

export type OrderRoadmapPoint = {
  status: OrderStatus;
  icon: string;
  state: 'complete' | 'current' | 'upcoming';
};

const roadmapBase: OrderStatus[] = [
  'NEW',
  'READY TO PACK',
  'PACKED',
  'PICKLISTED',
  'SHIPPED',
  'DELIVERED',
];

export const getOrderRoadmap = (
  currentStatus: OrderStatus,
): {
  current: OrderStatus;
  percentage: number;
  stages: OrderRoadmapPoint[];
} => {
  const terminalStatuses: OrderStatus[] = [
    'CANCELLED',
    'RETURN PENDING',
    'RETURNED',
  ];
  const finalStatus = terminalStatuses.includes(currentStatus)
    ? currentStatus
    : 'DELIVERED';

  const roadmapStatuses = [...roadmapBase.slice(0, -1), finalStatus];
  const activeIndex = roadmapStatuses.findIndex(
    (status) => status === currentStatus,
  );

  return {
    current: currentStatus,
    percentage:
      activeIndex <= 0 ? 0 : (activeIndex / (roadmapStatuses.length - 1)) * 100,
    stages: roadmapStatuses.map((status, index) => ({
      status,
      icon: statusIcon[status],
      state:
        index < activeIndex
          ? 'complete'
          : index === activeIndex
            ? 'current'
            : 'upcoming',
    })),
  };
};

export const normalizeShiprocketStatus = (
  rawStatus: string | undefined,
): OrderStatus | undefined => {
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

// ── Print Invoice Function ────────────────────────────────────────────────────
const getStatusBadgeStyles = (status: OrderStatus) => {
  switch (status) {
    case 'NEW':
      return { background: '#fef3c7', color: '#92400e' };
    case 'READY TO PACK':
      return { background: '#e2e8f0', color: '#1e293b' };
    case 'PACKED':
      return { background: '#dbeafe', color: '#1e40af' };
    case 'PICKLISTED':
      return { background: '#e0e7ff', color: '#3730a3' };
    case 'SHIPPED':
      return { background: '#dbeafe', color: '#1e40af' };
    case 'DELIVERED':
      return { background: '#d1fae5', color: '#065f46' };
    case 'CANCELLED':
      return { background: '#fee2e2', color: '#b91c1c' };
    case 'RETURN PENDING':
      return { background: '#ffedd5', color: '#c2410c' };
    case 'RETURNED':
      return { background: '#ede9fe', color: '#6d28d9' };
    default:
      return { background: '#f8fafc', color: '#0f172a' };
  }
};

export const printInvoice = (order: OrderData) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.units}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.size}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${i.selling_price.toLocaleString('en-IN')}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${(i.selling_price * i.units).toLocaleString('en-IN')}</td></tr>`,
    )
    .join('');

  printWindow.document.write(`
    <html><head><title>Hamsini Invoice #${order._id}</title>
    <style>
      body { font-family: 'Inter',Arial,sans-serif; background:#fff; color:#3d0e0a; max-width:700px; margin:40px auto; padding:30px; }
      .header { text-align:center; border-bottom:2px solid #d97706; padding-bottom:20px; margin-bottom:20px; }
      .header h1 { font-size:28px; margin:0; font-weight:700; }
      .header p { color:#8a3b0c; margin:2px 0 0; font-size:13px; }
      .details { display:flex; justify-content:space-between; margin-bottom:20px; font-size:13px; }
      .details .col { background:#fdf4f2; padding:12px 16px; border-radius:12px; flex:1; }
      .details .col:first-child { margin-right:12px; }
      .details strong { display:block; margin-bottom:4px; }
      table { width:100%; border-collapse:collapse; margin-bottom:20px; }
      th { background:#3d0e0a; color:#fdf9ed; padding:10px; text-align:left; font-size:12px; }
      td { font-size:13px; }
      .total { text-align:right; font-size:16px; font-weight:700; margin-top:20px; border-top:2px solid #d97706; padding-top:12px; }
      .footer { text-align:center; margin-top:30px; font-size:11px; color:#8a3b0c; border-top:1px solid #eee; padding-top:15px; }
      .status { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; }
      .badge { display:inline-block; background:#3d0e0a; color:#fdf9ed; padding:2px 10px; border-radius:20px; font-size:10px; }
      @media print { body { margin:0; padding:20px; } }
    </style></head><body>
      <div class="header">
        <h1>🪷 HAMSINI SILKS</h1>
        <p>◆ SILKS OF HERITAGE ◆</p>
        <p style="font-size:12px;color:#666">No.42, Silk Road, T.Nagar, Chennai – 600017</p>
      </div>
      <div class="details">
        <div class="col">
          <strong>Order #${order._id}</strong>
          ${order.order_date} · <span class="status" style="background:${getStatusBadgeStyles(order.status).background};color:${getStatusBadgeStyles(order.status).color}">${statusIcon[order.status]} ${order.status}</span>
        </div>
        <div class="col">
          <strong>Shipping To</strong>
          ${order.shipping_name}<br>${order.shipping_email}<br>${order.shipping_phone}<br>${order.shipping_address}
        </div>
      </div>
      <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:center">Size</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table>
      <div class="total">Total: ₹${order.total.toLocaleString('en-IN')}<br><span style="font-size:12px;font-weight:400">via ${order.paymentMethod}</span></div>
      <p style="font-size:12px">🛡️ Certified pure mulberry silk · Silk Mark registered</p>
      <div class="footer">॥ वस्त्रं तेजः ॥ &nbsp; A drape is a blessing.<br>© Hamsini Silks · Thank you for your patronage</div>
      <script>
        setTimeout(() => { window.print(); }, 300);
      </script>
    </body></html>
  `);
  printWindow.document.close();
};
