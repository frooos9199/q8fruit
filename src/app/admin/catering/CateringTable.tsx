"use client";
import { useState } from "react";
import CateringEditModal from "./CateringEditModal";

interface CateringCategory {
  id: number;
  name: string;
  products: string[];
  image?: string;
}

const initialCategories: CateringCategory[] = [
  { id: 1, name: "بوفيه فواكه", products: ["سلة فواكه مشكلة", "سلة فواكه صغيرة"] },
  { id: 2, name: "بوكس خضار", products: ["بوكس خضار مشكل"] },
];

export default function CateringTable() {
  const [categories, setCategories] = useState<CateringCategory[]>(initialCategories);

  // مزامنة الكاترينج مع localStorage عند أي تغيير
  const syncCategoriesToStorage = (cats: CateringCategory[]) => {
    window.localStorage.setItem("cateringCategories", JSON.stringify(cats.map(({id, name}) => ({id, name}))));
  };
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState<CateringCategory | null>(null);
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
    setCategories(prev => {
      const newCats = prev.filter(c => c.id !== id);
      syncCategoriesToStorage(newCats);
      return newCats;
    });
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="اسم التصنيف الجديد"
          className="border rounded p-2 bg-gray-800 text-white placeholder-gray-400"
        />
        <button
          onClick={addCategory}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold shadow transition"
        >
          إضافة تصنيف
        </button>
      </div>
      <table className="min-w-full border text-center">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2">الصورة</th>
            <th className="p-2">اسم التصنيف</th>
            <th className="p-2">تعديل</th>
            <th className="p-2">حذف</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-b">
              <td className="p-2">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-16 h-12 object-cover rounded border mx-auto" />
                ) : (
                  <span className="text-gray-400">لا يوجد صورة</span>
                )}
              </td>
              <td className="p-2 font-bold">{cat.name}</td>
              <td className="p-2">
                <button onClick={() => handleEdit(cat)} className="px-3 py-1 rounded bg-blue-600 text-white">تعديل</button>
              </td>
              <td className="p-2">
                <button onClick={() => removeCategory(cat.id)} className="px-3 py-1 rounded bg-red-600 text-white">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
