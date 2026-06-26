import { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Product } from '../../data';
import { AdminApi } from '@/api/admin';
import { Icon } from '../Icons';
import GuestUser from '../guestUser';
import AccessDenied from '../accessDenied';
import Overview from '../admin/overview';
import SideBar from '../admin/sideBar';
import Orders from '../admin/orders';
import Catalogue from '../admin/catalogue';
import Media from '../admin/media';
import Promoters from '../admin/promoters';
import { AddProductModal, EditProductModal } from '../admin/updateProduct';
import ImageEditor from '../admin/imageEditor';
import DeleteConfirmModal from '../admin/deleteConfirmationModel';

// ── Helpers ────────────────────────────────────────────────────────────────────

export type AdminTab =
  | 'overview'
  | 'orders'
  | 'catalogue'
  | 'media'
  | 'promoters';

// ── MAIN ADMIN DASHBOARD ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { showToast, user } = useStore();
  const { addProduct, updateProduct, deleteProduct } = AdminApi();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    product: Product;
    isOpen: boolean;
  } | null>(null);

  // Image Editor state
  const [editingImage, setEditingImage] = useState<{
    src: string;
    label: string;
  } | null>(null);

  if (!user.loggedIn) return <GuestUser page="admin" />;
  if (user.role !== 'admin') return <AccessDenied page="admin" />;

  return (
    <div className="min-h-screen bg-[#f5ede3] flex">
      {/* ── Sidebar ── */}
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-gold-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="font-display text-lg md:text-xl font-bold text-maroon-900 capitalize">
              {activeTab === 'overview'
                ? 'Dashboard'
                : activeTab === 'orders'
                  ? 'Orders & Invoicing'
                  : activeTab === 'catalogue'
                    ? 'Catalogue'
                    : activeTab === 'media'
                      ? 'Media Studio'
                      : 'Promoters'}
            </h1>
            <p className="text-xs text-maroon-700/60 hidden sm:block mt-0.5">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('No new notifications', 'info')}
              className="p-2 rounded-full hover:bg-maroon-50 text-maroon-700 relative cursor-pointer"
            >
              <Icon.bell />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 bg-maroon-50 rounded-full pl-2 pr-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-maroon-900 text-gold-200 font-display font-bold text-xs flex items-center justify-center">
                {user.name?.[0] ?? 'A'}
              </div>
              <span className="text-xs font-semibold text-maroon-900 hidden sm:block max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto admin-scroll space-y-6 animate-fadeIn">
          {/* ═══════════════════ OVERVIEW ═══════════════════ */}
          {activeTab === 'overview' && (
            <Overview
              setActiveTab={setActiveTab}
              setShowAddModal={setShowAddModal}
            />
          )}

          {/* ═══════════════════ ORDERS ═══════════════════ */}
          {activeTab === 'orders' && <Orders />}

          {/* ═══════════════════ CATALOGUE ═══════════════════ */}
          {activeTab === 'catalogue' && (
            <Catalogue
              setShowAddModal={setShowAddModal}
              setEditingProduct={setEditingProduct}
              setDeleteConfirm={setDeleteConfirm}
            />
          )}

          {/* ═══════════════════ MEDIA LIBRARY ═══════════════════ */}
          {activeTab === 'media' && (
            <Media
              setEditingImage={setEditingImage}
              setActiveTab={setActiveTab}
              setShowAddModal={setShowAddModal}
            />
          )}

          {/* ═══════════════════ PROMOTERS ═══════════════════ */}
          {activeTab === 'promoters' && <Promoters />}
        </main>
      </div>

      {/* Modals */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={(id, up) => {
            updateProduct(id, up, () => setEditingProduct(null));
          }}
        />
      )}
      {deleteConfirm?.isOpen && deleteConfirm.product && (
        <DeleteConfirmModal
          product={deleteConfirm.product}
          onConfirm={() => {
            deleteProduct(deleteConfirm.product._id, () => {
              setDeleteConfirm(null);
            });
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdd={(p: Product) => {
            addProduct(p, () => setShowAddModal(false));
          }}
        />
      )}
      {editingImage && (
        <ImageEditor
          src={editingImage.src}
          label={editingImage.label}
          onClose={() => setEditingImage(null)}
        />
      )}
    </div>
  );
}
