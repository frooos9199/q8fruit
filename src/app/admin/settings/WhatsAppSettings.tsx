"use client";
import { useState, useEffect } from "react";

export default function WhatsAppSettings() {
  const [whatsappNumbers, setWhatsappNumbers] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNumbers = async () => {
      if (typeof window === "undefined") return;

      try {
        const { getWhatsAppNumbersFromFirebase } = await import('../../../lib/firebaseSync');
        const firebaseNumbers = await getWhatsAppNumbersFromFirebase();

        if (Array.isArray(firebaseNumbers) && firebaseNumbers.length > 0) {
          setWhatsappNumbers(firebaseNumbers);
          localStorage.setItem("whatsappNumbers", JSON.stringify(firebaseNumbers));
          return;
        }
      } catch (error) {
        console.error('خطأ في تحميل أرقام الواتساب من Firebase:', error);
      }

      const saved = localStorage.getItem("whatsappNumbers");
      if (saved) {
        setWhatsappNumbers(JSON.parse(saved));
      } else {
        setWhatsappNumbers(["96550540999"]);
      }
    };

    loadNumbers();
  }, []);

  const saveNumbers = (numbers: string[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("whatsappNumbers", JSON.stringify(numbers));
      import('../../../lib/firebaseSync').then(({ syncWhatsAppNumbersToFirebase }) => {
        syncWhatsAppNumbersToFirebase(numbers).catch(console.error);
      });
    }
  };

  const addNumber = () => {
    if (!newNumber.trim()) return;
    
    // تنظيف الرقم
    const cleanNumber = newNumber.replace(/[^\d]/g, "");
    if (cleanNumber.length < 8) {
      alert("رقم الهاتف غير صحيح");
      return;
    }

    // إضافة كود الكويت إذا لم يكن موجود
    const formattedNumber = cleanNumber.startsWith("965") ? cleanNumber : `965${cleanNumber}`;
    
    if (whatsappNumbers.includes(formattedNumber)) {
      alert("هذا الرقم موجود بالفعل");
      return;
    }

    const updated = [...whatsappNumbers, formattedNumber];
    setWhatsappNumbers(updated);
    saveNumbers(updated);
    setNewNumber("");
  };

  const removeNumber = (index: number) => {
    if (whatsappNumbers.length === 1) {
      alert("يجب أن يكون هناك رقم واحد على الأقل");
      return;
    }
    
    const updated = whatsappNumbers.filter((_, i) => i !== index);
    setWhatsappNumbers(updated);
    saveNumbers(updated);
  };

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
          <span className="text-2xl">📱</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">أرقام الواتساب</h2>
          <p className="text-sm text-slate-600">إدارة أرقام استقبال الفواتير</p>
        </div>
      </div>

      {/* قائمة الأرقام الحالية */}
      <div className="space-y-3 mb-6">
        {whatsappNumbers.map((number, index) => (
          <div key={index} className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-green-600 text-xl">📞</span>
              <span className="font-mono text-lg">+{number}</span>
              {index === 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">رئيسي</span>
              )}
            </div>
            <button
              onClick={() => removeNumber(index)}
              disabled={whatsappNumbers.length === 1}
              className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="حذف الرقم"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* إضافة رقم جديد */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="mb-3 font-semibold text-slate-800">إضافة رقم جديد</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="tel"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="مثال: 50540999 أو 96550540999"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-transparent focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={addNumber}
            disabled={loading || !newNumber.trim()}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            إضافة
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          * سيتم إضافة كود الكويت (965) تلقائياً إذا لم يكن موجود
        </p>
      </div>

      {/* معلومات إضافية */}
      <div className="mt-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-xl">ℹ️</span>
          <div className="text-sm text-cyan-900">
            <p className="font-semibold mb-1">كيف يعمل النظام:</p>
            <ul className="space-y-1 text-xs">
              <li>• عند تأكيد أي طلب، ستصل الفاتورة للرقم الرئيسي</li>
              <li>• يمكن إرسال الفواتير لأي رقم من لوحة الإدارة</li>
              <li>• الرقم الأول في القائمة هو الرقم الرئيسي</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}