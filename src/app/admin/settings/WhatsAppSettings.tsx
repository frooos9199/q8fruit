"use client";
import { useState, useEffect } from "react";

export default function WhatsAppSettings() {
  const [whatsappNumbers, setWhatsappNumbers] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // تحميل الأرقام المحفوظة
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("whatsappNumbers");
      if (saved) {
        setWhatsappNumbers(JSON.parse(saved));
      } else {
        // رقم افتراضي
        setWhatsappNumbers(["96550540999"]);
      }
    }
  }, []);

  const saveNumbers = (numbers: string[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("whatsappNumbers", JSON.stringify(numbers));
      // مزامنة مع Firebase
      import('../../../lib/firebaseSync').then(({ syncAllDataToFirebase }) => {
        syncAllDataToFirebase().catch(console.error);
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
          <span className="text-2xl">📱</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">أرقام الواتساب</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">إدارة أرقام استقبال الفواتير</p>
        </div>
      </div>

      {/* قائمة الأرقام الحالية */}
      <div className="space-y-3 mb-6">
        {whatsappNumbers.map((number, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
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
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">إضافة رقم جديد</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="tel"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="مثال: 50540999 أو 96550540999"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          * سيتم إضافة كود الكويت (965) تلقائياً إذا لم يكن موجود
        </p>
      </div>

      {/* معلومات إضافية */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-xl">ℹ️</span>
          <div className="text-sm text-blue-800 dark:text-blue-200">
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