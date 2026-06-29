import { useStore } from '@/context/StoreContext';
import { statusMap } from '@/utils/orderUtils';
import { Icon } from '../Icons';
import { useNavigate } from 'react-router-dom';
import { AdminTab } from '../pages/AdminDashboard';
import { OrderData } from '@/types';

function StatCard({
  label,
  value,
  sub,
  color,
  emoji,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  emoji: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 text-white relative overflow-hidden ${color} shadow-lg`}
    >
      <div className="absolute -right-4 -top-4 text-6xl opacity-10 select-none">
        {emoji}
      </div>
      <div className="text-3xl font-bold font-display mb-1">{value}</div>
      <div className="text-sm font-semibold opacity-90">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
  );
}

export default function Overview({
  setActiveTab,
  setShowAddModal,
}: {
  setActiveTab: (tab: AdminTab) => void;
  setShowAddModal: (show: boolean) => void;
}) {
  const { orders, products } = useStore();
  const navigate = useNavigate();

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'NEW').length;
  const dispatchedOrders = orders.filter(
    (o) =>
      o.status === 'SHIPPED' ||
      o.status === 'PACKED' ||
      o.status === 'PICKLISTED',
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₹${(totalRevenue / 1000).toFixed(0)}K`}
          sub="All time"
          color="bg-gradient-to-br from-maroon-800 to-maroon-900"
          emoji="💰"
        />
        <StatCard
          label="Orders"
          value={orders.length}
          sub={`${pendingOrders} pending`}
          color="bg-gradient-to-br from-blue-700 to-blue-900"
          emoji="📦"
        />
        <StatCard
          label="Dispatched"
          value={dispatchedOrders}
          sub="In transit"
          color="bg-gradient-to-br from-emerald-700 to-emerald-900"
          emoji="🚚"
        />
        <StatCard
          label="SKUs"
          value={products.length}
          sub="In catalogue"
          color="bg-gradient-to-br from-gold-600 to-gold-700"
          emoji="🪷"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gold-100 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-base font-bold text-maroon-900">
              Recent Orders
            </h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs text-gold-600 font-bold hover:text-gold-700 cursor-pointer"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((o: OrderData, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-maroon-50/40 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-maroon-100 text-maroon-800 font-bold text-sm flex items-center justify-center shrink-0">
                  {o.shipping_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-maroon-900 block truncate">
                    {o.shipping_name}
                  </span>
                  <span className="text-[11px] text-maroon-700/60">
                    #{o.order_id}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-maroon-900 block">
                    ₹{o.total.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusMap[o.status]}`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gold-100 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-base font-bold text-maroon-900">
              Top Catalogue
            </h3>
            <button
              onClick={() => setActiveTab('catalogue')}
              className="text-xs text-gold-600 font-bold cursor-pointer"
            >
              Manage →
            </button>
          </div>
          <div className="space-y-3">
            {products.slice(0, 4).map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-maroon-50/30 transition-colors"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-10 h-12 object-cover rounded-lg border border-gold-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-maroon-900 block truncate">
                    {p.name}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Icon.star />
                    <span className="text-[10px] text-maroon-700/70">
                      {p.rating}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-maroon-900 shrink-0">
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gold-500 text-white rounded-xl text-sm font-bold hover:bg-gold-400 transition-colors cursor-pointer shadow"
        >
          ➕ Add New Saree
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors cursor-pointer shadow"
        >
          📦 View Orders
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors cursor-pointer shadow"
        >
          🖼️ Media Studio
        </button>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-maroon-900 text-gold-200 rounded-xl text-sm font-bold hover:bg-maroon-800 transition-colors cursor-pointer shadow"
        >
          🏪 View Store
        </button>
      </div>
    </div>
  );
}
