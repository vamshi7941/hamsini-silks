import { Promoter, PromoterOrder } from './promoters';
import { Icon } from '../Icons';

type Props = {
  promoter: Promoter;
  orders: PromoterOrder[];
  onClose: () => void;
};

export default function PromoterOrdersModal({
  promoter,
  orders,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-xl border border-gold-100 absolute top-20">
        <div className="flex items-center justify-between border-b border-gold-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-display font-bold text-maroon-900">
              Orders for {promoter.fullName}
            </h2>
            <p className="text-xs text-maroon-700/70 mt-1">
              Promo codes: {promoter.promoCodes.map((pc) => pc.code).join(', ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-maroon-50 text-maroon-700 hover:bg-maroon-100 transition-colors"
            title="Close"
          >
            <Icon.close />
          </button>
        </div>

        <div className="p-6">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-gold-100 bg-gold-50 p-8 text-center text-sm text-maroon-900">
              No orders found for this promoter yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-maroon-50 text-maroon-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order ID</th>
                    <th className="px-4 py-3 font-semibold">Address</th>
                    <th className="px-4 py-3 font-semibold">Coupon</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Original Total
                    </th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Discount
                    </th>
                    <th className="px-4 py-3 font-semibold text-right">
                      After Coupon
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-100">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-maroon-50 transition-colors"
                    >
                      <td className="px-4 py-4 font-mono text-xs text-maroon-900">
                        {order._id}
                      </td>
                      <td className="px-4 py-4 text-xs text-maroon-700 whitespace-pre-line">
                        {order.address}
                      </td>
                      <td className="px-4 py-4 text-xs text-maroon-900 font-semibold">
                        {order.promoCode || 'None'}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-maroon-900">
                        ₹{order.originalTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-green-700 font-semibold">
                        -₹{order.discountApplied.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-purple-600">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
