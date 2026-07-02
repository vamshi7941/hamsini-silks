import { useStore } from '@/context/StoreContext';
import { Icon } from '../Icons';
import { AdminTab } from '../pages/AdminDashboard';
import { Auth } from '@/api/auth';
import { useNavigate } from 'react-router-dom';

export default function SideBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}) {
  const navigate = useNavigate();

  const { orders, products } = useStore();
  const { logout } = Auth();

  const sidebarItems: any = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Icon.dashboard,
      badge: orders.length,
    },
    { id: 'orders', label: 'Orders', icon: Icon.orders, badge: orders.length },
    {
      id: 'catalogue',
      label: 'Catalogue',
      icon: Icon.catalogue,
      badge: products.length,
    },
    { id: 'promoters', label: 'Promoters', icon: Icon.users },
    { id: 'site-customize', label: 'Site Customize', icon: Icon.catalogue },
  ];

  return (
    <aside className="w-16 md:w-60 admin-sidebar flex flex-col shrink-0 sticky top-0 h-screen z-40">
      <nav className="flex-1 px-2 md:px-3 py-4 space-y-1 overflow-y-auto admin-scroll">
        {sidebarItems.map((item: any, i: number) => (
          <button
            key={i}
            onClick={() => setActiveTab(item.id as AdminTab)}
            aria-label={item.label}
            title={item.label}
            className={`w-full flex items-center justify-center md:justify-start gap-3 px-2.5 md:px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative group ${
              activeTab === item.id
                ? 'bg-gold-500/20 text-gold-200 border border-gold-500/30'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon />
            <span className="hidden md:block">{item.label}</span>
            {item.badge !== undefined && (
              <span className="hidden md:flex ml-auto h-5 min-w-[20px] px-1 rounded-full bg-gold-500 text-maroon-900 text-[10px] font-bold items-center justify-center">
                {item.badge}
              </span>
            )}
            <span className="absolute left-full ml-2 bg-maroon-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg z-50 md:hidden">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
      <div className="px-2 md:px-3 pb-4 border-t border-white/10 pt-4 space-y-1">
        <button
          onClick={() => navigate('/')}
          aria-label="View Store"
          title="View Store"
          className="w-full flex items-center justify-center md:justify-start gap-3 px-2.5 md:px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer group relative"
        >
          <Icon.home />
          <span className="hidden md:block">View Store</span>
          <span className="absolute left-full ml-2 bg-maroon-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg z-50 md:hidden">
            View Store
          </span>
        </button>
        <button
          onClick={logout}
          aria-label="Logout"
          title="Logout"
          className="w-full flex items-center justify-center md:justify-start gap-3 px-2.5 md:px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer group relative"
        >
          <Icon.logout />
          <span className="hidden md:block">Logout</span>
          <span className="absolute left-full ml-2 bg-maroon-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg z-50 md:hidden">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
