"use client";
import { useState, useEffect } from "react";

// يمكنك تعديل هذه القائمة حسب الخدمات المطلوبة
const defaultKeys = [
  { key: "smsApiToken", label: "توكن SMS API", value: "" },
  { key: "smsApiIP", label: "IP SMS API", value: "" },
  { key: "paymentToken", label: "توكن بوابة الدفع", value: "" },
  { key: "paymentIP", label: "IP بوابة الدفع", value: "" },
  { key: "whatsappNumber", label: "رقم واتساب الدعم", value: "" },
  { key: "supportPhone", label: "رقم هاتف الدعم", value: "" },
  // أضف المزيد حسب الحاجة
];

export default function ApiKeysSettings() {
  const [fields, setFields] = useState(defaultKeys);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadApiKeys = async () => {
      try {
        const { getApiKeysFromFirebase } = await import('../../../lib/firebaseSync');
        const firebaseFields = await getApiKeysFromFirebase();

        if (Array.isArray(firebaseFields) && firebaseFields.length > 0) {
          setFields(firebaseFields);
          window.localStorage.setItem('apiKeys', JSON.stringify(firebaseFields));
          return;
        }
      } catch (error) {
        console.error('خطأ في تحميل مفاتيح الربط من Firebase:', error);
      }

      const stored = window.localStorage.getItem('apiKeys');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setFields(parsed);
          }
        } catch {
          setFields(defaultKeys);
        }
      }
    };

    loadApiKeys();
  }, []);

  const handleChange = (idx: number, value: string) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, value } : f)));
  };

  const handleSave = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("apiKeys", JSON.stringify(fields));
      try {
        const { syncApiKeysToFirebase } = await import('../../../lib/firebaseSync');
        await syncApiKeysToFirebase(fields);
      } catch (error) {
        console.error('خطأ في حفظ مفاتيح الربط في Firebase:', error);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-emerald-100 bg-white/92 p-8 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
      <h2 className="mb-6 text-center text-2xl font-bold text-cyan-700">إعدادات الربط والتوكنات</h2>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-5">
        {fields.map((field, idx) => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="mb-1 font-bold text-slate-700">{field.label}</label>
            <input
              type="text"
              className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 outline-none focus:ring-2 focus:ring-cyan-400"
              value={field.value}
              onChange={e => handleChange(idx, e.target.value)}
              placeholder={field.label}
            />
          </div>
        ))}
        <button type="submit" className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 py-3 text-lg font-bold text-white shadow transition hover:from-emerald-700 hover:to-teal-600">حفظ الإعدادات</button>
        {saved && <div className="text-green-600 text-center font-bold mt-2">تم الحفظ بنجاح</div>}
      </form>
      <p className="mt-4 text-center text-xs text-slate-500">يتم تحميل هذه الإعدادات من Firebase وحفظها فيه، مع localStorage كنسخة كاش فقط.</p>
    </div>
  );
}
