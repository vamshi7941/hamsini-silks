import { useNavigate } from 'react-router-dom';
import { User, useStore } from '@/context/StoreContext';
import {
  signInWithGooglePopup,
  sendPhoneOtp as firebaseSendPhoneOtp,
  verifyPhoneOtp as firebaseVerifyPhoneOtp,
  getFirebaseAuthErrorMessage,
} from '../firebase';

export const Auth = () => {
  const { setUser, showToast, setCart, setWishlist } = useStore();
  const navigate = useNavigate();
  const apiUrl =
    (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';

  const login = (
    email: string,
    role: 'customer' | 'admin',
    name?: string,
    _id: string = '',
    token: string = '',
    phone: string = '',
  ) => {
    const displayName =
      name ||
      (role === 'admin'
        ? 'Hamsini Atelier Admin'
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
    navigate(role === 'admin' ? '/admin' : '/');
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
        login(email, 'customer', name, user.uid ?? '', json.token);
      } else {
        showToast('Google sign-in failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Google sign-in failed', err);
      const message = getFirebaseAuthErrorMessage(err);
      showToast(message, 'error');
    }
  };

  const sendPhoneOtp = async (phone: string) => {
    try {
      await firebaseSendPhoneOtp(phone);
    } catch (err) {
      const message = getFirebaseAuthErrorMessage(err);
      showToast(message, 'error');
      throw err;
    }
  };

  const loginWithPhone = async (name: string, phone: string, otp: string) => {
    try {
      const { user } = await firebaseVerifyPhoneOtp(otp);
      const response = await fetch(`${apiUrl}/api/auth/phone/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          name,
          phone,
        }),
      });
      const json = await response.json();

      if (json.success) {
        login('', 'customer', name, user.uid ?? '', json.token, phone);
      } else {
        showToast(
          json.message || 'Phone sign-in failed. Please try again.',
          'error',
        );
      }
    } catch (err) {
      console.error('Phone sign-in failed', err);
      const message = getFirebaseAuthErrorMessage(err);
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
    logout,
  };
};
