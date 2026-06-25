import { useStore } from '@/context/StoreContext';
import { Icon } from '../Icons';
import { useState } from 'react';
import OrderRow from '../orderRow';
import { AdminApi } from '@/api/admin';

export default function Orders() {
  const { orders } = useStore();
  const { updateOrderStatus } = AdminApi();

  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');

  const filteredOrders = orders.filter((o) => {
    const ms =
      o.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o._id.includes(orderSearch);
    const mf = orderFilter === 'All' || o.status === orderFilter;
    return ms && mf;
  });
  return (
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
            placeholder="Search name or order ID…"
            className="w-full pl-9 pr-4 py-2 border border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'Processing', 'Dispatched', 'Delivered'].map(
            (f, i) => (
              <button
                key={i}
                onClick={() => setOrderFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${orderFilter === f ? 'bg-maroon-900 text-gold-200' : 'bg-maroon-50 text-maroon-900 hover:bg-maroon-100'}`}
              >
                {f}{' '}
                {f !== 'All' &&
                  `(${orders.filter((o) => o.status === f).length})`}
              </button>
            ),
          )}
        </div>
      </div>
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gold-100">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold text-maroon-900">No orders found</p>
            <p className="text-xs text-maroon-700/60 mt-1">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          filteredOrders.map((order, i) => (
            <OrderRow
              key={i}
              order={order}
              onStatusChange={updateOrderStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
