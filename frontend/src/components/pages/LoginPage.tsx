import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Auth } from '../../api/auth';

export default function LoginPage() {
  const { user, navigateTo } = useStore();
  const { loginWithGoogle, adminLogin, logout } = Auth();
  const [tab, setTab] = useState<'patron' | 'admin'>('patron');

  const [patronName, setPatronName] = useState('');
  const [patronEmail, setPatronEmail] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

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
                Hamsini Patron Portal
              </h1>
              <p className="text-xs text-gold-100/70 mt-1">
                Access your orders, wishlist & exclusive privileges
              </p>
            </div>
          </div>

          <div className="p-6">
            {user.loggedIn ? (
              /* ── LOGGED IN STATE ── */
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
                  <button
                    onClick={() =>
                      user.role === 'admin'
                        ? navigateTo('admin')
                        : navigateTo('shop')
                    }
                    className="py-3 rounded-xl bg-maroon-900 text-gold-100 text-sm font-bold hover:bg-maroon-800 transition-colors cursor-pointer"
                  >
                    {user.role === 'admin' ? 'Go to Admin' : 'Shop Now'}
                  </button>
                  {user.role === 'customer' && (
                    <button
                      onClick={() => navigateTo('my-orders')}
                      className="py-3 rounded-xl bg-gold-500 text-white text-sm font-bold hover:bg-gold-600 transition-colors cursor-pointer"
                    >
                      My Orders
                    </button>
                  )}
                  <button
                    onClick={logout}
                    className="py-3 rounded-xl border-2 border-gold-200 text-maroon-900 text-sm font-bold hover:bg-gold-50 transition-colors cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              /* ── LOGIN FORM ── */
              <div>
                {/* Tab switcher */}
                <div className="flex bg-maroon-50 rounded-xl p-1 mb-5">
                  <button
                    onClick={() => setTab('patron')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      tab === 'patron'
                        ? 'bg-white shadow text-maroon-900'
                        : 'text-maroon-600 hover:text-maroon-800'
                    }`}
                  >
                    👑 Patron Login
                  </button>
                  <button
                    onClick={() => setTab('admin')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      tab === 'admin'
                        ? 'bg-white shadow text-maroon-900'
                        : 'text-maroon-600 hover:text-maroon-800'
                    }`}
                  >
                    ⚙️ Admin Login
                  </button>
                </div>

                {tab === 'patron' ? (
                  <>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={patronName}
                          onChange={(e) => setPatronName(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={patronEmail}
                          onChange={(e) => setPatronEmail(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
                        />
                      </div>
                      <div className="bg-gold-50 rounded-xl p-3 text-xs text-maroon-800 border border-gold-200">
                        💡 <strong>Demo mode:</strong> Any email works. No real
                        authentication required.
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-md"
                      >
                        Sign In as Patron
                      </button>
                    </form>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={async () => loginWithGoogle()}
                        className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-3"
                      >
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-1Ycipkw9Clm9nVFijD9N4jsF38AUOQAppg&s"
                          alt="Google"
                          className="h-4 w-4"
                        />
                        Sign in with Google
                      </button>
                    </div>
                  </>
                ) : (
                  <form className="space-y-4">
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
                    {/* password */}

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
                      orders, catalogue & media management.
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-white font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-md"
                      onClick={async (e) => {
                        e.preventDefault();
                        await adminLogin(adminEmail, adminPassword);
                      }}
                    >
                      Access Admin Panel
                    </button>
                  </form>
                )}

                <div className="text-center mt-4">
                  <button
                    onClick={() => navigateTo('home')}
                    className="text-xs text-maroon-600 hover:text-maroon-800 cursor-pointer underline"
                  >
                    Continue browsing as guest
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
