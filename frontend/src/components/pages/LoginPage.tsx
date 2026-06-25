import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Auth } from '../../api/auth';

export default function LoginPage() {
  const { user } = useStore();

  const { loginWithGoogle, sendPhoneOtp, loginWithPhone, adminLogin } = Auth();
  const [tab, setTab] = useState<'patron' | 'admin'>('patron');

  const [patronName, setPatronName] = useState('');
  const [patronPhone, setPatronPhone] = useState('');
  const [patronOtp, setPatronOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const formatIndianPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    let normalized = digits;

    if (normalized.startsWith('0')) {
      normalized = normalized.slice(1);
    }
    if (normalized.startsWith('91')) {
      normalized = normalized.slice(2);
    }

    normalized = normalized.slice(0, 10);
    return `+91 ${normalized}`;
  };

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
                  {user.role === 'admin' ? 'Admin' : 'Patron'} Portal
                </h1>
                <p className="text-xs text-gold-100/70 mt-1">
                  Access your orders, wishlist & exclusive privileges
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
                to={user.role === 'admin' ? '/admin' : '/'}
                className="inline-block mt-4 py-2 px-4 rounded-xl bg-maroon-900 text-gold-100 text-sm font-bold hover:bg-maroon-800 transition-colors cursor-pointer"
              >
                {user.role === 'admin' ? 'Admin Dashboard' : 'Home'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
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
              <p className="text-xs text-gold-100/70 mt-1">
                Access your orders, wishlist & exclusive privileges
              </p>
            </div>
          </div>

          <div className="p-6">
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
                  <form
                    className="space-y-4"
                    onSubmit={(e) => e.preventDefault()}
                  >
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
                        placeholder=""
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={patronPhone}
                        onChange={(e) =>
                          setPatronPhone(formatIndianPhone(e.target.value))
                        }
                        className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
                        placeholder="+91 XXXXXXXXXX"
                      />
                    </div>
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={async () => {
                          setSendingOtp(true);
                          try {
                            await sendPhoneOtp(patronPhone);
                            setOtpSent(true);
                          } catch (error) {
                            console.error('Send OTP failed', error);
                          }
                          setSendingOtp(false);
                        }}
                        className="w-full py-3.5 rounded-xl bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-md"
                      >
                        {sendingOtp ? 'Sending OTP…' : 'Send OTP'}
                      </button>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                            Enter OTP
                          </label>
                          <input
                            type="text"
                            required
                            value={patronOtp}
                            onChange={(e) => setPatronOtp(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
                            placeholder="123456"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            setVerifyingOtp(true);
                            try {
                              await loginWithPhone(
                                patronName,
                                patronPhone,
                                patronOtp,
                              );
                            } catch (error) {
                              console.error('OTP verify failed', error);
                            }
                            setVerifyingOtp(false);
                          }}
                          className="w-full py-3.5 rounded-xl bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-md"
                        >
                          {verifyingOtp
                            ? 'Verifying OTP…'
                            : 'Verify OTP & Sign In'}
                        </button>
                      </>
                    )}
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
    </div>
  );
}
