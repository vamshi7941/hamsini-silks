import { Order } from '../context/StoreContext';

// ── Status Icons & Maps ────────────────────────────────────────────────────────
export const statusIcon: Record<string, string> = {
  Pending: '⏳',
  Processing: '⚙️',
  Dispatched: '🚚',
  Delivered: '✅',
};

export const statusMap: Record<string, string> = {
  Pending: 'status-pending',
  Processing: 'status-processing',
  Dispatched: 'status-dispatched',
  Delivered: 'status-delivered',
};

// ── Print Invoice Function ────────────────────────────────────────────────────
export const printInvoice = (order: Order) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${i.product.price.toLocaleString('en-IN')}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${(i.product.price * i.quantity).toLocaleString('en-IN')}</td></tr>`,
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
          ${order.orderedDate} · <span class="status" style="background:${order.status === 'Delivered' ? '#d1fae5' : order.status === 'Dispatched' ? '#dbeafe' : order.status === 'Processing' ? '#fef3c7' : '#fce6e3'};color:${order.status === 'Delivered' ? '#065f46' : order.status === 'Dispatched' ? '#1e40af' : order.status === 'Processing' ? '#92400e' : '#7e1c12'}">${statusIcon[order.status]} ${order.status}</span>
        </div>
        <div class="col">
          <strong>Shipping To</strong>
          ${order.name}<br>${order.email}<br>${order.phone}<br>${order.address}
        </div>
      </div>
      <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table>
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
