"use client";
import { useState, useEffect } from "react";

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
  const saveDeliveryPrice = (price: number) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("deliveryPrice", String(price));
    }
  };

  const handleSave = () => {
    saveDeliveryPrice(deliveryPrice);
    saveDeliveryTime(deliveryTime);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">إعدادات التوصيل</h2>
      <label className="block mb-3">
        <span className="font-semibold">ملاحظة التوصيل (تظهر في السلة والفاتورة):</span>
        <textarea
          className="w-full border rounded p-2 mt-1 min-h-[60px]"
          value={deliveryNote}
          onChange={e => setDeliveryNote(e.target.value)}
          placeholder="مثال: التوصيل خلال ساعتين أو حسب الاتفاق..."
        />
      </label>
      <label className="block mb-3">
        <span className="font-semibold">وقت التوصيل (يظهر بجانب التوصيل):</span>
        <input
          type="text"
          className="w-full border rounded p-2 mt-1"
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
          className="w-full border rounded p-2 mt-1"
          value={deliveryPrice}
          onChange={e => {
            const val = Number(e.target.value);
            setDeliveryPrice(val);
            saveDeliveryPrice(val);
          }}
          min={0}
          step={0.1}
        />
      </label>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-green-600 text-white rounded font-bold mt-2"
      >
        حفظ
      </button>
      {saved && <div className="text-green-600 mt-2">تم الحفظ بنجاح</div>}
    </div>
  );
}
