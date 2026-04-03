"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getOrderPricing } from "../../lib/orderUtils";
interface Category {
  name: string;
  products?: string[];
  image?: string;
}

interface Product {
  id: number | string;
  name: string;
  category: string;
  active: boolean;
  categories?: string[];
  isHidden?: boolean;
}

const getOrderDate = (order: Record<string, any>) => {
  if (order.createdAt?.toDate) {
    return order.createdAt.toDate();
  }

  if (order.date) {
    const parsedDate = new Date(order.date);
    if (!Number.isNaN(parsedDate.getTime())) return parsedDate;
  }

  if (order.timestamp) {
    const parsedDate = new Date(order.timestamp);
    if (!Number.isNaN(parsedDate.getTime())) return parsedDate;
  }

  return null;
};

const isCompletedOrder = (status: unknown) => {
  return status === "completed" || status === "delivered";
};

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);

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
    const syncDashboardStats = async () => {
      if (!db) {
        setUserCount(0);
        setOrdersStats({ total: 0, today: 0, sales: 0 });
        setCateringStats({ categories: 0, totalProducts: 0, details: [] });
        return;
      }

      try {
        const [usersSnapshot, ordersSnapshot, productsSnapshot, categoriesSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'cateringCategories')),
        ]);

        setUserCount(usersSnapshot.size);

        const orders = ordersSnapshot.docs.map((orderDoc) => ({ id: orderDoc.id, ...orderDoc.data() }));
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayOrders = orders.filter((order) => {
          const orderDate = getOrderDate(order as Record<string, any>);
          return orderDate ? orderDate >= todayStart : false;
        });

        const sales = orders
          .filter((order) => isCompletedOrder((order as Record<string, any>).status))
          .reduce((sum, order) => sum + getOrderPricing(order).total, 0);

        setOrdersStats({
          total: orders.length,
          today: todayOrders.length,
          sales,
        });

        const products = productsSnapshot.docs.map((productDoc) => ({
          id: productDoc.id,
          ...productDoc.data(),
        })) as Product[];
        const categories = categoriesSnapshot.docs.map((categoryDoc) => ({
          id: categoryDoc.id,
          ...categoryDoc.data(),
        })) as Array<Category & { id: string }>;

        const activeProducts = products.filter((product) => product.active !== false && product.isHidden !== true);
        const details = categories.map((category) => ({
          name: category.name,
          productCount: activeProducts.filter((product) => {
            const productCategories = Array.isArray(product.categories) && product.categories.length > 0
              ? product.categories
              : [product.category].filter(Boolean);

            return productCategories.includes(category.name);
          }).length,
        }));

        setCateringStats({
          categories: categories.length,
          totalProducts: activeProducts.length,
          details,
        });
      } catch (error) {
        console.error('Error syncing admin dashboard stats:', error);
        setUserCount(0);
        setOrdersStats({ total: 0, today: 0, sales: 0 });
        setCateringStats({ categories: 0, totalProducts: 0, details: [] });
      }
    };

    window.addEventListener("usersUpdated", syncDashboardStats);
    syncDashboardStats();

    const statsInterval = setInterval(() => {
      void syncDashboardStats();
    }, 10000);
    
    return () => {
      window.removeEventListener("usersUpdated", syncDashboardStats);
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
        <p className="text-slate-600">مرحباً بك في لوحة إدارة متجر الفواكه والخضار</p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon="👥" 
          title="المستخدمين" 
          value={userCount.toString()} 
          color="from-cyan-600 to-sky-700"
          bgColor="from-cyan-50 via-white to-sky-100"
        />
        <StatCard 
          icon="📦" 
          title="إجمالي الطلبات" 
          value={ordersStats.total.toString()} 
          color="from-emerald-600 to-teal-700"
          bgColor="from-emerald-50 via-white to-teal-100"
        />
        <StatCard 
          icon="🕐" 
          title="طلبات اليوم" 
          value={ordersStats.today.toString()} 
          color="from-amber-500 to-orange-600"
          bgColor="from-amber-50 via-white to-orange-100"
        />
        <StatCard 
          icon="💰" 
          title="المبيعات" 
          value={`${ordersStats.sales.toFixed(3)} د.ك`} 
          color="from-teal-600 to-cyan-700"
          bgColor="from-teal-50 via-white to-cyan-100"
        />
      </div>

      {/* ...تمت إزالة أزرار ودوال مزامنة Firebase لجعل لوحة الإدارة للعرض فقط... */}

      {/* إحصائيات الكاترينج */}
      <div className="rounded-2xl border border-emerald-100 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🍽️</span>
          <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            إحصائيات الكاترينج
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-4 text-center">
            <div className="text-3xl mb-2">📂</div>
            <div className="mb-1 text-sm font-medium text-slate-600">عدد التصنيفات</div>
            <div className="text-2xl font-bold text-emerald-700">{cateringStats.categories}</div>
          </div>
          <div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 p-4 text-center">
            <div className="text-3xl mb-2">🛒</div>
            <div className="mb-1 text-sm font-medium text-slate-600">إجمالي المنتجات</div>
            <div className="text-2xl font-bold text-cyan-700">{cateringStats.totalProducts}</div>
          </div>
        </div>

        {cateringStats.details.length > 0 && (
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-700">
              <span>📊</span>
              تفاصيل التصنيفات:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cateringStats.details.map((category, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3 transition-all hover:shadow-md">
                  <span className="flex items-center gap-2 font-medium text-slate-800">
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
      <div className="rounded-2xl border border-emerald-100 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
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
    <div className={`bg-gradient-to-br ${bgColor} rounded-xl border border-white/80 p-4 text-center shadow-sm transition-all hover:scale-105 hover:shadow-lg`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="mb-1 text-xs font-medium text-slate-600">{title}</div>
      <div className={`text-lg lg:text-xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {value}
      </div>
    </div>
  );
}

// مكون الرابط السريع
function QuickLink({ href, icon, text, color }: { href: string; icon: string; text: string; color?: string }) {
  const gradientClass = color || "from-slate-50 via-white to-slate-100";
  const hoverClass = color ? "hover:opacity-95" : "hover:from-emerald-50 hover:to-cyan-50";
  
  return (
    <a 
      href={href}
      className={`bg-gradient-to-r ${gradientClass} rounded-lg border border-slate-200 p-3 text-center ${hoverClass} transition-all hover:scale-105 hover:shadow-md`}
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-sm font-medium text-slate-700">{text}</div>
    </a>
  );
}
