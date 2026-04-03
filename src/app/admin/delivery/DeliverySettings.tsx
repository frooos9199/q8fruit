"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function DeliverySettings() {
  const [deliveryNote, setDeliveryNote] = useState("التوصيل خلال ساعتين");
  const [deliveryTime, setDeliveryTime] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("deliveryTime");
      if (stored) return stored;
    }
    return "خلال ساعتين";
  });
  // حفظ وقت التوصيل في localStorage عند كل تغيير
  const saveDeliveryTime = (time: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("deliveryTime", time);
    }
  };
  const [deliveryPrice, setDeliveryPrice] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("deliveryPrice");
      if (stored && !isNaN(Number(stored))) return Number(stored);
    }
    return 2.5;
  });
  const [saved, setSaved] = useState(false);

  // حفظ قيمة التوصيل في localStorage عند كل تغيير
  const saveDeliveryPrice = async (price: number) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("deliveryPrice", String(price));
    }
    
    // حفظ في Firebase أيضاً
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'delivery'), {
          deliveryPrice: price, // ✅ استخدام deliveryPrice بدلاً من price
          price: price, // للتوافق مع الإصدارات القديمة
          note: deliveryNote,
          time: deliveryTime,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        console.log('✅ تم حفظ سعر التوصيل في Firebase:', price);
      } catch (error) {
        console.error('❌ خطأ في حفظ سعر التوصيل في Firebase:', error);
      }
    }
  };

  const handleSave = async () => {
    await saveDeliveryPrice(deliveryPrice);
    saveDeliveryTime(deliveryTime);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-800">إعدادات التوصيل</h2>
      <label className="block mb-3">
        <span className="font-semibold">ملاحظة التوصيل (تظهر في السلة والفاتورة):</span>
        <textarea
          className="mt-1 min-h-[60px] w-full rounded-xl border border-slate-300 p-3"
          value={deliveryNote}
          onChange={e => setDeliveryNote(e.target.value)}
          placeholder="مثال: التوصيل خلال ساعتين أو حسب الاتفاق..."
        />
      </label>
      <label className="block mb-3">
        <span className="font-semibold">وقت التوصيل (يظهر بجانب التوصيل):</span>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-300 p-3"
          value={deliveryTime}
          onChange={e => {
            setDeliveryTime(e.target.value);
            saveDeliveryTime(e.target.value);
          }}
          placeholder="مثال: خلال ساعتين أو حسب الاتفاق"
        />
      </label>
      <label className="block mb-3">
        <span className="font-semibold">قيمة التوصيل (د.ك):</span>
        <input
          type="number"
          className="mt-1 w-full rounded-xl border border-slate-300 p-3"
          value={deliveryPrice}
          onChange={e => {
            const val = Number(e.target.value);
            setDeliveryPrice(val);
            saveDeliveryPrice(val);
          }}
          min={0}
          step={0.1}
        />
        <p className="mt-1 text-xs text-slate-500">
          💡 يتم الحفظ تلقائياً في Firebase للتطبيق
        </p>
      </label>
      <button
        onClick={handleSave}
        className="mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 font-bold text-white"
      >
        حفظ
      </button>
      {saved && <div className="text-green-600 mt-2">تم الحفظ بنجاح</div>}
    </div>
  );
}
