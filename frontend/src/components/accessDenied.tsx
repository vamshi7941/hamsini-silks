import { useStore } from '@/context/StoreContext';

export default function AccessDenied({ page }: { page: string }) {
  const { user } = useStore();
  let message = '';

  switch (page) {
    case 'cart':
      message = 'You do not have permission to view the cart.';
      break;
    case 'wishlist':
      message = 'You do not have permission to view the wishlist.';
      break;
    case 'checkout':
      message = 'You do not have permission to proceed to checkout.';
      break;
    case 'my-orders':
      message = 'You do not have permission to view your orders.';
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg text-gray-600">
        {message || 'You do not have permission to access this page.'} Please
        log in with a {user.role === 'admin' ? 'Customer' : 'Admin'} account.
      </p>
    </div>
  );
}
