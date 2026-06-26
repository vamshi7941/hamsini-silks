import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PromoterApi } from '@/api/promoters';
import GuestUser from '../guestUser';
import AccessDenied from '../accessDenied';
import { Icon } from '../Icons';

export type PromoterStats = {
  fullName: string;
  phone: string;
  promoCodes: Array<{
    code: string;
    discountPercentage: number;
    isActive: boolean;
  }>;
  ordersCount: number;
  revenue: number;
  isActive: boolean;
};

export type PromoterOrderDetails = {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
  }>;
  total: number;
  discountApplied: number;
  originalTotal: number;
  promoCode: string | null;
  orderedDate: string;
};

export default function PromotersDashboard() {
  const hasFetchedStats = useRef(false);

  const { user, showToast } = useStore();
  const { getPromoterStats, getOwnPromoterOrders } = PromoterApi();

  const [stats, setStats] = useState<PromoterStats | null>(null);
  const [orders, setOrders] = useState<PromoterOrderDetails[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getPromoterStats(user._id || '');
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setLoading(false);
  };

  const loadOrders = async () => {
    if (!user._id) return;
    try {
      const data = await getOwnPromoterOrders(user._id);
      if (data) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  useEffect(() => {
    if (user._id) {
      if (!hasFetchedStats.current) {
        hasFetchedStats.current = true;
        loadStats();
        loadOrders();
      }
    }
  }, [user._id]);

  const filteredOrders = orders.filter((order) => {
    const searchValue = orderSearch.toLowerCase();
    const matchesSearch =
      order._id.toLowerCase().includes(searchValue) ||
      order.customerName.toLowerCase().includes(searchValue) ||
      (order.promoCode || '').toLowerCase().includes(searchValue);
    const matchesFilter = orderFilter === 'All' || order.status === orderFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Dispatched':
        return 'bg-blue-100 text-blue-700';
      case 'Processing':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-rose-100 text-rose-700';
    }
  };

  if (!user.loggedIn) return <GuestUser page="promoter" />;
  if (user.role !== 'promoter') return <AccessDenied page="promoter" />;

  return (
    <div className="min-h-screen bg-[#f5ede3] flex flex-col">
      <header className="bg-white border-b border-gold-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div>
          <h1 className="font-display text-lg md:text-xl font-bold text-maroon-900">
            Promoter Dashboard
          </h1>
          <p className="text-xs text-maroon-700/60 hidden sm:block mt-0.5">
            Welcome, {user.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadStats();
              loadOrders();
            }}
            className="p-2 rounded-full hover:bg-maroon-50 text-maroon-700 cursor-pointer"
            title="Refresh"
          >
            <Icon.refresh2 />
          </button>
          <div className="flex items-center gap-2 bg-maroon-50 rounded-full pl-2 pr-3 py-1.5">
            <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-display font-bold text-xs flex items-center justify-center">
              {user.name?.[0] ?? 'P'}
            </div>
            <span className="text-xs font-semibold text-maroon-900 hidden sm:block max-w-[120px] truncate">
              {user.name}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-auto admin-scroll">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin">
                <Icon.loader />
              </div>
              <p className="mt-2 text-maroon-700">Loading your dashboard...</p>
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gold-100 p-6 shadow-xs hover:shadow-md transition-shadow md:col-span-2">
                <div>
                  <p className="text-xs font-semibold text-maroon-700/70 mb-3">
                    YOUR PROMO CODES
                  </p>
                  <div className="flex overflow-x-auto gap-2">
                    {stats.promoCodes.map((pc) => (
                      <div
                        key={pc.code}
                        className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3"
                      >
                        <p className="font-mono font-bold text-blue-600 text-sm">
                          {pc.code}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {pc.discountPercentage}% Off
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gold-100 p-6 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-maroon-700/70 mb-1">
                        TOTAL ORDERS
                      </p>
                      <p className="font-display text-2xl font-bold text-maroon-900">
                        {stats.ordersCount}
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        Orders placed with your codes
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                      📦
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gold-100 p-6 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-maroon-700/70 mb-1">
                      TOTAL REVENUE
                    </p>
                    <p className="font-display text-2xl font-bold text-maroon-900">
                      ₹{stats.revenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      Generated revenue
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                    💰
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gold-100 p-6 shadow-xs">
              <h2 className="font-display text-lg font-bold text-maroon-900 mb-4">
                Your Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gold-100">
                  <span className="text-sm font-semibold text-maroon-700/70">
                    Name:
                  </span>
                  <span className="text-sm font-medium text-maroon-900">
                    {stats.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gold-100">
                  <span className="text-sm font-semibold text-maroon-700/70">
                    Phone:
                  </span>
                  <span className="text-sm font-medium text-maroon-900">
                    {stats.phone}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-maroon-700/70">
                    Status:
                  </span>
                  {stats.isActive ? (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gold-100 p-6 shadow-xs">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-maroon-900">
                      Orders placed with your promo codes
                    </h2>
                    <p className="text-sm text-maroon-700">
                      Showing {filteredOrders.length} of {orders.length} order
                      {orders.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="relative w-full md:w-72">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-400">
                      <Icon.search />
                    </span>
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search order ID or customer…"
                      className="w-full pl-9 pr-4 py-2 border border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'All',
                    'Pending',
                    'Processing',
                    'Dispatched',
                    'Delivered',
                  ].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOrderFilter(filter)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${orderFilter === filter ? 'bg-maroon-900 text-gold-200' : 'bg-maroon-50 text-maroon-900 hover:bg-maroon-100'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-gold-100 bg-gold-50 p-8 text-center text-sm text-maroon-900">
                  No matching orders found for your promo codes yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const isExpanded = expandedOrders.includes(order._id);

                    return (
                      <div
                        key={order._id}
                        className={`rounded-2xl border border-gold-100 bg-[#fdf8f1] shadow-xs overflow-hidden transition-all ${isExpanded ? 'shadow-md' : ''}`}
                      >
                        <div
                          className="flex flex-nowrap items-center justify-between gap-4 p-4 cursor-pointer hover:bg-maroon-50/30 transition-colors"
                          onClick={() => {
                            setExpandedOrders((current) =>
                              current.includes(order._id)
                                ? current.filter((id) => id !== order._id)
                                : [...current, order._id],
                            );
                          }}
                        >
                          <div className="min-w-[110px]">
                            <span className="font-display text-sm font-bold text-maroon-900 block whitespace-nowrap">
                              #{order._id}
                            </span>
                            <span className="text-[11px] text-maroon-700/60">
                              {new Date(order.orderedDate).toLocaleDateString(
                                'en-IN',
                              )}
                            </span>
                          </div>
                          <div className="hidden sm:flex items-center flex-1 min-w-0">
                            <span className="font-semibold text-sm text-maroon-900 block truncate">
                              {order.customerName}
                            </span>
                            <span className="text-[11px] text-maroon-700/70 truncate block">
                              {order.phone} · {order.email}
                            </span>
                          </div>
                          <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
                            <div className="rounded-full bg-maroon-100 px-2.5 py-1 text-[10px] font-semibold text-maroon-800">
                              {order.items.length} item
                              {order.items.length === 1 ? '' : 's'}
                            </div>
                            <div className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                              {order.promoCode || 'No code'}
                            </div>
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
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusClasses(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className={`w-4 h-4 text-maroon-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-gold-100 p-4 animate-fadeIn">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider">
                                  Delivery Details
                                </h4>
                                <div className="bg-white rounded-xl p-3 text-xs space-y-1.5 border border-gold-100">
                                  <div className="flex gap-2">
                                    <span className="text-maroon-700/70 w-16 shrink-0">
                                      Name:
                                    </span>
                                    <span className="font-semibold text-maroon-900">
                                      {order.customerName}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-maroon-700/70 w-16 shrink-0">
                                      Email:
                                    </span>
                                    <span className="text-maroon-900">
                                      {order.email}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-maroon-700/70 w-16 shrink-0">
                                      Phone:
                                    </span>
                                    <span className="text-maroon-900">
                                      {order.phone}
                                    </span>
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
                                  {order.items.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gold-100"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-maroon-900 block truncate">
                                          {item.name}
                                        </span>
                                        <span className="text-[10px] text-maroon-700/70">
                                          Size: {item.size} · Qty:{' '}
                                          {item.quantity}
                                        </span>
                                      </div>
                                      <span className="text-xs font-bold text-maroon-900 shrink-0">
                                        ₹
                                        {(
                                          item.price * item.quantity
                                        ).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
                                  Order Summary
                                </h4>
                                <div className="bg-gold-50 rounded-xl p-3 border border-gold-200 space-y-2 text-sm text-maroon-800">
                                  <div className="flex justify-between">
                                    <span>Promo Code</span>
                                    <span className="font-semibold text-maroon-900">
                                      {order.promoCode || 'None'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Status</span>
                                    <span className="font-semibold text-maroon-900">
                                      {order.status}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Payment</span>
                                    <span className="font-semibold text-maroon-900">
                                      {order.paymentMethod}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-gold-200">
                                    <span>Original Total</span>
                                    <span className="font-semibold text-maroon-900">
                                      ₹
                                      {order.originalTotal.toLocaleString(
                                        'en-IN',
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Discount</span>
                                    <span className="font-semibold text-green-700">
                                      -₹
                                      {order.discountApplied.toLocaleString(
                                        'en-IN',
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-base font-bold text-maroon-900 pt-2 border-t border-gold-200">
                                    <span>Total</span>
                                    <span>
                                      ₹{order.total.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <h2 className="font-display text-lg font-bold text-blue-900 mb-3">
                📢 Share Your Promo Codes
              </h2>
              <p className="text-sm text-blue-800 mb-4">
                Share your promo codes with customers to earn through sales with
                your codes.
              </p>
              <div className="space-y-2">
                {stats.promoCodes.map((pc) => (
                  <div key={pc.code} className="flex gap-2">
                    <input
                      type="text"
                      value={`${pc.code} - ${pc.discountPercentage}% off`}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-mono text-blue-600"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pc.code);
                        showToast(`"${pc.code}" copied!`, 'success');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-maroon-700">Failed to load dashboard</p>
              <button
                onClick={loadStats}
                className="mt-4 px-4 py-2 bg-maroon-900 text-white rounded-lg font-semibold hover:bg-maroon-800 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
