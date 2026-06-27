import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Auth } from '@/api/auth';
import { CustomerApi } from '@/api/customer';
import GuestUser from '../guestUser';
import AccessDenied from '../accessDenied';

const PAYMENT_METHODS = [
  { id: 'UPI', icon: '📱', label: 'UPI', sub: 'PhonePe · GPay · Paytm · BHIM' },
  { id: 'Card', icon: '💳', label: 'Card', sub: 'Visa · Mastercard · RuPay' },
  { id: 'COD', icon: '💵', label: 'Cash on Delivery', sub: 'Pay at doorstep' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartTotal,
    user,
    buyNowItem,
    showToast,
    couponCode,
    couponDiscountPercentage,
    setCouponCode,
    setCouponDiscountPercentage,
  } = useStore();
  const { placeOrder, clearCart, validatePhone } = CustomerApi();
  const { sendPhoneOtp } = Auth();

  if (!user.loggedIn && user.role !== 'customer') return;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('UPI');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const orderSubtotal = buyNowItem
    ? buyNowItem.product.price * buyNowItem.quantity
    : cartTotal;
  const discountAmount = Math.round(
    orderSubtotal * (couponDiscountPercentage / 100),
  );
  const orderTotal = orderSubtotal - discountAmount;

  const normalizePhoneValue = (value: string) =>
    value.replace(/\D/g, '').slice(0, 10);
  const normalizeOtpValue = (value: string) =>
    value.replace(/\D/g, '').slice(0, 6);

  const handleSendOtp = async () => {
    const normalizedPhone = normalizePhoneValue(phone);
    if (!/^\d{10}$/.test(normalizedPhone)) {
      showToast('Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    setSendingOtp(true);
    try {
      await sendPhoneOtp(normalizedPhone);
      setOtpSent(true);
      setOtpVerified(false);
      setOtp('');
    } catch (error) {
      console.error('Send OTP failed', error);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedPhone = normalizePhoneValue(phone);
    const normalizedOtp = normalizeOtpValue(otp);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      showToast('Please enter a valid 10-digit phone number.', 'error');
      return;
    }
    if (!/^\d{6}$/.test(normalizedOtp)) {
      showToast('Please enter a valid 6-digit OTP.', 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      const result = await validatePhone(normalizedPhone, normalizedOtp);
      if (result?.success) {
        setOtpVerified(true);
        showToast('Phone verified for COD order.', 'success');
      }
    } catch (error) {
      console.error('Verify OTP failed', error);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (payment === 'COD' && !otpVerified && user.phone !== phone) {
      showToast(
        'Please verify your phone with OTP before placing a COD order.',
        'error',
      );
      return;
    }

    const orderResult = await placeOrder({
      name,
      email,
      phone,
      address,
      paymentMethod: payment,
    });

    if (orderResult?.success) {
      setOrderId(orderResult.data._id);
      clearCart();
      setCouponCode('');
      setCouponDiscountPercentage(0);
      setOtpSent(false);
      setOtp('');
      setOtpVerified(false);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user.loggedIn) return <GuestUser page="checkout" />;
  if (user.role !== 'customer') return <AccessDenied page="checkout" />;

  if (cart.length === 0 && !orderId && !buyNowItem) {
    return (
      <div className="min-h-screen bg-[#fdf8f1] flex items-center justify-center">
        <div className="text-center py-16 px-4">
          <div className="text-5xl mb-4">🛍️</div>
          <p className="text-maroon-800 font-serif italic text-lg mb-4">
            Your bag is empty.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-maroon-900 text-gold-100 rounded-full font-bold text-sm cursor-pointer"
          >
            Explore Catalogue
          </button>
        </div>
      </div>
    );
  }

  /* ── SUCCESS SCREEN ── */
  if (orderId) {
    return (
      <div className="min-h-screen bg-[#fdf8f1] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl border-2 border-gold-300 p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-mandala opacity-10 pointer-events-none" />
            <div className="relative">
              {/* Animated success icon */}
              <div className="w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl shadow-lg animate-float">
                🪷
              </div>
              <div className="text-xs font-bold tracking-[0.4em] text-gold-700 mb-2 uppercase">
                ॐ मङ्गलम् ॐ
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-maroon-900 mb-2">
                Order Placed!
              </h2>
              <p className="text-sm text-maroon-700/80 mb-6 leading-relaxed">
                Your heirloom saree has been commissioned. Our merchants will be
                confirming you order and dispatch tracking will be sent to your
                email.
              </p>

              {/* Order info card */}
              <div className="bg-maroon-50 rounded-2xl p-4 text-left mb-6 space-y-2.5 border border-gold-200">
                {[
                  { label: 'Order ID', val: orderId },
                  { label: 'Patron', val: name },
                  { label: 'Email', val: email },
                  { label: 'Payment', val: payment },
                  {
                    label: 'Status',
                    val: '⏳ Pending',
                    highlight: true,
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-maroon-700">{r.label}</span>
                    <span
                      className={`font-bold ${r.highlight ? 'text-gold-700' : 'text-maroon-900'}`}
                    >
                      {r.val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/shop')}
                  className="flex-1 py-3 rounded-xl bg-gold-50 text-maroon-900 text-sm font-bold border border-gold-200 hover:bg-gold-100 transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── CHECKOUT FORM ── */
  return (
    <div className="min-h-screen bg-[#fdf8f1]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gold-100 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-maroon-700">
          <Link to="/" className="hover:text-maroon-900">
            Home
          </Link>
          <span>›</span>
          {!buyNowItem && (
            <>
              <Link to="/cart" className="hover:text-maroon-900">
                Bag
              </Link>
              <span>›</span>
            </>
          )}
          <span className="text-maroon-900 font-semibold">Checkout</span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white border-b border-gold-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-xs">
          {(buyNowItem
            ? ['Product', 'Checkout', 'Confirmed']
            : ['Bag', 'Checkout', 'Confirmed']
          ).map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 1 ? 'bg-maroon-900 text-gold-200' : i === 0 ? 'bg-gold-200 text-maroon-900' : 'bg-maroon-100 text-maroon-500'}`}
              >
                {i + 1}
              </div>
              <span
                className={
                  i === 1 ? 'font-bold text-maroon-900' : 'text-maroon-500'
                }
              >
                {step}
              </span>
              {i < 2 && <span className="text-maroon-300">›</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            {/* Delivery section */}
            <div className="bg-white rounded-2xl border border-gold-100 shadow-xs p-5 sm:p-6">
              <h2 className="font-display text-base font-bold text-maroon-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-maroon-900 text-gold-200 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors font-medium"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                      Phone *
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={otpVerified}
                      className={`w-full px-4 py-3 border-2 rounded-xl text-sm text-maroon-900 focus:outline-none transition-colors ${otpVerified ? 'border-emerald-300 bg-emerald-50 text-emerald-900 cursor-not-allowed' : 'border-gold-200 focus:border-maroon-700'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Payment section */}
            <div className="bg-white rounded-2xl border border-gold-100 shadow-xs p-5 sm:p-6">
              <h2 className="font-display text-base font-bold text-maroon-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-maroon-900 text-gold-200 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      payment === pm.id
                        ? 'border-maroon-900 bg-maroon-50'
                        : 'border-gold-200 hover:border-gold-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.id}
                      checked={payment === pm.id}
                      onChange={() => setPayment(pm.id)}
                      className="accent-maroon-900"
                    />
                    <span className="text-2xl">{pm.icon}</span>
                    <div>
                      <span className="text-sm font-bold text-maroon-900 block">
                        {pm.label}
                      </span>
                      <span className="text-xs text-maroon-700/70">
                        {pm.sub}
                      </span>
                    </div>
                    {payment === pm.id && (
                      <span className="ml-auto text-maroon-900">✓</span>
                    )}
                  </label>
                ))}
              </div>

              {payment === 'COD' && user.phone !== phone && (
                <div className="mt-4 rounded-2xl border border-gold-100 bg-[#fff8ef] p-4">
                  <p className="text-sm font-semibold text-maroon-900 mb-3">
                    Cash on Delivery requires phone OTP verification.
                  </p>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full py-3 rounded-xl bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-md"
                    >
                      {sendingOtp ? 'Sending OTP…' : 'Send OTP'}
                    </button>
                  ) : otpVerified ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 font-semibold">
                      OTP verified for {phone || 'your phone number'}. You can
                      now place the order.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                          Enter OTP
                        </label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) =>
                            setOtp(normalizeOtpValue(e.target.value))
                          }
                          className="w-full px-4 py-3 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
                          placeholder="123456"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="w-full py-3 rounded-xl bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-md"
                      >
                        {verifyingOtp ? 'Verifying OTP…' : 'Verify OTP'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-bold text-sm sm:text-base tracking-wider shadow-lg transition-all cursor-pointer"
            >
              🪷 Confirm Order · ₹{orderTotal.toLocaleString('en-IN')}
            </button>
            <p className="text-center text-xs text-maroon-700/50">
              By confirming, you agree to our Terms & Silk Mark authenticity
              policy.
            </p>
          </form>

          {/* ── Summary panel ── */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-gold-100 shadow-xs p-5">
              <h3 className="font-display text-sm font-bold text-maroon-900 uppercase tracking-wider border-b border-gold-100 pb-3 mb-4">
                Your Order ({buyNowItem ? 1 : cart.length}{' '}
                {(buyNowItem ? 1 : cart.length) === 1 ? 'item' : 'items'})
              </h3>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {buyNowItem ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={buyNowItem.product.image}
                      alt={buyNowItem.product.name}
                      className="w-12 h-16 object-cover rounded-lg border border-gold-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-maroon-900 block truncate">
                        {buyNowItem.product.name}
                      </span>
                      <span className="text-[10px] text-maroon-700/70">
                        Qty: {buyNowItem.quantity}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-maroon-900 shrink-0">
                      ₹
                      {(
                        buyNowItem.product.price * buyNowItem.quantity
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : (
                  cart.map(({ product: p, quantity }) => (
                    <div key={p._id} className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-16 object-cover rounded-lg border border-gold-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-maroon-900 block truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-maroon-700/70">
                          Qty: {quantity}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-maroon-900 shrink-0">
                        ₹{(p.price * quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gold-100 mt-4 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-maroon-700">
                  <span>Subtotal</span>
                  <span className="font-semibold text-maroon-900">
                    ₹{orderSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {couponCode && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>
                      Coupon <span className="font-semibold">{couponCode}</span>
                    </span>
                    <span className="font-semibold">
                      - ₹{discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-maroon-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gold-100 pt-2 mt-2">
                  <span className="text-maroon-900">Total</span>
                  <span className="font-display text-lg text-maroon-900">
                    ₹{orderTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Security badges */}
            <div className="bg-maroon-50 rounded-2xl p-4 flex items-center gap-3 border border-gold-200">
              <span className="text-2xl shrink-0">🔒</span>
              <div className="text-xs text-maroon-800">
                <strong className="block">256-bit SSL Encrypted</strong>
                Your payment details are fully protected and never stored.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
