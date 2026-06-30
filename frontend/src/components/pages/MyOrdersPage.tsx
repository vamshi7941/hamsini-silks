import { useStore } from '../../context/StoreContext';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icons';
import { isCustomerInTransitStatus } from '../../utils/orderUtils';
import { CustomerApi } from '@/api/customer';
import GuestUser from '../guestUser';
import AccessDenied from '../accessDenied';
import { OrderData } from '@/types';
import OrderRow from '../orderRow';

export default function MyOrdersPage() {
  const { user, imagesLoaded } = useStore();
  const { fetchMyOrders } = CustomerApi();
  const hasFetchedOrders = useRef(false);

  const [orders, setMyOrders] = useState<OrderData[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');

  useEffect(() => {
    if (!imagesLoaded || !user.loggedIn) return;

    const getMyOrders = async () => {
      if (hasFetchedOrders.current) return;
      hasFetchedOrders.current = true;
      const orders = await fetchMyOrders();
      const sortedOrders = orders?.sort(
        (a, b) =>
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime(),
      );
      setMyOrders(sortedOrders ?? []);
    };

    if (user.loggedIn && user.role === 'customer') getMyOrders();
  }, [imagesLoaded]);

  const filteredOrders = orders.filter((o) => {
    const ms =
      o.shipping_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o._id?.includes(orderSearch);
    const mf =
      orderFilter === 'All'
        ? true
        : orderFilter === 'IN_TRANSIT'
          ? isCustomerInTransitStatus(o.status)
          : o.status === orderFilter;
    return ms && mf;
  });

  if (!user.loggedIn) return <GuestUser page="my-orders" />;
  if (user.role !== 'customer') return <AccessDenied page="my-orders" />;

  return (
    <div className="min-h-screen bg-[#fdf8f1] py-8 sm:py-12 lg:py-16 lg:pt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-2">
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
              <div className="min-w-[220px] w-full sm:w-auto">
                <div className="relative">
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="w-full appearance-none bg-[#fffaf3] border border-gold-200 rounded-xl p-2 pr-10 text-sm font-semibold text-maroon-900 shadow-sm transition-all focus:outline-none focus:border-maroon-700 focus:ring-2 focus:ring-maroon-100"
                  >
                    <option value="All">All</option>
                    <option value="NEW">Ordered</option>
                    <option value="IN_TRANSIT">In transit</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURN PENDING">Return pending</option>
                    <option value="RETURNED">Returned</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-maroon-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
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
