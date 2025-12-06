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
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("apiKeys");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setFields(parsed);
        } catch {}
      }
    }
  }, []);

  const handleChange = (idx: number, value: string) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, value } : f)));
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("apiKeys", JSON.stringify(fields));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-pink-600 text-center">إعدادات الربط والتوكنات</h2>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-5">
        {fields.map((field, idx) => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="font-bold text-gray-700 dark:text-gray-200 mb-1">{field.label}</label>
            <input
              type="text"
              className="rounded p-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-400 outline-none"
              value={field.value}
              onChange={e => handleChange(idx, e.target.value)}
              placeholder={field.label}
            />
          </div>
        ))}
        <button type="submit" className="w-full bg-pink-600 hover:bg-green-600 text-white font-bold py-3 rounded-full shadow text-lg transition">حفظ الإعدادات</button>
        {saved && <div className="text-green-600 text-center font-bold mt-2">تم الحفظ بنجاح</div>}
      </form>
    </div>
  );
}
