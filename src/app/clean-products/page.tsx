"use client";
import { useState, useEffect } from "react";

export default function CleanProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [problemProducts, setProblemProducts] = useState<any[]>([]);
  const [duplicateProducts, setDuplicateProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('products');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProducts(parsed);

        // تحديد المنتجات المشكلة
        const problems = parsed.filter((p: any) => {
          return (
            !p.id ||
            !p.name ||
            !p.category ||
            !Array.isArray(p.units) ||
            p.units.length === 0 ||
            typeof p.quantity !== 'number' ||
            p.quantity < 0
          );
        });

        setProblemProducts(problems);

        // تحديد المنتجات المكررة
        const duplicates: any[] = [];
        const seen = new Set();

        parsed.forEach((product: any, index: number) => {
          const key = `${product.name?.toLowerCase()?.trim()}-${product.category?.toLowerCase()?.trim()}`;
          if (seen.has(key)) {
            duplicates.push(product);
          } else {
            seen.add(key);
          }
        });

        setDuplicateProducts(duplicates);
      }
    }
  };



  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
          🧹 تنظيف المنتجات المشكلة
        </h1>

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              إجمالي المنتجات
            </h3>
            <p className="text-3xl font-bold text-blue-600">{products.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              منتجات مشكلة
            </h3>
            <p className="text-3xl font-bold text-red-600">{problemProducts.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              منتجات مكررة
            </h3>
            <p className="text-3xl font-bold text-orange-600">{duplicateProducts.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              منتجات صحيحة
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {products.length - problemProducts.length - duplicateProducts.length}
            </p>
          </div>
        </div>

        {/* المنتجات المكررة */}
        {duplicateProducts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">
              🔄 المنتجات المكررة ({duplicateProducts.length})
            </h2>
            <div className="space-y-2">
              {duplicateProducts.map((product, index) => (
                <div key={index} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-orange-800 dark:text-orange-300">
                        ID: {product.id}
                      </p>
                      <p className="text-orange-700 dark:text-orange-400">
                        الاسم: {product.name}
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-500">
                        الفئة: {product.category}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تمت إزالة جميع أزرار إجراءات التنظيف - الصفحة للعرض فقط */}

        {/* قائمة جميع المنتجات */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            📋 جميع المنتجات ({products.length})
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
                {products.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-2">{product.id}</td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.category}</td>
                    <td className="p-2">{product.quantity}</td>
                    <td className="p-2">{Array.isArray(product.units) ? product.units.length : '❌'}</td>
                    <td className="p-2">
                      {product.active ? '✅' : '❌'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
            📋 دليل الاستخدام
          </h3>
          <div className="space-y-3 text-sm text-blue-700 dark:text-blue-400">
            <p><strong>1. عرض البيانات:</strong> راجع الإحصائيات والمنتجات المشكلة</p>
            <p><strong>2. حذف المشكلة:</strong> اضغط "حذف المنتجات المشكلة" لحذف البيانات غير الصحيحة</p>
            <p><strong>3. حذف المكررة:</strong> اضغط "حذف المنتجات المكررة" لإزالة التكرارات</p>
            <p><strong>4. إعادة التعيين:</strong> استخدم "إعادة تعيين للقيم الافتراضية" للبدء من جديد</p>
            <p><strong>5. النسخ الاحتياطي:</strong> استخدم "تصدير Excel" من صفحة المنتجات قبل الحذف</p>
          </div>
        </div>

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