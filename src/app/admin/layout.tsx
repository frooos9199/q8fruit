"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [logo, setLogo] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const onStorage = useCallback((e: StorageEvent) => {
    if (e.key === 'siteLogo') setLogo(e.newValue);
  }, []);

  useEffect(() => {
    // تحقق من حالة الأدمن
    const checkAdminStatus = () => {
      if (typeof window !== 'undefined') {
        const isAdmin = window.localStorage.getItem('isAdmin');
        const siteLogo = window.localStorage.getItem('siteLogo');
        
        setLogo(siteLogo);
        
        if (isAdmin === 'true') {
          setIsAdminChecked(true);
        } else {
          router.push('/login');
          return;
        }
      }
      setIsLoading(false);
    };

    checkAdminStatus();

    // استمع لتغير localStorage من تبويب آخر
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router, onStorage]);

  // Show loading while checking admin status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAdminChecked) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col gap-4 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* زر إغلاق القائمة على الموبايل */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* شعار الموقع */}
        <div className="flex items-center justify-center mb-6 mt-12 lg:mt-0">
          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
            {logo ? (
              <Image src={logo} alt="شعار الموقع" width={96} height={96} className="object-contain w-full h-full" />
            ) : (
              <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Q8</span>
            )}
          </div>
        </div>
        
        {/* قائمة الأقسام */}
        <nav className="flex flex-col gap-2 overflow-y-auto flex-1">
          <NavLink href="/admin" icon="🏠" text="لوحة التحكم" />
          <NavLink href="/admin/banners" icon="🖼️" text="البانر" />
          <NavLink href="/admin/orders" icon="📦" text="الطلبات" />
          <NavLink href="/admin/users" icon="👥" text="المستخدمين" />
          <NavLink href="/admin/products" icon="🛒" text="المنتجات" />
          <NavLink href="/admin/delivery" icon="🚚" text="التوصيل" />
          <NavLink href="/admin/delivery-tracking" icon="🗺️" text="تتبع المندوبين" highlight />
          <NavLink href="/admin/catering" icon="🍽️" text="الكَاتِرِينج" />
          <NavLink href="/admin/bulk-message" icon="📢" text="رسائل جماعية" />
          <NavLink href="/admin/settings" icon="⚙️" text="الإعدادات" />
          <NavLink href="/clean-products" icon="🧹" text="تنظيف البيانات" special />
        </nav>
        
        {/* زر العودة للموقع */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href="https://www.q8fruit.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-bold text-center transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>العودة للموقع</span>
          </a>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">لوحة الإدارة</h1>
          <div className="w-12"></div> {/* Spacer */}
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// مكون رابط التنقل
function NavLink({ href, icon, text, special = false, highlight = false }: { href: string; icon: string; text: string; special?: boolean; highlight?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`
        py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 group
        ${special 
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 text-blue-600 dark:text-blue-400 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800 dark:hover:to-purple-800 border border-blue-200 dark:border-blue-700' 
          : highlight
          ? 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-800 dark:to-cyan-800 text-blue-700 dark:text-blue-300 hover:from-blue-200 hover:to-cyan-200 dark:hover:from-blue-700 dark:hover:to-cyan-700 border-2 border-blue-400 dark:border-blue-500 shadow-md'
          : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900 dark:hover:to-blue-900 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
        }
        transform hover:scale-105 hover:shadow-md
      `}
    >
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-semibold">{text}</span>
    </Link>
  );
}
