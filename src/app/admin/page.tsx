"use client";
import { useState, useEffect } from "react";
import UsersTable from "./users/UsersTable";


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
            
            const totalProducts = details.reduce((sum: number, cat) => sum + cat.productCount, 0);
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
    syncOrders();
    syncCatering();
    
    return () => {
      window.removeEventListener("usersUpdated", syncCount);
      window.removeEventListener("storage", syncOrders);
      window.removeEventListener("storage", syncCatering);
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">لوحة تحكم الإدارة</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded shadow p-4 text-center">
          <div className="text-lg font-semibold">عدد المستخدمين</div>
          <div className="text-3xl font-bold text-green-600">{userCount}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded shadow p-4 text-center">
          <div className="text-lg font-semibold">عدد الطلبات الإجمالية</div>
          <div className="text-3xl font-bold text-green-600">{ordersStats.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded shadow p-4 text-center">
          <div className="text-lg font-semibold">طلبات اليوم</div>
          <div className="text-3xl font-bold text-green-600">{ordersStats.today}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded shadow p-4 text-center">
          <div className="text-lg font-semibold">مجموع المبيعات</div>
          <div className="text-3xl font-bold text-green-600">{ordersStats.sales.toFixed(3)} د.ك</div>
        </div>
      </div>

      {/* إحصائيات الكاترينج */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">إحصائيات الكاترينج</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-xl p-4 text-center">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">عدد التصنيفات</div>
            <div className="text-3xl font-bold text-green-600">{cateringStats.categories}</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 rounded-xl p-4 text-center">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">إجمالي المنتجات</div>
            <div className="text-3xl font-bold text-blue-600">{cateringStats.totalProducts}</div>
          </div>
        </div>

        {cateringStats.details.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">تفاصيل التصنيفات:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cateringStats.details.map((category, index) => (
                <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{category.name}</span>
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-sm font-bold">
                    {category.productCount} منتج
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
