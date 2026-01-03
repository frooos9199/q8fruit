'use client';

import { useState } from 'react';
import { seedProducts, seedCategories } from '@/lib/seedData';

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeedAll = async () => {
    setLoading(true);
    setMessage('جاري إضافة جميع البيانات...');
    try {
      const productsSuccess = await seedProducts();
      const categoriesSuccess = await seedCategories();
      
      if (productsSuccess && categoriesSuccess) {
        setMessage('✅ تم إضافة جميع البيانات بنجاح!');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setMessage('❌ فشل في إضافة بعض البيانات');
      }
    } catch (error) {
      setMessage(`❌ خطأ: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          استعادة البيانات
        </h1>
        <p className="text-center text-gray-600 mb-8">
          إذا اختفت المنتجات والأسعار، اضغط الزر لاستعادة البيانات الأساسية
        </p>

        <button
          onClick={handleSeedAll}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? 'جاري المعالجة...' : '⚡ استعادة البيانات'}
        </button>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-center font-bold ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
