"use client";
import { useState, useRef } from "react";
import { uploadImage } from "@/lib/uploadImage";




interface ProductUnit {
  name: string;
  price: number;
}

interface Product {
  id: number;
  name: string;
  units: ProductUnit[];
  quantity: number;
  active: boolean;
  images?: string[]; // صور متعددة
  image?: string; // دعم خلفي للصورة القديمة
  category: string; // اسم الكاترينج
}

interface Props {
  product: Product;
  onSave: (product: Product) => void;
  onClose: () => void;
  categories?: { id: number; name: string }[];
}

export default function ProductEditModal({ product, onSave, onClose, categories }: Props) {

  const [form, setForm] = useState<Product>({ ...product });
  const [uploading, setUploading] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  // رفع عدة صور
  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      try {
        const imageUrls: string[] = [];
        
        for (const file of Array.from(files)) {
          const url = await uploadImage(file, "products");
          imageUrls.push(url);
        }
        
        setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...imageUrls] }));
        alert(`تم رفع ${imageUrls.length} صورة بنجاح! ✅`);
      } catch (error) {
        console.error("خطأ في رفع الصور:", error);
        alert("فشل رفع الصور. الرجاء المحاولة مرة أخرى.");
      } finally {
        setUploading(false);
      }
    }
  };

  // حذف صورة
  const handleRemoveImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }));
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // وحدات المنتج
  const handleUnitChange = (idx: number, field: keyof ProductUnit, value: string | number) => {
    setForm((prev) => {
      const units = prev.units.map((unit, i) =>
        i === idx ? { ...unit, [field]: field === "price" ? Number(value) : value } : unit
      );
      return { ...prev, units };
    });
  };

  const addUnit = () => {
    setForm((prev) => ({ ...prev, units: [...prev.units, { name: "", price: 0 }] }));
  };

  const removeUnit = (idx: number) => {
    setForm((prev) => ({ ...prev, units: prev.units.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg min-w-[320px]">
        <h2 className="text-xl font-bold mb-4">تعديل المنتج</h2>


        <div className="flex flex-col gap-3">
          <label className="mb-2">
            صور المنتج
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {(form.images && form.images.length > 0) && form.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt="صورة المنتج" className="w-20 h-20 object-cover rounded border" />
                  <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100">&times;</button>
                </div>
              ))}
              <button
                type="button"
                className="px-2 py-1 bg-blue-500 text-white rounded text-sm flex items-center gap-2 disabled:opacity-50"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الرفع...
                  </>
                ) : (
                  'إضافة صور'
                )}
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInput}
                style={{ display: "none" }}
                multiple
                onChange={handleImagesChange}
              />
            </div>
          </label>



          <label>
            اسم المنتج
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </label>
          <label>
            الكاترينج
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
              required
            >
              <option value="">اختر الكاترينج</option>
              {categories && categories.length > 0 ? (
                categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))
              ) : (
                <>
                  <option value="فواكه">فواكه</option>
                  <option value="خضار">خضار</option>
                  <option value="ورقيات">ورقيات</option>
                  <option value="سلات الفواكه">سلات الفواكه</option>
                </>
              )}
            </select>
          </label>
          <label>
            الكمية المتوفرة
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              min={0}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
              placeholder="الكمية المتوفرة في المخزون"
              required
            />
          </label>
          <div className="border rounded p-2 mt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">الوحدات والأسعار</span>
              <button type="button" onClick={addUnit} className="px-2 py-1 bg-green-500 text-white rounded text-sm">إضافة وحدة</button>
            </div>
            {form.units.map((unit, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  value={unit.name}
                  onChange={e => handleUnitChange(idx, "name", e.target.value)}
                  placeholder="اسم الوحدة"
                  className="border rounded p-1 w-1/2"
                />
                <input
                  type="number"
                  value={unit.price}
                  onChange={e => handleUnitChange(idx, "price", e.target.value)}
                  placeholder="السعر"
                  className="border rounded p-1 w-1/3"
                />
                <button type="button" onClick={() => removeUnit(idx)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">حذف</button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-400 text-white"
          >
            إلغاء
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
