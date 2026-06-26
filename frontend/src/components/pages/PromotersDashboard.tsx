import { useEffect, useState } from 'react';
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
};

export default function PromotersDashboard() {
  const { user, showToast } = useStore();
  const { getPromoterStats } = PromoterApi();

  const [stats, setStats] = useState<PromoterStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user._id) {
      loadStats();
    }
  }, [user._id]);

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
            onClick={loadStats}
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
                  <div className="flex flex-wrap gap-2">
                    {stats.promoCodes.map((pc) => (
                      <div
                        key={pc.code}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3"
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
                <div className="pb-3 border-b border-gold-100">
                  <span className="text-sm font-semibold text-maroon-700/70 block mb-2">
                    Promo Codes:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {stats.promoCodes.map((pc) => (
                      <span
                        key={pc.code}
                        className="text-xs font-mono font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-lg"
                      >
                        {pc.code} ({pc.discountPercentage}%)
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-maroon-700/70">
                    Status:
                  </span>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
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
