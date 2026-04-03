"use client";
import { useState } from "react";
import { uploadImage } from "@/lib/uploadImage";

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
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // رفع صورة جديدة إلى Firebase Storage
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        // رفع الصورة إلى Firebase Storage
        const imageUrl = await uploadImage(file, 'catering');
        setForm((prev) => ({ ...prev, image: imageUrl }));
        alert('تم رفع الصورة بنجاح! ✅');
      } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
        alert('فشل رفع الصورة. تأكد من اتصال الإنترنت.');
      } finally {
        setUploading(false);
      }
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
    // التحقق من أن الاسم غير فارغ
    if (!form.name.trim()) {
      alert('يرجى إدخال اسم التصنيف');
      return;
    }
    
    // حفظ التغييرات
    onSave({
      ...form,
      name: form.name.trim()
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/80 bg-white/95 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">تعديل التصنيف</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors"
            >
              &times;
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-slate-700">اسم التصنيف</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none"
                placeholder="أدخل اسم التصنيف"
              />
            </div>
            
            <div>
              <label className="block mb-3 font-semibold text-slate-700">صورة التصنيف</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('catering-image-input')?.click()}
                  disabled={uploading}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg ${
                    uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl'
                  } text-white`}
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الرفع...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{form.image ? 'تغيير الصورة' : 'إضافة صورة'}</span>
                    </>
                  )}
                </button>
                <input
                  id="catering-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="hidden"
                />
                {form.image && (
                  <div className="relative">
                    <img src={form.image} alt="صورة التصنيف" className="h-24 w-32 rounded-xl border-2 border-slate-200 object-cover shadow-md" />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, image: undefined }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block mb-3 font-semibold text-slate-700">المنتجات المرتبطة</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newProduct}
                  onChange={e => setNewProduct(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddProduct()}
                  placeholder="اسم المنتج الجديد"
                  className="flex-1 rounded-xl border-2 border-slate-200 bg-white p-3 text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none"
                />
                <button 
                  onClick={handleAddProduct} 
                  className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  إضافة
                </button>
              </div>
              
              <div className="max-h-40 overflow-y-auto">
                {form.products.length > 0 ? (
                  <div className="space-y-2">
                    {form.products.map((prod, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="font-medium text-slate-800">{prod}</span>
                        <button 
                          onClick={() => handleRemoveProduct(idx)} 
                          className="rounded-lg px-2 py-1 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500">
                    <svg className="mx-auto mb-3 w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="font-medium">لا توجد منتجات مرتبطة</p>
                    <p className="text-sm mt-1">قم بإضافة منتجات لهذا التصنيف</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button 
              onClick={onClose} 
              className="px-6 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              إلغاء
            </button>
            <button 
              onClick={handleSave} 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              حفظ التغييرات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
