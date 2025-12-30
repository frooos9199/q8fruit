"use client";
import React, { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [logo, setLogo] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // حماية الأدمن
      const isAdmin = window.localStorage.getItem('isAdmin');
      if (isAdmin !== 'true') {
        setAllowed(false);
        window.location.href = '/login';
        return;
      }
      const storedLogo = window.localStorage.getItem('siteLogo');
      if (storedLogo) setLogo(storedLogo);
    }
    // استمع لتغير localStorage من تبويب آخر
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'siteLogo') setLogo(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!allowed) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col gap-4">
        {/* شعار الموقع */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 max-w-[6rem] max-h-[6rem] bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {logo ? (
              <img src={logo} alt="شعار الموقع" className="object-contain w-full h-full max-w-[6rem] max-h-[6rem]" />
            ) : (
              <span className="text-3xl font-bold text-green-600">Logo</span>
            )}
          </div>
        </div>
        {/* قائمة الأقسام */}
        <nav className="flex flex-col gap-2">
          <a href="/admin" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">لوحة التحكم</a>
          <a href="/admin/banners" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">البانر</a>
          <a href="/admin/orders" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">الطلبات</a>
          <a href="/admin/users" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">المستخدمين</a>
          <a href="/admin/products" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">المنتجات</a>
          <a href="/add-products" className="py-2 px-4 rounded hover:bg-orange-100 dark:hover:bg-orange-900 text-orange-600 dark:text-orange-400 font-semibold">🍎 إضافة فواكه</a>
          <a href="/admin/delivery" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">التوصيل</a>
          <a href="/admin/catering" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">الكَاتِرِينج</a>
          <a href="/admin/bulk-message" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">رسائل جماعية</a>
          <a href="/admin/settings" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">الإعدادات</a>
          <a href="/storage-viewer" className="py-2 px-4 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">عارض البيانات</a>
        </nav>
        
        {/* زر العودة للموقع */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <a 
            href="/" 
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-bold text-center transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            العودة للموقع
          </a>
        </div>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
