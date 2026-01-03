"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";


interface Category {
  name: string;
  products?: string[];
  image?: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  active: boolean;
}

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
    
    window.addEventListener("usersUpdated", syncCount);
    syncCount();

    // تحديث إحصائيات الطلبات من Firebase + localStorage
    const syncOrders = async () => {
      let allOrders: any[] = [];
      
      // 1. Get orders from Firebase
      if (db) {
        try {
          const ordersRef = collection(db, 'orders');
          const snapshot = await getDocs(ordersRef);
          const firebaseOrders = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              total: data.pricing?.total || data.total || 0,
              date: data.createdAt ? data.createdAt.toDate().toISOString() : (data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString()),
              status: data.status
            };
          });
          allOrders = [...firebaseOrders];
          console.log('📦 Firebase orders:', firebaseOrders.length);
        } catch (error) {
          console.error('Error fetching Firebase orders:', error);
        }
      }
      
      // 2. Get orders from localStorage (legacy)
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("orders");
        if (stored) {
          try {
            const localOrders = JSON.parse(stored);
            if (Array.isArray(localOrders)) {
              allOrders = [...allOrders, ...localOrders];
            }
          } catch (error) {
            console.error('Error parsing localStorage orders:', error);
          }
        }
      }
      
      // Calculate statistics
      const total = allOrders.length;
      
      // طلبات اليوم
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const today = allOrders.filter((o) => {
        if (!o.date) return false;
        try {
          const orderDate = new Date(o.date);
          return orderDate >= todayStart;
        } catch {
          return false;
        }
      }).length;
      
      // إجمالي المبيعات
      const sales = allOrders.reduce((sum, o) => {
        const orderTotal = typeof o.total === "number" ? o.total : 0;
        return sum + orderTotal;
      }, 0);
      
      setOrdersStats({ total, today, sales });
      console.log('📊 Orders stats updated:', { total, today, sales });
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
            const details = categories.map((cat: Category) => {
              const actualProducts = products.filter((product: Product) => 
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

    window.addEventListener("storage", syncCatering);
    
    // Initial sync and periodic updates
    syncOrders(); // Initial call
    syncCatering();
    
    // مراقبة دورية لضمان تحديث الإحصائيات
    const statsInterval = setInterval(() => {
      syncOrders(); // Will be async
      syncCatering();
      syncCount();
    }, 10000); // كل 10 ثواني
    
    return () => {
      window.removeEventListener("usersUpdated", syncCount);
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

      {/* ...تمت إزالة أزرار ودوال مزامنة Firebase لجعل لوحة الإدارة للعرض فقط... */}

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <QuickLink href="/admin/orders" icon="📦" text="الطلبات" />
          <QuickLink href="/admin/products" icon="🛒" text="المنتجات" />
          <QuickLink href="/admin/users" icon="👥" text="المستخدمين" />
          <QuickLink href="/admin/delivery-tracking" icon="🗺️" text="تتبع المندوبين" color="from-blue-500 to-cyan-500" />
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
function QuickLink({ href, icon, text, color }: { href: string; icon: string; text: string; color?: string }) {
  const gradientClass = color || "from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600";
  const hoverClass = color ? "hover:opacity-90" : "hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900 dark:hover:to-blue-900";
  
  return (
    <a 
      href={href}
      className={`bg-gradient-to-r ${gradientClass} rounded-lg p-3 text-center ${hoverClass} transition-all transform hover:scale-105 border border-gray-200 dark:border-gray-600 hover:shadow-md`}
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{text}</div>
    </a>
  );
}
