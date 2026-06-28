import { printInvoice, statusIcon, statusMap } from '@/utils/orderUtils';
import { useState } from 'react';
import { Icon } from './Icons';
import { OrderData } from '@/types';

// ── PrintInvoice Button Component ────────────────────────────────────────────────
function PrintInvoice({ order }: { order: OrderData }) {
  return (
    <button
      onClick={() => printInvoice(order)}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-maroon-900 text-gold-100 rounded-lg text-[10px] font-bold hover:bg-maroon-800 transition-colors cursor-pointer shrink-0 shadow-sm"
    >
      <Icon.print /> Print Invoice
    </button>
  );
}

export default function OrderRow({
  order,
  onStatusChange,
}: {
  order: OrderData;
  onStatusChange: (id: string, s: OrderData['status']) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statuses: OrderData['status'][] = [
    'Pending',
    'Processing',
    'Dispatched',
    'Delivered',
  ];

  return (
    <div
      className={`bg-white rounded-2xl border border-gold-100 shadow-xs overflow-hidden transition-all ${expanded ? 'shadow-md' : ''}`}
    >
      <div
        className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 cursor-pointer hover:bg-maroon-50/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-[110px]">
          <span className="font-display text-sm font-bold text-maroon-900 block">
            #{order._id}
          </span>
          <span className="text-[11px] text-maroon-700/60">
            {new Date(order.order_date).toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
            })}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-maroon-900 block truncate">
            {order.shipping_name}
          </span>
          <span className="text-[11px] text-maroon-700/70 truncate block">
            {order.shipping_email} | {order.shipping_phone}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          {order.items.slice(0, 2).map((item, i) => (
            <img
              key={i}
              src={item.image}
              alt=""
              className="w-8 h-10 object-cover rounded-lg border border-gold-100"
            />
          ))}
          {order.items.length > 2 && (
            <span className="text-xs text-maroon-700 font-medium">
              +{order.items.length - 2}
            </span>
          )}
        </div>
        <div className="min-w-[90px] text-right hidden sm:block">
          <span className="font-display text-sm font-bold text-maroon-900">
            ₹{order.total.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-maroon-700/60 block">
            {order.paymentMethod}
          </span>
        </div>
        <div className="min-w-[110px]">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusMap[order.status]}`}
          >
            {statusIcon[order.status]} {order.status}
          </span>
        </div>
        {/* Print button always visible */}
        <PrintInvoice order={order} />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`w-4 h-4 text-maroon-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-gold-100 p-4 animate-fadeIn">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider">
                Delivery Details
              </h4>
              <div className="bg-maroon-50 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Name:
                  </span>
                  <span className="font-semibold text-maroon-900">
                    {order.shipping_name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Email:
                  </span>
                  <span className="text-maroon-900">
                    {order.shipping_email}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Phone:
                  </span>
                  <span className="text-maroon-900">
                    {order.shipping_phone}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Address:
                  </span>
                  <span className="text-maroon-900 leading-relaxed">
                    {order.shipping_address} {order.shipping_city},{' '}
                    {order.shipping_state} - {order.shipping_pincode}
                  </span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider pt-1">
                Items
              </h4>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gold-100"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-12 object-cover rounded-lg border border-gold-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-maroon-900 block truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-maroon-700/70">
                        {item.category} · Qty: {item.units} · Size: {item.size}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-maroon-900 shrink-0">
                      ₹
                      {(item.selling_price * item.units).toLocaleString(
                        'en-IN',
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
                Update Status
              </h4>
              <div className="space-y-2">
                {statuses.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onStatusChange(order.order_id ?? '', s)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2 ${
                      order.status === s
                        ? 'border-maroon-900 bg-maroon-900 text-white shadow-md'
                        : 'border-gold-100 hover:border-gold-300 text-maroon-900 bg-white'
                    }`}
                  >
                    <span className="text-base">{statusIcon[s]}</span>
                    <span>{s}</span>
                    {order.status === s && <Icon.check />}
                  </button>
                ))}
              </div>
              <div className="mt-4 bg-gold-50 rounded-xl p-3 border border-gold-200">
                <div className="text-xs font-bold text-maroon-900 mb-1">
                  Summary
                </div>
                <div className="flex justify-between text-xs text-maroon-800">
                  <span>Items:</span>
                  <span className="font-bold">
                    {order.items.reduce((a, b) => a + b.units, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-maroon-800">
                  <span>Payment:</span>
                  <span className="font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-maroon-900 mt-2 pt-2 border-t border-gold-200">
                  <span>Total:</span>
                  <span>₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
