import { useStore } from '@/context/StoreContext';
import { signInWithGooglePopup } from '../firebase';

export const Auth = () => {
  const { login } = useStore();
  const apiUrl =
    (import.meta as any).env.BACKEND_URL || 'http://localhost:4001';

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
        login(email, 'customer', name);
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
        const name = json.user.fullName ?? json.user.email?.split('@')[0] ?? 'Admin';
        const token = json.user.token;
        login(email, 'admin', name, token);
      } else {
        // show toast notification for failed login

      }
    } catch (err) {
      console.error('Admin login failed', err);
    }
  };

  return { loginWithGoogle, adminLogin };
};
