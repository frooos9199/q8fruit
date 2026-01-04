"use client";
import { useState, useRef, useCallback } from "react";
import { uploadImage } from "@/lib/uploadImage";
import OptimizedImage from "@/components/OptimizedImage";

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
  images?: string[];
  image?: string;
  category: string;
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

  const handleImagesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const imageUrls: string[] = [];
      
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, "products");
        imageUrls.push(url);
      }
      
      const updatedImages = [...(form.images || []), ...imageUrls];
      setForm((prev) => ({ ...prev, images: updatedImages }));
      
      // لا تحديث localStorage للمنتجات الجديدة (id = 0) - سيتم الحفظ عند النقر على حفظ
      if (form.id !== 0) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const updatedProducts = products.map((p: Product) => 
          p.id === form.id ? { ...p, images: updatedImages } : p
        );
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        
        const { syncAllDataToFirebase } = await import('../../../lib/firebaseSync');
        await syncAllDataToFirebase();
      }
      
      alert(`تم رفع ${imageUrls.length} صورة بنجاح! ✅`);
    } catch (error) {
      console.error("خطأ في رفع الصور:", error);
      alert("فشل رفع الصور. الرجاء المحاولة مرة أخرى.");
    } finally {
      setUploading(false);
    }
  }, [form.id, form.images]);

  const handleRemoveImage = useCallback(async (idx: number) => {
    const updatedImages = (form.images || []).filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, images: updatedImages }));
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const updatedProducts = products.map((p: Product) => 
      p.id === form.id ? { ...p, images: updatedImages } : p
    );
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    try {
      const { syncAllDataToFirebase } = await import('../../../lib/firebaseSync');
      await syncAllDataToFirebase();
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
    }
  }, [form.id, form.images]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }, []);

  const handleSave = useCallback(() => {
    console.log('💾 بدء حفظ المنتج:', form);

    // فحص صحة البيانات
    if (!form.name.trim()) {
      alert('يرجى إدخال اسم المنتج');
      return;
    }

    if (!form.category) {
      alert('يرجى اختيار الفئة');
      return;
    }


    if (!form.units || form.units.length === 0) {
      alert('يرجى إدخال وحدات صحيحة مع أسعار');
      return;
    }
    // إذا كان هناك وحدة سعرها فارغ أو <= 0، يتم تعيينه تلقائيًا إلى 0.001 مع تنبيه
    let unitsFixed = false;
    const fixedUnits = form.units.map(u => {
      if (!u.name.trim() || Number(u.price) <= 0) {
        unitsFixed = true;
        return { ...u, price: 0.001 };
      }
      return { ...u, price: Number(u.price) };
    });
    if (unitsFixed) {
      alert('تم تصحيح بعض الأسعار الفارغة أو غير الصحيحة تلقائيًا إلى 0.001 د.ك. يرجى مراجعة الأسعار.');
    }

    // استخدام البيانات الحالية مباشرة بدون جلب من localStorage
    const updatedForm = {
      ...form,
      name: form.name.trim(),
      category: form.category.trim(),
      units: fixedUnits.map(u => ({
        name: u.name.trim(),
        price: Number(u.price)
      }))
    };

    console.log('✅ المنتج المحدث النهائي:', updatedForm);
    onSave(updatedForm);
  }, [form, onSave]);

  const handleUnitChange = useCallback((idx: number, field: keyof ProductUnit, value: string | number) => {
    try {
      console.log(`💰 تغيير الوحدة ${idx}:`, field, '=', value);
      
      setForm((prev) => {
        const units = [...prev.units];
        if (units[idx]) {
          units[idx] = {
            ...units[idx],
            [field]: field === "price" ? (Number(value) || 0) : String(value)
          };
        }
        return { ...prev, units };
      });
    } catch (error) {
      console.error('خطأ في تغيير الوحدة:', error);
    }
  }, []);

  const addUnit = useCallback(() => {
    setForm((prev) => ({ ...prev, units: [...prev.units, { name: "", price: 0 }] }));
  }, []);

  const removeUnit = useCallback((idx: number) => {
    setForm((prev) => ({ ...prev, units: prev.units.filter((_, i) => i !== idx) }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg min-w-[320px] max-w-[600px] max-h-[90vh] overflow-y-auto rtl">
        <h2 className="text-xl font-bold mb-4 text-center">تعديل المنتج</h2>

        <div className="flex flex-col gap-3">
          <label className="mb-2">
            صور المنتج
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {form.images && form.images.length > 0 && form.images.map((img, idx) => (
                <div key={`${img}-${idx}`} className="relative group">
                  <img
                    src={img}
                    alt={`صورة المنتج ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      console.error('فشل تحميل الصورة:', img);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 hover:bg-red-700 transition-colors"
                    aria-label={`حذف الصورة ${idx + 1}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
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
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إضافة صور
                  </>
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
              required
            />
          </label>
          
          <label>
            الفئة
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
              required
            >
              <option value="">اختر الفئة</option>
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
              <button 
                type="button" 
                onClick={addUnit} 
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-bold transition-colors"
              >
                <svg className="w-4 h-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة وحدة
              </button>
            </div>
            {form.units.map((unit, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  value={unit.name}
                  onChange={e => handleUnitChange(idx, "name", e.target.value)}
                  placeholder="اسم الوحدة"
                  className="border rounded p-1 w-1/2"
                  required
                />
                <input
                  type="number"
                  value={unit.price}
                  onChange={e => handleUnitChange(idx, "price", e.target.value)}
                  placeholder="السعر"
                  className="border rounded p-1 w-1/3"
                  min={0}
                  step={0.01}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => removeUnit(idx)} 
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition-colors"
                  aria-label={`حذف الوحدة ${idx + 1}`}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white font-bold transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-bold transition-colors"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
