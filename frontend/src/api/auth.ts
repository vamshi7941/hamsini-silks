import { User, useStore } from '@/context/StoreContext';
import { signInWithGooglePopup } from '../firebase';

export const Auth = () => {
  const { setUser, showToast, setCurrentPage } = useStore();
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

  // ── User ──
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
    showToast(`Welcome back, ${displayName}!`);
    setCurrentPage(role === 'admin' ? 'admin' : 'home');
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
      }
    } catch (err) {
      console.error('Google sign-in failed', err);
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
      } else {
        // show toast notification for failed login
      }
    } catch (err) {
      console.error('Admin login failed', err);
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
      localStorage.removeItem('hamsini_user');
    } catch (e) {
      // ignore
    }
    showToast('Logged out successfully');
    setCurrentPage('home');
  };

  return { loginWithGoogle, adminLogin, logout };
};
