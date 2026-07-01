import { AdminApi, CategoryItem } from '@/api/admin';
import { useStore } from '@/context/StoreContext';
import { useState } from 'react';

export default function Categories() {
  const { siteContent, setSiteContent } = useStore();
  const { saveCategory, updateCategory, deleteCategory, fetchSiteContent } =
    AdminApi();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'category' as 'category' | 'subcategory',
    parentId: '',
  });

  const parentCategories = siteContent.categories.filter(
    (item) => item.type !== 'subcategory',
  );
  const activeParentCategoryCount = parentCategories.filter(
    (item) => item.isActive !== false,
  ).length;

  const refresh = async () => {
    const data = await fetchSiteContent();
    setSiteContent((prev) => ({ ...prev, categories: data.categories }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      await updateCategory(editingId, {
        name: form.name,
        description: form.description,
        type: form.type,
        parentId: form.parentId || null,
      });
    } else {
      await saveCategory({
        name: form.name,
        description: form.description,
        type: form.type,
        parentId: form.parentId || null,
        isActive:
          form.type === 'subcategory' || activeParentCategoryCount < 4
            ? true
            : false,
      });
    }

    setForm({
      name: '',
      description: '',
      type: 'category',
      parentId: '',
    });
    setEditingId(null);
    refresh();
  };

  const startEdit = (item: CategoryItem) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description || '',
      type: item.type || 'category',
      parentId: item.parentId || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category and its subcategories?')) return;
    const ok = await deleteCategory(id);
    if (ok) refresh();
  };

  return (
    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
      <div className="bg-white rounded-2xl border border-gold-100 p-5 shadow-xs">
        <h4 className="font-semibold text-maroon-900 mb-4">
          {editingId ? 'Edit Menu Item' : 'Create Menu Item'}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as 'category' | 'subcategory',
                })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2 bg-white"
            >
              <option value="category">Category</option>
              <option value="subcategory">Subcategory</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              placeholder="e.g. Bridal Wear"
            />
          </div>
          {form.type === 'subcategory' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                Parent Category
              </label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full rounded-xl border border-gold-200 px-3 py-2 bg-white"
              >
                <option value="">Select parent category</option>
                {parentCategories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-xl border border-gold-200 px-3 py-2"
              rows={3}
              placeholder="Optional description"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-maroon-900 px-4 py-2.5 text-sm font-semibold text-gold-100"
            >
              {editingId ? 'Update' : 'Save'} Menu Item
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    name: '',
                    description: '',
                    type: 'category',
                    parentId: '',
                  });
                }}
                className="rounded-xl border border-gold-200 px-4 py-2.5 text-sm font-semibold text-maroon-900"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gold-100 p-5 pr-0 shadow-xs">
          <h4 className="font-semibold text-maroon-900 mb-4">
            Current Menu Structure
          </h4>
          <div className="space-y-3 max-h-[52vh] overflow-y-auto">
            {siteContent.categories.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-gold-100 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-maroon-900">
                      {item.name}
                    </div>
                    <div className="text-xs text-maroon-700/70">
                      {item.type === 'subcategory' ? 'Subcategory' : 'Category'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="rounded-lg border border-gold-200 px-2.5 py-1 text-xs font-semibold text-maroon-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
