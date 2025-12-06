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
          <a href="/admin/delivery" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">التوصيل</a>
          <a href="/admin/catering" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">الكَاتِرِينج</a>
          <a href="/admin/bulk-message" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">رسائل جماعية</a>
          <a href="/admin/settings" className="py-2 px-4 rounded hover:bg-green-100 dark:hover:bg-green-900">الإعدادات</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
