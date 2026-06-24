import { useNavigate } from 'react-router-dom';
import { User, useStore } from '@/context/StoreContext';
import { signInWithGooglePopup } from '../firebase';

export const Auth = () => {
  const { setUser, showToast, setCart, setWishlist } = useStore();
  const navigate = useNavigate();
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  const login = (
    email: string,
    role: 'customer' | 'admin',
    name?: string,
    _id?: string,
  ) => {
    const displayName =
      name ||
      (role === 'admin' ? 'Hamsini Atelier Admin' : email.split('@')[0]);
    const newUser = {
      name: displayName,
      email,
      role,
      loggedIn: true,
      _id,
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
      const { user, idToken } = await signInWithGooglePopup();
      const name = user.displayName ?? user.email?.split('@')[0] ?? 'Patron';
      const email = user.email ?? '';

      const response = await fetch(`${apiUrl}/api/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { name, email, uid: user.uid },
          idToken,
        }),
      });
      const json = await response.json();

      if (json.success) {
        login(email, 'customer', name, json.customer._id ?? '');
      } else {
        showToast('Google sign-in failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Google sign-in failed', err);
      showToast(
        'Google sign-in failed. Please check your connection.',
        'error',
      );
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
        const name =
          json.user.fullName ?? json.user.email?.split('@')[0] ?? 'Admin';
        const token = json.user.token ?? '';
        login(email, 'admin', name, token);
        showToast(`Welcome back, ${name}!`, 'success');
      } else {
        showToast(json.message || json.error || 'Invalid email or password', 'error');
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
      role: 'customer',
      loggedIn: false,
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

  return { loginWithGoogle, adminLogin, logout };
};
