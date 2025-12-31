"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface StorageData {
  key: string;
  value: any;
  size: string;
}

export default function StorageViewerPage() {
  const [storageData, setStorageData] = useState<StorageData[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // دالة لحساب حجم البيانات
  const getDataSize = useCallback((data: string): string => {
    const bytes = new Blob([data]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const data: StorageData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsedValue = JSON.parse(value);
            data.push({
              key,
              value: parsedValue,
              size: getDataSize(value)
            });
          } catch {
            data.push({
              key,
              value: value,
              size: getDataSize(value)
            });
          }
        }
      }
    }
    setStorageData(data.sort((a, b) => a.key.localeCompare(b.key)));
  }, [getDataSize]);

  // دالة لتحميل البيانات من localStorage (للاستخدام في أزرار إعادة التحميل)
  const loadStorageData = useCallback(() => {
    if (typeof window === "undefined") return;

    const data: StorageData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsedValue = JSON.parse(value);
            data.push({
              key,
              value: parsedValue,
              size: getDataSize(value)
            });
          } catch {
            data.push({
              key,
              value: value,
              size: getDataSize(value)
            });
          }
        }
      }
    }
    setStorageData(data.sort((a, b) => a.key.localeCompare(b.key)));
  }, [getDataSize]);

  // تصفية البيانات حسب البحث
  const filteredData = storageData.filter(item =>
    item.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // دالة لحذف مفتاح معين
  const deleteKey = (key: string) => {
    if (window.confirm(`هل أنت متأكد من حذف "${key}"؟`)) {
      localStorage.removeItem(key);
      loadStorageData();
      setSelectedKey(null);
    }
  };

  // دالة لمسح جميع البيانات
  const clearAllStorage = () => {
    if (window.confirm("هل أنت متأكد من حذف جميع البيانات المحفوظة؟ هذا الإجراء لا يمكن التراجع عنه!")) {
      localStorage.clear();
      loadStorageData();
      setSelectedKey(null);
    }
  };

  const selectedData = storageData.find(item => item.key === selectedKey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* الهيدر */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                عارض البيانات المحفوظة
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                جميع البيانات المحفوظة في localStorage
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة للرئيسية
            </button>
          </div>

          {/* شريط البحث والأدوات */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="البحث في المفاتيح..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl p-3 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={loadStorageData}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              تحديث
            </button>
            <button
              onClick={clearAllStorage}
              className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              مسح الكل
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة المفاتيح */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                المفاتيح المحفوظة ({filteredData.length})
              </h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredData.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => setSelectedKey(item.key)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      selectedKey === item.key
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900'
                        : 'border-gray-200 dark:border-slate-600 hover:border-green-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {item.key}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded-full">
                        {item.size}
                      </span>
                    </div>
                  </div>
                ))}
                
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                    </svg>
                    <p className="font-medium">لا توجد بيانات محفوظة</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* عرض البيانات */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
              {selectedData ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      {selectedData.key}
                    </h2>
                    <button
                      onClick={() => deleteKey(selectedData.key)}
                      className="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      حذف
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 max-h-96 overflow-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedData.value, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    الحجم: {selectedData.size}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">اختر مفتاحاً لعرض محتواه</p>
                  <p className="text-sm mt-1">انقر على أي مفتاح من القائمة الجانبية</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}