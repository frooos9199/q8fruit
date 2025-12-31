"use client";
import { fruitProducts } from "../../lib/fruitProducts";

export default function CleanProductsPage() {
  // المنتجات ثابتة من ملف fruitProducts
  const products = Array.isArray(fruitProducts) ? fruitProducts : [];
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
          🍎 المنتجات المعروضة (ثابتة)
        </h1>
        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              إجمالي المنتجات
            </h3>
            <p className="text-3xl font-bold text-blue-600">{Array.isArray(products) ? products.length : 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              مصدر البيانات
            </h3>
            <p className="text-lg font-bold text-green-600">ثابتة من الكود</p>
          </div>
        </div>
        {/* قائمة جميع المنتجات */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            📋 جميع المنتجات ({Array.isArray(products) ? products.length : 0})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right p-2">ID</th>
                  <th className="text-right p-2">الاسم</th>
                  <th className="text-right p-2">الفئة</th>
                  <th className="text-right p-2">الكمية</th>
                  <th className="text-right p-2">الوحدات</th>
                  <th className="text-right p-2">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(products) && products.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-2">{product.id}</td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.category}</td>
                    <td className="p-2">{product.quantity}</td>
                    <td className="p-2">{Array.isArray(product.units) ? product.units.length : '❌'}</td>
                    <td className="p-2">{product.active ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* روابط العودة */}
        <div className="mt-8 text-center space-y-2">
          <a href="/admin/products" className="text-blue-500 underline hover:text-blue-700 block">
            العودة لإدارة المنتجات
          </a>
          <a href="/storage-viewer" className="text-gray-500 underline hover:text-gray-700 block">
            عارض البيانات المحلية
          </a>
        </div>
      </div>
    </div>
  );
}
