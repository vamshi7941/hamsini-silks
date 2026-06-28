import { useNavigate } from 'react-router-dom';
import { User, useStore } from '@/context/StoreContext';
import {
  signInWithGooglePopup,
  getFirebaseAuthErrorMessage,
} from '../firebase';

export const Auth = () => {
  const { setUser, showToast, setCart, setWishlist } = useStore();
  const navigate = useNavigate();
  const apiUrl =
    (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';

  const login = (
    email: string,
    role: 'customer' | 'admin' | 'promoter',
    name?: string,
    _id: string = '',
    token: string = '',
    phone: string = '',
  ) => {
    const displayName =
      name ||
      (role === 'admin'
        ? 'Hamsini Atelier Admin'
        : role === 'promoter'
          ? 'Promoter'
          : email.split('@')[0] || phone);
    const newUser = {
      name: displayName,
      email,
      role,
      loggedIn: true,
      _id,
      token,
      phone,
    } as User;

    setUser(newUser);
    try {
      localStorage.setItem('hamsini_user', JSON.stringify(newUser));
    } catch (e) {
      // ignore storage errors
    }
    showToast(`Welcome back, ${displayName}!`, 'success');
    navigate(
      role === 'admin' ? '/admin' : role === 'promoter' ? '/promoter' : newUser.phone ? '/' : '/verify-phone',
    );
  };

  const loginWithGoogle = async () => {
    try {
      const { user } = await signInWithGooglePopup();
      const name = user.displayName ?? user.email?.split('@')[0] ?? 'Patron';
      const email = user.email ?? '';

      const response = await fetch(`${apiUrl}/api/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          uid: user.uid,
        }),
      });
      const json = await response.json();

      if (json.success) {
        login(email, 'customer', name, user.uid ?? '', json.token, json.customer.phone ?? '');
      } else {
        showToast('Google sign-in failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Google sign-in failed', err);
      const message = getFirebaseAuthErrorMessage(err);
      showToast(message, 'error');
    }
  };

  const normalizePhoneNumber = (phone: string) =>
    phone.replace(/\D/g, '').slice(-10);

  const sendPhoneOtp = async (phone: string) => {
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      const message = 'Please enter a valid 10-digit phone number.';
      showToast(message, 'error');
      throw new Error(message);
    }

    try {
      const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone }),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Unable to send OTP right now.');
      }

      showToast(json.message || 'OTP sent successfully.', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to send OTP right now.';
      showToast(message, 'error');
      throw err;
    }
  };

  const loginWithPhone = async (name: string, phone: string, otp: string, email: string) => {
    const normalizedPhone = normalizePhoneNumber(phone);
    const normalizedOtp = otp.replace(/\D/g, '').slice(-6);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      const message = 'Please enter a valid 10-digit phone number.';
      showToast(message, 'error');
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      const message = 'Please enter a valid 6-digit OTP.';
      showToast(message, 'error');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/auth/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          otp: normalizedOtp,
          name,
          email,
        }),
      });
      const json = await response.json();

      if (json.success && json.token && json.user) {
        login(
          json.user.email || email,
          'customer',
          json.user.fullName || name || 'Patron',
          json.user._id || '',
          json.token,
          normalizedPhone,
        );
      } else {
        showToast(
          json.message || 'Phone sign-in failed. Please try again.',
          'error',
        );
      }
    } catch (err) {
      console.error('Phone sign-in failed', err);
      const message =
        err instanceof Error ? err.message : 'Phone sign-in failed.';
      showToast(message, 'error');
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();

      if (json.success) {
        const _id = json.user._id ?? '';
        const name =
          json.user.fullName ?? json.user.email?.split('@')[0] ?? 'Admin';
        const token = json.user.token ?? '';
        login(email, 'admin', name, _id, token);
        showToast(`Welcome back, ${name}!`, 'success');
      } else {
        showToast(
          json.message || json.error || 'Invalid email or password',
          'error',
        );
      }
    } catch (err) {
      console.error('Admin login failed', err);
      showToast('Login failed. Please check your credentials.', 'error');
    }
  };

  const promoterLogin = async (phone: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/promoter/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const json = await response.json();

      if (json.success) {
        const _id = json.user._id ?? '';
        const name = json.user.fullName ?? 'Promoter';
        const token = json.user.token ?? '';
        const userPhone = json.user.phone ?? '';

        login(
          '',
          'promoter',
          name,
          _id,
          token,
          userPhone,
        );
      } else {
        showToast(
          json.message || json.error || 'Invalid phone or password',
          'error',
        );
      }
    } catch (err) {
      console.error('Promoter login failed', err);
      showToast('Login failed. Please check your credentials.', 'error');
    }
  };

  const logout = () => {
    const guest = {
      name: 'Guest Patron',
      email: '',
      phone: '',
      role: 'customer',
      loggedIn: false,
      token: '',
      _id: '',
    } as User;
    setUser(guest);
    try {
      setCart([]);
      setWishlist([]);
      localStorage.removeItem('hamsini_user');
    } catch (e) {
      // ignore
    }
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  return {
    loginWithGoogle,
    sendPhoneOtp,
    loginWithPhone,
    adminLogin,
    promoterLogin,
    logout,
  };
};
