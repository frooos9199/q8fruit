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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fffdf6] via-[#f7fbf7] to-[#eef7f2]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAdminChecked) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#fffdf6] via-[#f7fbf7] to-[#eef7f2]" suppressHydrationWarning>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 border-r border-emerald-100 bg-white/92 p-4 shadow-[0_20px_60px_rgba(15,118,110,0.12)] backdrop-blur-xl flex flex-col gap-4 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* زر إغلاق القائمة على الموبايل */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 rounded-full bg-emerald-50 p-2 text-slate-500 transition-all hover:bg-emerald-100 hover:text-emerald-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* شعار الموقع */}
        <div className="flex items-center justify-center mb-6 mt-12 lg:mt-0">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-cyan-50 shadow-[0_18px_40px_rgba(15,118,110,0.14)] lg:h-24 lg:w-24">
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
        <div className="mt-auto border-t border-emerald-100 pt-4">
          <a
            href="https://www.q8fruit.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3 text-center font-bold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:scale-105 hover:from-emerald-700 hover:to-teal-600 hover:shadow-xl"
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
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-emerald-100 bg-white/90 p-4 shadow-sm backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 p-3 text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:scale-105 hover:from-emerald-700 hover:to-teal-600 hover:shadow-xl"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-xl font-bold text-transparent">لوحة الإدارة</h1>
          <div className="w-12"></div> {/* Spacer */}
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
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
        group flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200
        ${special 
          ? 'border border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-700 hover:from-cyan-100 hover:to-sky-100' 
          : highlight
          ? 'border-2 border-emerald-300 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800 shadow-md shadow-emerald-100 hover:from-emerald-200 hover:to-cyan-200'
          : 'text-slate-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 hover:text-emerald-700'
        }
        transform hover:scale-105 hover:shadow-md
      `}
    >
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-semibold">{text}</span>
    </Link>
  );
}
