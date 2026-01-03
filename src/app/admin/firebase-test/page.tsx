"use client";
import { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function FirebaseTest() {
  const [status, setStatus] = useState('جاري الاختبار...');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    testFirebase();
  }, []);

  const testFirebase = async () => {
    try {
      console.log('🧪 اختبار Firebase...');
      
      if (!db) {
        setStatus('❌ Firebase غير متصل');
        return;
      }

      console.log('✅ Firebase متصل');
      
      const snapshot = await getDocs(collection(db, 'products'));
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsData);
      setStatus(`✅ Firebase يعمل بشكل صحيح - تم جلب ${productsData.length} منتج`);
      
    } catch (error) {
      console.error('❌ خطأ في اختبار Firebase:', error);
      setStatus(`❌ خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">اختبار Firebase</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p className="font-bold">الحالة:</p>
        <p>{status}</p>
      </div>

      <button 
        onClick={testFirebase}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        إعادة الاختبار
      </button>
    </div>
  );
}