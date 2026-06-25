import { useStore } from '@/context/StoreContext';
import { Icon } from '../Icons';
import { AdminTab } from '../pages/AdminDashboard';

export default function Media({
  setEditingImage,
  setActiveTab,
  setShowAddModal,
}: {
  setEditingImage: ({ src, label }: { src: string; label: string }) => void;
  setActiveTab: (tab: AdminTab) => void;
  setShowAddModal: (show: boolean) => void;
}) {
  const { products, showToast } = useStore();
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gold-100 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display text-xl font-bold text-maroon-900">
              🖼️ Media Studio
            </h3>
            <p className="text-xs text-maroon-700/70 mt-1">
              Browse, edit, and manage all website images. Click any image to
              adjust brightness, contrast, rotation & zoom.
            </p>
          </div>
          <span className="text-xs bg-maroon-50 px-3 py-1.5 rounded-lg font-bold text-maroon-800">
            {products.length} products using these
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {[
            {
              label: 'Hero Bridal',
              path: '/images/hero-bride.jpg',
              usage: 'Hero Banner',
              usedIn: products.filter(
                (p) => p.image === '/images/hero-bride.jpg',
              ).length,
            },
            {
              label: 'Kanjivaram Silk',
              path: '/images/saree-kanjivaram.jpg',
              usage: 'Catalogue & Category',
              usedIn: products.filter(
                (p) => p.image === '/images/saree-kanjivaram.jpg',
              ).length,
            },
            {
              label: 'Banarasi Brocade',
              path: '/images/saree-banarasi.jpg',
              usage: 'Catalogue & Category',
              usedIn: products.filter(
                (p) => p.image === '/images/saree-banarasi.jpg',
              ).length,
            },
            {
              label: 'Soft Silk Pattu',
              path: '/images/saree-pattu.jpg',
              usage: 'Catalogue & Category',
              usedIn: products.filter(
                (p) => p.image === '/images/saree-pattu.jpg',
              ).length,
            },
            {
              label: 'Designer Silk',
              path: '/images/saree-designer.jpg',
              usage: 'Catalogue & Category',
              usedIn: products.filter(
                (p) => p.image === '/images/saree-designer.jpg',
              ).length,
            },
            {
              label: 'Model – Pink',
              path: '/images/model1.jpg',
              usage: 'Bridal Section',
              usedIn: products.filter((p) => p.image === '/images/model1.jpg')
                .length,
            },
            {
              label: 'Model – Mustard',
              path: '/images/model2.jpg',
              usage: 'Bridal Section',
              usedIn: products.filter((p) => p.image === '/images/model2.jpg')
                .length,
            },
            {
              label: 'Master Artisan',
              path: '/images/artisan.jpg',
              usage: 'Heritage Section',
              usedIn: products.filter((p) => p.image === '/images/artisan.jpg')
                .length,
            },
          ].map((img, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gold-100 shadow-xs overflow-hidden hover:shadow-md hover:border-gold-300 transition-all group"
            >
              <div className="relative aspect-square overflow-hidden bg-maroon-50">
                <img
                  src={img.path}
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Edit overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() =>
                      setEditingImage({
                        src: img.path,
                        label: img.label,
                      })
                    }
                    className="px-3 py-2 bg-white text-maroon-900 rounded-xl text-xs font-bold hover:bg-gold-50 flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform hover:scale-105"
                  >
                    <Icon.edit /> Edit Image
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('catalogue');
                      showToast(
                        'Go to Catalogue to assign this image',
                        'warning',
                      );
                    }}
                    className="px-3 py-2 bg-maroon-900 text-gold-100 rounded-xl text-xs font-bold hover:bg-maroon-800 flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform hover:scale-105"
                  >
                    <Icon.image /> Use in Product
                  </button>
                </div>
                {/* Quick quality indicators */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                  <span className="text-[8px] bg-white/90 backdrop-blur text-maroon-900 px-1.5 py-0.5 rounded font-bold">
                    {img.usage}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-maroon-900 truncate">
                  {img.label}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] bg-maroon-100 text-maroon-800 px-2 py-0.5 rounded-full font-medium">
                    {img.usedIn} product{img.usedIn !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() =>
                      setEditingImage({
                        src: img.path,
                        label: img.label,
                      })
                    }
                    className="text-[10px] text-gold-600 font-bold hover:text-gold-700 cursor-pointer flex items-center gap-1"
                  >
                    <Icon.edit /> Adjust
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload section */}
      <div className="bg-gradient-to-br from-maroon-900 to-maroon-800 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-20 pointer-events-none" />
        <div className="relative">
          <div className="text-4xl mb-3">📸</div>
          <h3 className="font-display text-xl font-bold text-gold-200 mb-2">
            Upload New Images
          </h3>
          <p className="text-sm text-gold-100/70 mb-4 max-w-lg mx-auto">
            Open the <strong className="text-gold-300">Catalogue</strong> tab,
            click <strong className="text-gold-300">Edit</strong> on any saree,
            and use the drag-and-drop upload zone. You can adjust
            brightness/contrast in the editor.
          </p>
          <button
            onClick={() => {
              setActiveTab('catalogue');
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-gold-500 text-white rounded-full text-sm font-bold hover:bg-gold-400 transition-colors cursor-pointer shadow-lg"
          >
            Go to Catalogue & Upload
          </button>
        </div>
      </div>
    </div>
  );
}
