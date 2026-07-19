import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Auth } from '../../api/auth';

export default function VerifyPhonePage() {
  const { user, showToast } = useStore();
  const { sendPhoneOtp, loginWithPhone, logout } = Auth();

  const [phone, setPhone] = useState(user.phone || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const normalizePhoneValue = (value: string) =>
    value.replace(/\D/g, '').slice(0, 10);
  const normalizeOtpValue = (value: string) =>
    value.replace(/\D/g, '').slice(0, 6);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      showToast('Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    setSendingOtp(true);
    try {
      await sendPhoneOtp(phone, user.email);
      setOtpSent(true);
    } catch (error) {
      console.error('Send OTP failed', error);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      showToast('Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      showToast('Please enter a valid 6-digit OTP.', 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      await loginWithPhone(user.name || 'Patron', phone, otp, user.email || '');
    } catch (error) {
      console.error('OTP verification failed', error);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-[70vh] px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-md rounded-4xl border border-[#eadfc4] bg-white/90 p-8 shadow-[0_20px_60px_rgba(75,29,29,0.12)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9b2c2c]">
          Account verification
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#4b1d1d]">
          Verify your phone number
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#6b4a4a]">
          To continue using your account, verify your phone number below. We’ll
          send an OTP and complete the verification for you.
        </p>

        <div className="mt-6 rounded-2xl border border-[#f2e2bf] bg-[#fffaf2] p-4 text-sm text-[#7a4e2f]">
          {user.email ? `Signed in as ${user.email}` : 'You are signed in.'}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-[#4b1d1d]">
              Mobile number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(normalizePhoneValue(e.target.value))}
              className="w-full rounded-xl border border-[#e7d7b3] bg-[#fdfbf6] px-4 py-3 text-sm text-[#4b1d1d] outline-none ring-0 focus:border-[#9b2c2c]"
              placeholder="XXX-XXX-XXXX"
            />
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full rounded-xl bg-[#4b1d1d] px-4 py-3 text-sm font-semibold text-[#fff9ec] transition-colors hover:bg-[#6a2424]"
            >
              {sendingOtp ? 'Sending OTP…' : 'Send OTP'}
            </button>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-[#4b1d1d]">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(normalizeOtpValue(e.target.value))}
                  className="w-full rounded-xl border border-[#e7d7b3] bg-[#fdfbf6] px-4 py-3 text-sm text-[#4b1d1d] outline-none ring-0 focus:border-[#9b2c2c]"
                  placeholder=""
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full rounded-xl bg-[#4b1d1d] px-4 py-3 text-sm font-semibold text-[#fff9ec] transition-colors hover:bg-[#6a2424]"
              >
                {verifyingOtp ? 'Verifying OTP…' : 'Verify OTP'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl bg-[#4b1d1d] px-4 py-3 text-sm font-semibold text-[#fff9ec] transition-colors hover:bg-[#6a2424]"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
