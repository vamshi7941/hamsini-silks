import { useStore } from '../../context/StoreContext';
import { Order } from '../../context/StoreContext';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icons';
import { statusIcon, statusMap, printInvoice } from '../../utils/orderUtils';
import { CustomerApi } from '@/api/customer';
import GuestUser from '../guestUser';
import AccessDenied from '../accessDenied';

function PrintInvoice({ order }: { order: Order }) {
  return (
    <button
      onClick={() => printInvoice(order)}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-maroon-900 text-gold-100 rounded-lg text-[10px] font-bold hover:bg-maroon-800 transition-colors cursor-pointer shrink-0 shadow-sm"
    >
      <Icon.print /> Print Invoice
    </button>
  );
}

function OrderRow({ order: order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

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
            {order.orderedDate}
          </span>
        </div>
        <div className="flex-1 min-w-0" />
        <div className="hidden sm:flex items-center gap-1.5">
          {order.items.slice(0, 2).map((item, i) => (
            <img
              key={i}
              src={item.product.image}
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
                    {order.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Email:
                  </span>
                  <span className="text-maroon-900">{order.email}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Phone:
                  </span>
                  <span className="text-maroon-900">{order.phone}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-maroon-700/70 w-16 shrink-0">
                    Address:
                  </span>
                  <span className="text-maroon-900 leading-relaxed">
                    {order.address}
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
                      src={item.product.image}
                      alt=""
                      className="w-10 h-12 object-cover rounded-lg border border-gold-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-maroon-900 block truncate">
                        {item.product.name}
                      </span>
                      <span className="text-[10px] text-maroon-700/70">
                        {item.product.category} · Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-maroon-900 shrink-0">
                      ₹
                      {(item.product.price * item.quantity).toLocaleString(
                        'en-IN',
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
                Order Summary
              </h4>
              <div className="h-[130px] bg-gold-50 rounded-xl p-3 border border-gold-200">
                <div className="text-xs font-bold text-maroon-900 mb-1">
                  Summary
                </div>
                <div className="flex justify-between text-xs text-maroon-800">
                  <span>Items:</span>
                  <span className="font-bold">
                    {order.items.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-maroon-800">
                  <span>Payment:</span>
                  <span className="font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-maroon-900 mt-4 pt-4 border-t border-gold-200">
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

export default function MyOrdersPage() {
  const { user, imagesLoaded } = useStore();
  const { fetchMyOrders } = CustomerApi();
  const hasFetchedOrders = useRef(false);

  const [orders, setMyOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');

  useEffect(() => {
    if (!imagesLoaded) return;

    const getMyOrders = async () => {
      if (hasFetchedOrders.current) return;
      hasFetchedOrders.current = true;
      const orders = await fetchMyOrders();
      setMyOrders(orders);
    };

    if (user.loggedIn && user.role === 'customer') getMyOrders();
  }, [imagesLoaded]);

  const filteredOrders = orders.filter((o) => {
    const ms =
      o.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o._id.includes(orderSearch);
    const mf = orderFilter === 'All' || o.status === orderFilter;
    return ms && mf;
  });

  if (!user.loggedIn) return <GuestUser page="my-orders" />;
  if (user.role !== 'customer') return <AccessDenied page="my-orders" />;

  return (
    <div className="min-h-screen bg-[#fdf8f1] py-8 sm:py-12 lg:py-16 lg:pt-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-2">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-maroon-900 mb-2">
            My Orders
          </h1>
          <p className="text-maroon-700 text-sm sm:text-base">
            Welcome back,{' '}
            <span className="font-semibold text-maroon-900">{user.name}</span>!
            Track and manage your purchases
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-4 border border-gold-100 shadow-xs flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-400">
                  <Icon.search />
                </span>
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order ID…"
                  className="w-full pl-9 pr-4 py-2 border border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'All',
                  'Pending',
                  'Processing',
                  'Dispatched',
                  'Delivered',
                ].map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setOrderFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${orderFilter === f ? 'bg-maroon-900 text-gold-200' : 'bg-maroon-50 text-maroon-900 hover:bg-maroon-100'}`}
                  >
                    {f}{' '}
                    {f !== 'All' &&
                      `(${orders.filter((o) => o.status === f).length})`}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gold-100">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-semibold text-maroon-900">
                    No orders found
                  </p>
                  <p className="text-xs text-maroon-700/60 mt-1">
                    Try adjusting your search or filter
                  </p>
                </div>
              ) : (
                filteredOrders.map((order, i) => (
                  <OrderRow key={i} order={order} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
