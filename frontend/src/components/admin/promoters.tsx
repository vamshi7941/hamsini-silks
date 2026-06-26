import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icons';
import PromoterOrdersModal from './promoterOrdersModal';
import { PromoterApi } from '@/api/promoters';
import { useStore } from '@/context/StoreContext';

export type Promoter = {
  _id: string;
  fullName: string;
  phone: string;
  promoCodes: Array<{
    code: string;
    discountPercentage: number;
    isActive: boolean;
    createdAt: string;
  }>;
  ordersCount: number;
  revenue: number;
  createdAt: string;
  isActive: boolean;
};

export type PromoterOrder = {
  _id: string;
  address: string;
  total: number;
  discountApplied: number;
  originalTotal: number;
  promoCode: string | null;
  orderedDate: string;
};

export default function PromotersManagement() {
  const hasFetchedPromoters = useRef(false);
  const { showToast } = useStore();
  const {
    getAllPromoters,
    createPromoter,
    updatePromoter,
    deletePromoter,
    getPromoterOrders,
  } = PromoterApi();

  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPromoterForOrders, setSelectedPromoterForOrders] =
    useState<Promoter | null>(null);
  const [selectedPromoterOrders, setSelectedPromoterOrders] = useState<
    PromoterOrder[]
  >([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [editingPromoter, setEditingPromoter] = useState<Promoter | null>(null);
  const [formMode, setFormMode] = useState<
    'create' | 'addPromo' | 'editPromoter'
  >('create');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    discountPercentage: 10,
    password: '',
  });
  const [existingPhoneMatch, setExistingPhoneMatch] = useState<Promoter | null>(
    null,
  );

  const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

  useEffect(() => {
    if (!hasFetchedPromoters.current) {
      loadPromoters();
      hasFetchedPromoters.current = true;
    }
  }, []);

  const loadPromoters = async () => {
    setLoading(true);
    const data = await getAllPromoters();
    if (data) {
      setPromoters(data);
    }
    setLoading(false);
  };

  const checkPhoneDuplicate = (phone: string) => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setExistingPhoneMatch(null);
      return;
    }

    const match = promoters.find(
      (p) => normalizePhone(p.phone) === normalizedPhone,
    );

    if (match && !editingPromoter) {
      setExistingPhoneMatch(match);
      setFormData((prev) => ({
        ...prev,
        fullName: match.fullName,
        password: '',
      }));
    } else {
      setExistingPhoneMatch(null);
    }
  };

  const handleAddPromoter = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNewPromoter = !existingPhoneMatch;
    if (
      !formData.phone ||
      formData.discountPercentage <= 0 ||
      (isNewPromoter && !formData.fullName) ||
      (isNewPromoter && !formData.password)
    ) {
      showToast('Please fill all fields', 'error');
      return;
    }

    await createPromoter(
      formData.fullName,
      formData.phone,
      formData.discountPercentage,
      formData.password,
      () => {
        setFormData({
          fullName: '',
          phone: '',
          discountPercentage: 10,
          password: '',
        });
        setExistingPhoneMatch(null);
        setShowForm(false);
        loadPromoters();
      },
    );
  };

  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPromoter) return;

    if (formData.discountPercentage <= 0) {
      showToast('Please enter a valid discount percentage', 'error');
      return;
    }

    await createPromoter(
      editingPromoter.fullName,
      editingPromoter.phone,
      formData.discountPercentage,
      undefined,
      () => {
        setEditingPromoter(null);
        setFormData({
          fullName: '',
          phone: '',
          discountPercentage: 10,
          password: '',
        });
        setShowForm(false);
        loadPromoters();
      },
    );
  };

  const handleUpdatePromoterDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPromoter) return;

    await updatePromoter(
      editingPromoter._id,
      {
        fullName: formData.fullName,
        password: formData.password || undefined,
      },
      () => {
        setEditingPromoter(null);
        setFormData({
          fullName: '',
          phone: '',
          discountPercentage: 10,
          password: '',
        });
        setShowForm(false);
        loadPromoters();
      },
    );
  };

  const handleDeletePromoter = (promoter: Promoter) => {
    if (confirm(`Are you sure you want to delete ${promoter.fullName}?`)) {
      deletePromoter(promoter._id, () => {
        loadPromoters();
      });
    }
  };

  const handleViewOrderDetails = async (promoter: Promoter) => {
    setSelectedPromoterForOrders(promoter);
    setOrderLoading(true);
    const orders = await getPromoterOrders(promoter._id);
    setOrderLoading(false);

    if (orders) {
      setSelectedPromoterOrders(orders);
      setShowOrderModal(true);
    }
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedPromoterForOrders(null);
    setSelectedPromoterOrders([]);
  };

  const handleTogglePromoterStatus = async (
    promoter: Promoter,
    nextStatus: boolean,
  ) => {
    await updatePromoter(promoter._id, { isActive: nextStatus }, () => {
      loadPromoters();
    });
  };

  const handleTogglePromoCodeStatus = async (
    promoter: Promoter,
    promoCode: string,
    nextStatus: boolean,
  ) => {
    await updatePromoter(
      promoter._id,
      { promoCode, promoCodeIsActive: nextStatus },
      () => {
        loadPromoters();
      },
    );
  };

  const handleAddPromoCodeClick = (promoter: Promoter) => {
    setFormMode('addPromo');
    setEditingPromoter(promoter);
    setExistingPhoneMatch(null);
    setFormData({
      fullName: promoter.fullName,
      phone: promoter.phone,
      discountPercentage: 10,
      password: '',
    });
    setShowForm(true);
  };

  const handleEditPromoterDetails = (promoter: Promoter) => {
    setFormMode('editPromoter');
    setEditingPromoter(promoter);
    setExistingPhoneMatch(null);
    setFormData({
      fullName: promoter.fullName,
      phone: promoter.phone,
      discountPercentage: 10,
      password: '',
    });
    setShowForm(true);
  };

  const filteredPromoters = promoters.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.promoCodes.some((pc) =>
        pc.code.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="space-y-5">
      {/* Header & Search */}
      <div className="bg-white rounded-2xl p-4 border border-gold-100 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-400">
            <Icon.search />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, code or phone…"
            className="w-full pl-9 pr-4 py-2 border border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
          />
        </div>
        <button
          onClick={() => {
            setFormMode('create');
            setShowForm(true);
            setEditingPromoter(null);
            setExistingPhoneMatch(null);
            setFormData({
              fullName: '',
              phone: '',
              discountPercentage: 10,
              password: '',
            });
          }}
          className="px-4 py-2 bg-maroon-900 hover:bg-maroon-800 text-gold-200 rounded-xl font-semibold text-sm transition-colors cursor-pointer flex items-center gap-2"
        >
          <Icon.plus /> Add Promoter
        </button>
      </div>

      {showForm &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gold-100">
              <h2 className="font-display text-lg font-bold text-maroon-900 mb-4">
                {formMode === 'create'
                  ? 'Create Promoter'
                  : formMode === 'addPromo'
                    ? 'Add New Promo Code'
                    : 'Edit Promoter'}
              </h2>
              <form
                onSubmit={
                  formMode === 'create'
                    ? handleAddPromoter
                    : formMode === 'addPromo'
                      ? handleAddPromoCode
                      : handleUpdatePromoterDetails
                }
                className="space-y-4"
              >
                {(formMode === 'create' || formMode === 'editPromoter') && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        disabled={
                          formMode === 'create' ? !!existingPhoneMatch : false
                        }
                        className={`w-full px-4 py-2 border rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 ${
                          formMode === 'create' && existingPhoneMatch
                            ? 'bg-gold-50 border-gold-200 text-maroon-400 cursor-not-allowed'
                            : 'border-gold-200 bg-white'
                        }`}
                        placeholder="e.g., John Doe"
                      />
                    </div>

                    {formMode === 'create' && (
                      <div>
                        <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          maxLength={10}
                          onChange={(e) => {
                            const nextPhone = e.target.value;
                            setFormData({ ...formData, phone: nextPhone });
                            checkPhoneDuplicate(nextPhone);
                          }}
                          className="w-full px-4 py-2 border border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
                          placeholder="e.g., +91 9876543210"
                        />
                      </div>
                    )}

                    {formMode === 'editPromoter' && editingPromoter && (
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                        <p className="text-xs font-bold text-blue-900">
                          {editingPromoter.fullName}
                        </p>
                        <p className="text-xs text-blue-800">
                          {editingPromoter.phone}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {(formMode === 'create' || formMode === 'addPromo') && (
                  <div>
                    <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                      {formMode === 'addPromo'
                        ? 'New Promo Discount'
                        : 'Discount'}{' '}
                      Percentage
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPercentage: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
                      placeholder="e.g., 15"
                    />
                  </div>
                )}

                {(formMode === 'create' || formMode === 'editPromoter') && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        disabled={formMode === 'create' && !!existingPhoneMatch}
                        className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-maroon-700 ${
                          formMode === 'create' && existingPhoneMatch
                            ? 'bg-gold-50 border-gold-200 text-maroon-400 cursor-not-allowed'
                            : 'border-gold-200 bg-white text-maroon-900'
                        }`}
                        placeholder={
                          formMode === 'editPromoter'
                            ? 'Leave blank to keep current password'
                            : 'Enter password'
                        }
                      />
                    </div>

                    {formMode === 'create' && existingPhoneMatch && (
                      <div className="rounded-xl border border-gold-200 bg-gold-50 p-3 text-xs text-maroon-700">
                        This phone number already exists. Full name and password
                        are locked until the phone number changes.
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gold-200 text-maroon-900 rounded-xl font-semibold text-sm hover:bg-maroon-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-maroon-900 hover:bg-maroon-800 text-gold-200 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                  >
                    {formMode === 'create'
                      ? 'Create'
                      : formMode === 'addPromo'
                        ? 'Add Code'
                        : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Promoters Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gold-100">
          <div className="text-2xl mb-3">⏳</div>
          <p className="font-semibold text-maroon-900">Loading promoters...</p>
        </div>
      ) : filteredPromoters.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gold-100">
          <div className="text-4xl mb-3">🎯</div>
          <p className="font-semibold text-maroon-900">No promoters found</p>
          <p className="text-xs text-maroon-700/60 mt-1">
            Create your first promoter to get started
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gold-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-maroon-50 border-b border-gold-100">
                <tr>
                  <th className="px-4 py-3 text-center font-bold text-maroon-900">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-maroon-900">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-maroon-900">
                    Promo Codes
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-maroon-900">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-maroon-900">
                    View Orders
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-maroon-900">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-maroon-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {filteredPromoters.map((promoter) => (
                  <tr
                    key={promoter._id}
                    className="hover:bg-maroon-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          handleTogglePromoterStatus(
                            promoter,
                            !promoter.isActive,
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          promoter.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                        title={
                          promoter.isActive
                            ? 'Deactivate promoter'
                            : 'Activate promoter'
                        }
                      >
                        {promoter.isActive ? <Icon.check /> : <Icon.close />}
                        {promoter.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2 whitespace-nowrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-maroon-900">
                            {promoter.fullName}
                          </p>
                        </div>
                        <p className="text-xs text-maroon-700/60">
                          {promoter.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {promoter.promoCodes.map((pc) => (
                          <button
                            key={pc.code}
                            type="button"
                            onClick={() =>
                              handleTogglePromoCodeStatus(
                                promoter,
                                pc.code,
                                !pc.isActive,
                              )
                            }
                            title={
                              pc.isActive
                                ? 'Deactivate promo code'
                                : 'Activate promo code'
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
                              pc.isActive
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 line-through'
                            }`}
                          >
                            {pc.code}
                            <span
                              className={`${
                                pc.isActive ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              ({pc.discountPercentage}%)
                            </span>
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-maroon-900">
                        {promoter.ordersCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleViewOrderDetails(promoter)}
                        className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
                        title="View promoter order details"
                        disabled={
                          orderLoading &&
                          selectedPromoterForOrders?._id === promoter._id
                        }
                      >
                        {orderLoading &&
                        selectedPromoterForOrders?._id === promoter._id
                          ? 'Loading...'
                          : 'View Orders'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-purple-600">
                        ₹{promoter.revenue.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleAddPromoCodeClick(promoter)}
                          className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 cursor-pointer"
                          title="Add Promo Code"
                        >
                          <Icon.plus />
                        </button>
                        <button
                          onClick={() => handleEditPromoterDetails(promoter)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 cursor-pointer"
                          title="Edit Promoter"
                        >
                          <Icon.edit />
                        </button>
                        <button
                          onClick={() => handleDeletePromoter(promoter)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 cursor-pointer"
                          title="Delete"
                        >
                          <Icon.trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showOrderModal && selectedPromoterForOrders && (
        <PromoterOrdersModal
          promoter={selectedPromoterForOrders}
          orders={selectedPromoterOrders}
          onClose={handleCloseOrderModal}
        />
      )}
    </div>
  );
}
