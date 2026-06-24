import { Auth } from '@/api/auth';
import { useStore } from '@/context/StoreContext';
import { Link } from 'react-router-dom';
import GuestUser from '../guestUser';

export default function ProfilePage() {
  const { user } = useStore();
  const { logout } = Auth();

  if (!user.loggedIn) return <GuestUser page="profile" />;

  return (
    <div className="min-h-screen bg-[#fdf8f1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gold-100 overflow-hidden">
          {/* Top banner */}
          <div className="bg-gradient-to-br from-maroon-900 to-maroon-800 p-8 text-center relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 bg-mandala opacity-20 pointer-events-none" />
            <div className="relative z-10 bg-white p-2 rounded-xl inline-block mb-3">
              <img
                src="https://storage.googleapis.com/a1aa/image/wM9tOQer8g4eQ1vVvL6P0m38d_UjL-R3Qj0rQpYw848.jpg"
                alt="Hamsini Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="relative z-10">
              <h1 className="font-display text-2xl font-bold text-gold-200">
                Hamsini {user.role === 'admin' ? 'Admin' : 'Patron'} Portal
              </h1>
              <p className="text-xs text-gold-100/70 mt-1">
                Access your orders, wishlist & exclusive privileges
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto font-display text-2xl font-bold text-maroon-800">
                {user.name?.[0] ?? 'P'}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-maroon-900">
                  {user.name}
                </h3>
                <p className="text-xs text-maroon-700/70">{user.email}</p>
                <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-maroon-100 text-maroon-800">
                  {user.role === 'admin'
                    ? '⚙️ Admin Access'
                    : '👑 Privileged Patron'}
                </span>
              </div>
              <div
                className={`grid gap-3 pt-2 ${user.role === 'admin' ? 'grid-cols-2' : 'grid-cols-3'}`}
              >
                <Link
                  to={user.role === 'admin' ? '/admin' : '/shop'}
                  className="py-3 rounded-xl bg-maroon-900 text-gold-100 text-sm font-bold hover:bg-maroon-800 transition-colors cursor-pointer text-center"
                >
                  {user.role === 'admin' ? 'Go to Admin' : 'Shop Now'}
                </Link>
                {user.role === 'customer' && (
                  <Link
                    to="/my-orders"
                    className="py-3 rounded-xl bg-gold-500 text-white text-sm font-bold hover:bg-gold-600 transition-colors cursor-pointer text-center"
                  >
                    My Orders
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="py-3 rounded-xl border-2 border-gold-200 text-maroon-900 text-sm font-bold hover:bg-gold-50 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
