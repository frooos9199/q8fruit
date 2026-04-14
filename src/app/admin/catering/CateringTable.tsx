"use client";
import { useState, useEffect } from "react";
import CateringEditModal from "./CateringEditModal";

interface CateringCategory {
  id: number;
  name: string;
  products: string[];
  image?: string;
}

interface StoredCategory {
  id: number | string;
  name: string;
  products?: string[];
  image?: string;
}

const normalizeCategory = (cat: StoredCategory, fallbackId: number): CateringCategory => ({
  id: Number.isFinite(Number(cat.id)) ? Number(cat.id) : fallbackId,
  name: cat.name,
  products: Array.isArray(cat.products) ? cat.products : [],
  image: cat.image,
});

const initialCategories: CateringCategory[] = [
  { id: 1, name: "فواكه", products: [] },
  { id: 2, name: "خضار", products: [] },
  { id: 3, name: "ورقيات", products: [] },
  { id: 4, name: "سلات الفواكه", products: [] },
];

export default function CateringTable() {
  const [categories, setCategories] = useState<CateringCategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState<CateringCategory | null>(null);

  // مزامنة الكاترينج مع localStorage عند أي تغيير
  const syncCategoriesToStorage = async (cats: CateringCategory[]) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem("cateringCategories", JSON.stringify(cats));
      try {
        const { syncCateringToFirebase } = await import('../../../lib/firebaseSync');
        await syncCateringToFirebase(cats);
      } catch (error) {
        console.error('خطأ في مزامنة الكاترينج:', error);
      }
    }
  };

  // قراءة الكاترينج من Firebase أولاً، ثم localStorage كـ fallback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadCategories = async () => {
      try {
        const { getCategoriesFromFirebase } = await import('../../../lib/firebaseSync');
        const firebaseCategories = await getCategoriesFromFirebase();

        if (Array.isArray(firebaseCategories) && firebaseCategories.length > 0) {
          const normalized = (firebaseCategories as StoredCategory[]).map((cat, index) =>
            normalizeCategory(cat, index + 1)
          );
          setCategories(normalized);
          window.localStorage.setItem('cateringCategories', JSON.stringify(normalized));
          return;
        }
      } catch (error) {
        console.error('خطأ في تحميل تصنيفات الكاترينج من Firebase:', error);
      }

      const stored = window.localStorage.getItem("cateringCategories");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as StoredCategory[];
          const fullCategories = parsed.map((cat, index) =>
            normalizeCategory(cat, index + 1)
          );
          setCategories(fullCategories);
          return;
        } catch {
          // ignore and seed defaults below
        }
      }

      setCategories(initialCategories);
      syncCategoriesToStorage(initialCategories);
    };

    loadCategories();
  }, []);
  const handleEdit = (category: CateringCategory) => {
    setEditCategory(category);
  };

  const handleSaveEdit = (updated: CateringCategory) => {
    setCategories(prev => {
      const newCats = prev.map(cat => cat.id === updated.id ? updated : cat);
      syncCategoriesToStorage(newCats);
      return newCats;
    });
    setEditCategory(null);
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      const newCat = { id: Date.now(), name: newCategory, products: [], image: undefined };
      setCategories(prev => {
        const newCats = [...prev, newCat];
        syncCategoriesToStorage(newCats);
        return newCats;
      });
      setNewCategory("");
      // لا تفتح نافذة التعديل تلقائيًا بعد الإضافة
    }
  };

  const removeCategory = (id: number) => {
    const categoryToDelete = categories.find(c => c.id === id);
    if (categoryToDelete && window.confirm(`هل أنت متأكد من حذف تصنيف "${categoryToDelete.name}"؟`)) {
      setCategories(prev => {
        const newCats = prev.filter(c => c.id !== id);
        syncCategoriesToStorage(newCats);
        return newCats;
      });
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">إضافة تصنيف جديد</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addCategory()}
            placeholder="اسم التصنيف الجديد"
            className="flex-1 rounded-xl border-2 border-slate-200 bg-white p-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={addCategory}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            إضافة
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-emerald-50 via-white to-cyan-50">
              <th className="p-4 text-right font-bold text-slate-800">الصورة</th>
              <th className="p-4 text-right font-bold text-slate-800">اسم التصنيف</th>
              <th className="p-4 text-center font-bold text-slate-800">عدد المنتجات</th>
              <th className="p-4 text-center font-bold text-slate-800">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat.id} className={`border-b border-slate-200 transition-colors hover:bg-emerald-50/60 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                <td className="p-4">
                  <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-bold text-lg text-slate-800">{cat.name}</span>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-800">
                    {cat.products?.length || 0} منتج
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleEdit(cat)} 
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      تعديل
                    </button>
                    <button 
                      onClick={() => removeCategory(cat.id)} 
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-lg font-medium">لا توجد تصنيفات حالياً</p>
                    <p className="text-sm">قم بإضافة تصنيف جديد للبدء</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {editCategory && (
        <CateringEditModal
          category={editCategory}
          onSave={handleSaveEdit}
          onClose={() => setEditCategory(null)}
        />
      )}
    </div>
  );
}
