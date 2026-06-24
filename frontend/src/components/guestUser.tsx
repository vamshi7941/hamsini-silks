import { useStore } from '@/context/StoreContext';
import { Link } from 'react-router-dom';

export default function GuestUser({ page }: { page: string }) {
  const { user } = useStore();

  let message = '';

  switch (page) {
    case 'profile':
      message =
        'You are currently not logged in. Please log in to access your profile.';
      break;
    case 'cart':
      message =
        'You are currently not logged in. Please log in to view your cart.';
      break;
    case 'checkout':
      message =
        'You are currently not logged in. Please log in to proceed to checkout.';
      break;
    case 'wishlist':
      message =
        'You are currently not logged in. Please log in to view your wishlist.';
      break;
    case 'my-orders':
      message =
        'You are currently not logged in. Please log in to view your orders.';
      break;
    case 'admin':
      message =
        'You cannot access the admin dashboard as a guest user.';
      break;
    default:
      message =
        'You are currently not logged in. Please log in to access this page.';
  }

  return (
    <div className="min-h-screen bg-[#fdf8f1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gold-100 overflow-hidden">
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
                Hamsini {user.role === 'admin' ? 'Admin' : 'Patron'} Portal
              </h1>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto font-display text-2xl font-bold text-maroon-800">
                G
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-maroon-900">
                  Guest User
                </h3>
                <p className="text-xs text-maroon-700/70">
                  {message ||
                    'You are currently not logged in. Please log in to access this page.'}
                </p>
                <Link
                  to="/login"
                  className="inline-block mt-2 py-2 px-4 rounded-xl bg-maroon-900 text-gold-100 text-sm font-bold hover:bg-maroon-800 transition-colors cursor-pointer"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
