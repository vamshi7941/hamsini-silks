import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Auth } from '../../api/auth';

export default function LoginPage() {
  const { user, showToast } = useStore();

  const { loginWithGoogle, sendPhoneOtp, loginWithPhone, promoterLogin } =
    Auth();
  const [tab, setTab] = useState<'patron' | 'promoter'>('patron');

  const [patronName, setPatronName] = useState('');
  const [patronPhone, setPatronPhone] = useState('');
  const [patronOtp, setPatronOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [promoterPhone, setPromoterPhone] = useState('');
  const [promoterPassword, setPromoterPassword] = useState('');

  const normalizePhoneValue = (value: string) =>
    value.replace(/\D/g, '').slice(0, 10);
  const normalizeOtpValue = (value: string) =>
    value.replace(/\D/g, '').slice(0, 6);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(patronPhone)) {
      showToast('Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    setSendingOtp(true);
    try {
      await sendPhoneOtp(patronPhone);
      setOtpSent(true);
    } catch (error) {
      console.error('Send OTP failed', error);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{10}$/.test(patronPhone)) {
      showToast('Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    if (!/^\d{6}$/.test(patronOtp)) {
      showToast('Please enter a valid 6-digit OTP.', 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      await loginWithPhone(patronName || 'Patron', patronPhone, patronOtp, '');
    } catch (error) {
      console.error('OTP verify failed', error);
    } finally {
      setVerifyingOtp(false);
    }
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
                  {user.role === 'promoter' ? 'Promoter' : 'Patron'} Portal
                </h1>
                <p className="text-xs text-gold-100/70 mt-1">
                  Access your account & exclusive benefits
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
                to={user.role === 'promoter' ? '/promoter' : '/'}
                className="inline-block mt-4 py-2 px-4 rounded-xl bg-maroon-900 text-gold-100 text-sm font-bold hover:bg-maroon-800 transition-colors cursor-pointer"
              >
                {user.role === 'promoter' ? 'Promoter Dashboard' : 'Home'}
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
              <h1 className="font-display text-xl font-bold text-gold-200">
                Welcome Back
              </h1>
              <p className="text-xs text-gold-100/70 mt-1">
                Access your account & exclusive privileges
              </p>
            </div>
          </div>

          <div className="p-6">
            <div>
              {/* Tab switcher */}
              <div className="flex bg-maroon-50 rounded-xl p-1 mb-5 gap-1">
                <button
                  onClick={() => setTab('patron')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    tab === 'patron'
                      ? 'bg-white shadow text-maroon-900'
                      : 'text-maroon-600 hover:text-maroon-800'
                  }`}
                >
                  Patron Login
                </button>
                <button
                  onClick={() => setTab('promoter')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    tab === 'promoter'
                      ? 'bg-white shadow text-maroon-900'
                      : 'text-maroon-600 hover:text-maroon-800'
                  }`}
                >
                  Promoter Login
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
                          setPatronPhone(normalizePhoneValue(e.target.value))
                        }
                        className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
                        placeholder="XXX-XXX-XXXX"
                      />
                    </div>
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
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
                            onChange={(e) =>
                              setPatronOtp(normalizeOtpValue(e.target.value))
                            }
                            className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
                            placeholder=""
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
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
                <form
                  onSubmit={async (e: React.FormEvent) => {
                    e.preventDefault();
                    await promoterLogin(promoterPhone, promoterPassword);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={promoterPhone}
                      onChange={(e) => setPromoterPhone(e.target.value)}
                      placeholder="+91 XXXXXXXXXX"
                      className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={promoterPassword}
                      onChange={(e) => setPromoterPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-700 text-white font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-md"
                  >
                    Access Promoter Portal
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
