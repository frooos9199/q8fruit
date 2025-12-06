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
    window.addEventListener("storage", syncOrders);
    syncOrders();
    return () => {
      window.removeEventListener("usersUpdated", syncCount);
      window.removeEventListener("storage", syncOrders);
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">لوحة تحكم الإدارة</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
    </div>
  );
}
