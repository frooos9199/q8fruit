"use client";
import { useState, useEffect } from "react";
import { syncAllDataToFirebase, loadAllDataFromFirebase } from "../../lib/firebaseSync";
import { syncProductImages, fullImageSync } from "../../lib/imageSync";
import { setupFirebaseData } from "../../lib/setupFirebase";

export default function AdminDashboard() {
  const initialUsers = [
    { id: 1, name: "محمد أحمد", email: "mohamed@email.com", phone: "55512345", active: true, role: "عميل", password: "1234" },
    { id: 2, name: "سارة علي", email: "sara@email.com", phone: "55567890", active: true, role: "عميل", password: "1234" },
    { id: 3, name: "مدير النظام", email: "summit_kw@hotmail.com", phone: "55500000", active: true, role: "مدير", password: "admin1234" },
    { id: 4, name: "خالد يوسف", email: "khaled@email.com", phone: "55522222", active: false, role: "عميل", password: "1234" },
  ];
  const [userCount, setUserCount] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("users");
      if (stored) {
        try {
          return JSON.parse(stored).length;
        } catch {
          return initialUsers.length;
        }
      }
    }
    return initialUsers.length;
  });

  // إحصائيات الطلبات
  const [ordersStats, setOrdersStats] = useState({
    total: 0,
    today: 0,
    sales: 0,
  });

  // إحصائيات الكاترينج
  const [cateringStats, setCateringStats] = useState({
    categories: 0,
    totalProducts: 0,
    details: [] as { name: string; productCount: number }[]
  });
  
  // حالة المزامنة
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  
  // دالة المزامنة اليدوية
  const handleSyncToFirebase = async () => {
    setSyncing(true);
    setSyncMessage('جاري رفع البيانات إلى Firebase...');
    
    const success = await syncAllDataToFirebase();
    
    if (success) {
      setSyncMessage('✅ تم رفع جميع البيانات بنجاح!');
    } else {
      setSyncMessage('❌ حدث خطأ في رفع البيانات');
    }
    
    setSyncing(false);
    setTimeout(() => setSyncMessage(''), 3000);
  };
  
  // دالة تحميل من Firebase
  const handleLoadFromFirebase = async () => {
    setSyncing(true);
    setSyncMessage('جاري تحميل البيانات من Firebase...');
    
    const success = await loadAllDataFromFirebase();
    
    if (success) {
      setSyncMessage('✅ تم تحميل جميع البيانات بنجاح!');
      // إعادة تحميل الصفحة لعرض البيانات الجديدة
      window.location.reload();
    } else {
      setSyncMessage('❌ حدث خطأ في تحميل البيانات');
    }
    
    setSyncing(false);
    setTimeout(() => setSyncMessage(''), 3000);
  };
  
  // دالة مزامنة الصور
  const handleSyncImages = async () => {
    setSyncing(true);
    setSyncMessage('جاري مزامنة الصور مع Firebase Storage...');
    
    const success = await fullImageSync();
    
    if (success) {
      setSyncMessage('✅ تم مزامنة جميع الصور بنجاح!');
      // إعادة تحميل الصفحة لعرض الصور الجديدة
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setSyncMessage('❌ حدث خطأ في مزامنة الصور');
    }
    
    setSyncing(false);
    setTimeout(() => setSyncMessage(''), 3000);
  };
  
  // دالة إعداد Firebase بالبيانات الافتراضية
  const handleSetupFirebase = async () => {
    setSyncing(true);
    setSyncMessage('جاري إعداد Firebase بالبيانات الافتراضية...');
    
    const success = await setupFirebaseData();
    
    if (success) {
      setSyncMessage('✅ تم إعداد Firebase بنجاح! جاري إعادة تحميل الصفحة...');
      // إعادة تحميل الصفحة لعرض البيانات الجديدة
      setTimeout(() => window.location.reload(), 2000);
    } else {
      setSyncMessage('❌ حدث خطأ في إعداد Firebase');
    }
    
    setSyncing(false);
    setTimeout(() => setSyncMessage(''), 5000);
  };

  useEffect(() => {
    // تحديث عدد المستخدمين
    const syncCount = () => {
      const stored = window.localStorage.getItem("users");
      if (stored) {
        try {
          setUserCount(JSON.parse(stored).length);
        } catch {
          setUserCount(initialUsers.length);
        }
      } else {
        setUserCount(initialUsers.length);
      }
    };
    
    // مراقبة تغييرات localStorage فقط - لا حاجة لمراقبة Firebase
    // Firebase هو نسخة احتياطية فقط
    
    window.addEventListener("usersUpdated", syncCount);
    syncCount();

    // تحديث إحصائيات الطلبات
    const syncOrders = () => {
      let orders = [];
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("orders");
        if (stored) {
          try {
            orders = JSON.parse(stored);
          } catch {}
        }
      }
      // إجمالي الطلبات
      const total = Array.isArray(orders) ? orders.length : 0;
      // طلبات اليوم
      const todayStr = new Date().toLocaleDateString();
      const today = Array.isArray(orders)
        ? orders.filter((o) => {
            if (!o.date) return false;
            // دعم تنسيقات التاريخ المختلفة
            const d = o.date.split(",")[0].trim();
            return d === todayStr;
          }).length
        : 0;
      // إجمالي المبيعات
      const sales = Array.isArray(orders)
        ? orders.reduce((sum, o) => sum + (typeof o.total === "number" ? o.total : 0), 0)
        : 0;
      setOrdersStats({ total, today, sales });
      
      console.log('تم تحديث إحصائيات الطلبات:', { total, today, sales });
    };

    // تحديث إحصائيات الكاترينج
    const syncCatering = () => {
      if (typeof window !== "undefined") {
        const storedCategories = window.localStorage.getItem("cateringCategories");
        const storedProducts = window.localStorage.getItem("products");
        
        if (storedCategories && storedProducts) {
          try {
            const categories = JSON.parse(storedCategories);
            const products = JSON.parse(storedProducts);
            
            // حساب المنتجات الفعلية لكل تصنيف
            const details = categories.map((cat: any) => {
              const actualProducts = products.filter((product: any) => 
                product.category === cat.name && product.active === true
              );
              return {
                name: cat.name,
                productCount: actualProducts.length
              };
            });
            
            const totalProducts = details.reduce((sum: number, cat: { name: string; productCount: number }) => sum + cat.productCount, 0);
            setCateringStats({
              categories: categories.length,
              totalProducts,
              details
            });
          } catch {
            setCateringStats({ categories: 0, totalProducts: 0, details: [] });
          }
        } else {
          setCateringStats({ categories: 0, totalProducts: 0, details: [] });
        }
      }
    };

    window.addEventListener("storage", syncOrders);
    window.addEventListener("storage", syncCatering);
    
    // مراقبة دورية لضمان تحديث الإحصائيات
    const statsInterval = setInterval(() => {
      syncOrders();
      syncCatering();
      syncCount();
    }, 5000); // كل 5 ثواني
    
    syncOrders();
    syncCatering();
    
    return () => {
      window.removeEventListener("usersUpdated", syncCount);
      window.removeEventListener("storage", syncOrders);
      window.removeEventListener("storage", syncCatering);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* العنوان الرئيسي */}
      <div className="text-center lg:text-right">
        <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
          🏠 لوحة تحكم الإدارة
        </h1>
        <p className="text-gray-600 dark:text-gray-400">مرحباً بك في لوحة إدارة متجر الفواكه والخضار</p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon="👥" 
          title="المستخدمين" 
          value={userCount.toString()} 
          color="from-blue-500 to-blue-600"
          bgColor="from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800"
        />
        <StatCard 
          icon="📦" 
          title="إجمالي الطلبات" 
          value={ordersStats.total.toString()} 
          color="from-green-500 to-green-600"
          bgColor="from-green-50 to-green-100 dark:from-green-900 dark:to-green-800"
        />
        <StatCard 
          icon="🕐" 
          title="طلبات اليوم" 
          value={ordersStats.today.toString()} 
          color="from-orange-500 to-orange-600"
          bgColor="from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800"
        />
        <StatCard 
          icon="💰" 
          title="المبيعات" 
          value={`${ordersStats.sales.toFixed(3)} د.ك`} 
          color="from-purple-500 to-purple-600"
          bgColor="from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800"
        />
      </div>

      {/* أزرار مزامنة Firebase */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🔄</span>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            مزامنة Firebase
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <button
            onClick={handleSyncToFirebase}
            disabled={syncing}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <span className="text-xl">⬆️</span>
            <span className="text-sm">{syncing ? 'جاري...' : 'رفع إلى Firebase'}</span>
          </button>
          
          <button
            onClick={handleLoadFromFirebase}
            disabled={syncing}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <span className="text-xl">⬇️</span>
            <span className="text-sm">{syncing ? 'جاري...' : 'تحميل من Firebase'}</span>
          </button>
          
          <button
            onClick={handleSyncImages}
            disabled={syncing}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <span className="text-xl">🖼️</span>
            <span className="text-sm">{syncing ? 'جاري...' : 'مزامنة الصور'}</span>
          </button>
          
          <button
            onClick={handleSetupFirebase}
            disabled={syncing}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <span className="text-xl">⚙️</span>
            <span className="text-sm">{syncing ? 'جاري...' : 'إعداد Firebase'}</span>
          </button>
        </div>
        
        {syncMessage && (
          <div className={`p-3 rounded-lg text-center font-medium ${
            syncMessage.includes('✅') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            syncMessage.includes('❌') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {syncMessage}
          </div>
        )}
        
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            <span className="font-bold">⚠️ ملاحظة:</span>
          </p>
          <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• <strong>إعداد Firebase:</strong> يضيف 10 منتجات افتراضية إلى Firebase (استخدمه مرة واحدة فقط)</li>
            <li>• <strong>رفع إلى Firebase:</strong> يحفظ البيانات المحلية في السحابة</li>
            <li>• <strong>تحميل من Firebase:</strong> يجلب أحدث البيانات من السحابة</li>
            <li>• <strong>مزامنة الصور:</strong> يربط الصور من Firebase Storage بالمنتجات</li>
          </ul>
        </div>
      </div>

      {/* إحصائيات الكاترينج */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🍽️</span>
          <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            إحصائيات الكاترينج
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl p-4 text-center border border-green-200 dark:border-green-700">
            <div className="text-3xl mb-2">📂</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">عدد التصنيفات</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{cateringStats.categories}</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-700">
            <div className="text-3xl mb-2">🛒</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">إجمالي المنتجات</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cateringStats.totalProducts}</div>
          </div>
        </div>

        {cateringStats.details.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span>📊</span>
              تفاصيل التصنيفات:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cateringStats.details.map((category, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 flex items-center justify-between border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                  <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="text-lg">🏷️</span>
                    {category.name}
                  </span>
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    {category.productCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* روابط سريعة */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <span>⚡</span>
          روابط سريعة
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <QuickLink href="/admin/orders" icon="📦" text="الطلبات" />
          <QuickLink href="/admin/products" icon="🛒" text="المنتجات" />
          <QuickLink href="/admin/users" icon="👥" text="المستخدمين" />
          <QuickLink href="/admin/settings" icon="⚙️" text="الإعدادات" />
        </div>
      </div>
    </div>
  );
}

// مكون بطاقة الإحصائيات
function StatCard({ icon, title, value, color, bgColor }: {
  icon: string;
  title: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all transform hover:scale-105`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</div>
      <div className={`text-lg lg:text-xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {value}
      </div>
    </div>
  );
}

// مكون الرابط السريع
function QuickLink({ href, icon, text }: { href: string; icon: string; text: string }) {
  return (
    <a 
      href={href}
      className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 text-center hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900 dark:hover:to-blue-900 transition-all transform hover:scale-105 border border-gray-200 dark:border-gray-600 hover:shadow-md"
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{text}</div>
    </a>
  );
}
