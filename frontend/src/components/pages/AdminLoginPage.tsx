import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Auth } from '../../api/auth';
import { useState } from 'react';

export default function AdminLoginPage() {
  const { user } = useStore();
  const { adminLogin } = Auth();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (user.loggedIn) {
    return (
      <div className="min-h-screen bg-[#fdf8f1] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gold-100 overflow-hidden">
            <div className="bg-gradient-to-br from-maroon-900 to-maroon-800 p-8 text-center relative overflow-hidden flex flex-col items-center">
              <div className="absolute inset-0 bg-mandala opacity-20 pointer-events-none" />
              <div className="relative z-10 p-2 rounded-xl inline-block mb-3">
                <img
                  src="/logo.png"
                  alt="Hamsini Silks Logo"
                  className="h-auto w-[160px] object-contain transition-transform duration-500 group-hover:scale-105 rounded"
                />
              </div>
              <div className="relative z-10">
                <h1 className="font-display text-2xl font-bold text-gold-200">
                  Admin Portal
                </h1>
                <p className="text-xs text-gold-100/70 mt-1">
                  Full dashboard access
                </p>
              </div>
            </div>
            <div className="p-6 text-center">
              <h3 className="font-display text-lg font-bold text-maroon-900">
                You are already logged in as {user.name}
              </h3>
              <p className="text-xs text-maroon-700/70 mt-1">
                Please log out to access the login page.
              </p>
              <Link
                to="/admin"
                className="inline-block mt-4 py-2 px-4 rounded-xl bg-maroon-900 text-gold-100 text-sm font-bold hover:bg-maroon-800 transition-colors cursor-pointer"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await adminLogin(adminEmail, adminPassword);
    } catch (error) {
      console.error('Admin login failed', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fdf8f1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gold-100 overflow-hidden">
          {/* Top banner */}
          <div className="bg-gradient-to-br from-maroon-900 to-maroon-800 p-8 text-center relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 bg-mandala opacity-20 pointer-events-none" />
            <div className="relative z-10 p-2 rounded-xl inline-block mb-3">
              <Link
                to="/"
                className="flex items-center gap-2 sm:gap-3 group text-left cursor-pointer"
              >
                <img
                  src="/logo.png"
                  alt="Hamsini Silks Logo"
                  className="h-auto w-[130px] object-contain transition-transform duration-500 group-hover:scale-105 rounded"
                />
              </Link>
            </div>
            <div className="relative z-10">
              <h1 className="font-display text-lg font-bold text-gold-200">
                Admin Access
              </h1>
              <p className="text-xs text-gold-100/70 mt-1">
                Full dashboard control & management
              </p>
            </div>
          </div>

          <div className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
                  placeholder="admin@hamsinisilks.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div className="bg-maroon-50 rounded-xl p-3 text-xs text-maroon-800 border border-gold-100">
                🔐 <strong>Admin access</strong> unlocks full dashboard —
                orders, catalogue, media & promoter management.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-gold-300 text-white font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-md"
              >
                {isLoading ? 'Accessing Panel...' : 'Access Admin Panel'}
              </button>
            </form>

            <div className="text-center mt-6 space-y-2">
              <p className="text-xs text-maroon-600">Not an admin?</p>
              <div className="flex gap-2 justify-center">
                <Link
                  to="/login"
                  className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-semibold"
                >
                  👑 Patron Login
                </Link>
                <span className="text-xs text-maroon-400">•</span>
                <Link
                  to="/login"
                  className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-semibold"
                >
                  🎯 Promoter Login
                </Link>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link
                to="/"
                className="text-xs text-maroon-600 hover:text-maroon-800 cursor-pointer underline"
              >
                Continue browsing as guest
              </Link>
            </div>

            <div id="recaptcha-container" />
          </div>
        </div>
      </div>
    </div>
  );
}
