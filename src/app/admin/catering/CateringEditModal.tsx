"use client";
import { useState } from "react";

interface CateringCategory {
  id: number;
  name: string;
  products: string[];
  image?: string;
}

interface CateringEditModalProps {
  category: CateringCategory;
  onSave: (category: CateringCategory) => void;
  onClose: () => void;
}

export default function CateringEditModal({ category, onSave, onClose }: CateringEditModalProps) {

  const [form, setForm] = useState<CateringCategory>({ ...category });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // رفع صورة جديدة
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({ ...prev, image: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // إضافة منتج جديد
  const [newProduct, setNewProduct] = useState("");

  const handleAddProduct = () => {
    if (newProduct.trim()) {
      setForm((prev) => ({ ...prev, products: [...prev.products, newProduct] }));
      setNewProduct("");
    }
  };

  const handleRemoveProduct = (idx: number) => {
    setForm((prev) => ({ ...prev, products: prev.products.filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-900 rounded-lg p-6 min-w-[340px] shadow-2xl border border-gray-700">
        <h2 className="text-lg font-bold mb-4 text-white">تعديل التصنيف</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-white">اسم التصنيف</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-700 rounded p-2 w-full bg-gray-800 text-white placeholder-gray-400"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-white">صورة التصنيف</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => document.getElementById('catering-image-input')?.click()}
              className="px-4 py-2 bg-blue-700 text-white rounded shadow hover:bg-blue-800 transition"
            >
              {form.image ? 'تغيير الصورة' : 'إضافة صورة'}
            </button>
            <input
              id="catering-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {form.image && (
              <img src={form.image} alt="صورة التصنيف" className="rounded w-32 h-24 object-cover border border-gray-700" />
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-white">المنتجات المرتبطة بالتصنيف</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newProduct}
              onChange={e => setNewProduct(e.target.value)}
              placeholder="اسم المنتج الجديد"
              className="border border-gray-700 rounded p-2 flex-1 bg-gray-800 text-white placeholder-gray-400"
            />
            <button onClick={handleAddProduct} className="px-3 py-1 bg-blue-700 text-white rounded">إضافة</button>
          </div>
          <ul className="space-y-1">
            {form.products.map((prod, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1 text-white">
                <span className="flex-1">{prod}</span>
                <button onClick={() => handleRemoveProduct(idx)} className="text-red-400 text-xs">حذف</button>
              </li>
            ))}
            {form.products.length === 0 && <li className="text-gray-400">لا يوجد منتجات</li>}
          </ul>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-700 text-white">إلغاء</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-green-700 text-white">حفظ</button>
        </div>
      </div>
    </div>
  );
}
