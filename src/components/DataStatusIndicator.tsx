"use client";
import { useState, useEffect } from "react";

export default function DataStatusIndicator() {
  const [dataStatus, setDataStatus] = useState({
    loading: true,
    synced: false,
    lastSync: null as Date | null,
    error: null as string | null
  });

  useEffect(() => {
    // مراقبة حالة البيانات
    const checkDataStatus = () => {
      if (typeof window !== 'undefined') {
        const products = localStorage.getItem('products');
        const categories = localStorage.getItem('cateringCategories');
        const lastSync = localStorage.getItem('lastSync');

        const hasData = products && categories;
        const synced = lastSync !== null;

        setDataStatus({
          loading: false,
          synced,
          lastSync: lastSync ? new Date(lastSync) : null,
          error: hasData ? null : 'البيانات غير متوفرة'
        });
      }
    };

    // فحص فوري
    checkDataStatus();

    // فحص دوري كل 30 ثانية
    const interval = setInterval(checkDataStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (dataStatus.loading) {
    return (
      <div className="fixed top-4 left-4 z-50 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">جاري تحميل البيانات...</span>
      </div>
    );
  }

  if (dataStatus.error) {
    return (
      <div className="fixed top-4 left-4 z-50 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-sm">{dataStatus.error}</span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <div className="flex flex-col">
        <span className="text-sm font-semibold">البيانات محدثة</span>
        {dataStatus.lastSync && (
          <span className="text-xs opacity-90">
            آخر مزامنة: {dataStatus.lastSync.toLocaleTimeString('ar-SA')}
          </span>
        )}
      </div>
    </div>
  );
}