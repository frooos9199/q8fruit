'use client';

/**
 * 🗺️ صفحة تتبع المندوبين - لوحة الأدمن
 * عرض مواقع المندوبين النشطين على خريطة live
 */

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import DeliveryMap from '../../../components/DeliveryMap';

interface DeliveryDriver {
  userId: string;
  email: string;
  displayName: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
  };
  timestamp: any;
  lastUpdate: number;
  isActive: boolean;
}

export default function DeliveryTrackingPage() {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;

    console.log('🔄 بدء الاستماع لمواقع المندوبين...');

    // Real-time listener للمندوبين النشطين
    const q = query(
      collection(db, 'deliveryLocations'),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driversList: DeliveryDriver[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        driversList.push({
          userId: doc.id,
          email: data.email || '',
          displayName: data.displayName || 'مندوب',
          location: data.location,
          timestamp: data.timestamp,
          lastUpdate: data.lastUpdate,
          isActive: data.isActive,
        });
      });

      console.log(`📍 تم تحميل ${driversList.length} مندوب نشط`);
      setDrivers(driversList);
      setLoading(false);
    }, (error) => {
      console.error('❌ خطأ في الاستماع:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // حساب الوقت منذ آخر تحديث
  const getTimeSinceUpdate = (lastUpdate: number): string => {
    const now = Date.now();
    const diff = Math.floor((now - lastUpdate) / 1000); // بالثواني

    if (diff < 60) return `${diff} ثانية`;
    if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة`;
    return `${Math.floor(diff / 3600)} ساعة`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffdf6] via-[#f7fbf7] to-[#eef7f2] p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            🗺️ تتبع المندوبين
          </h1>
          <p className="text-slate-600">
            عرض مواقع المندوبين النشطين في الوقت الفعلي
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-emerald-100 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(15,118,110,0.10)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-600">جاري تحميل المواقع...</p>
          </div>
        )}

        {!loading && drivers.length === 0 && (
          <div className="rounded-2xl border border-emerald-100 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(15,118,110,0.10)]">
            <p className="mb-2 text-lg text-slate-600">
              📭 لا يوجد مندوبين نشطين حالياً
            </p>
            <p className="text-sm text-slate-500">
              سيظهر المندوبون هنا عندما يبدأون التوصيل
            </p>
          </div>
        )}

        {!loading && drivers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* قائمة المندوبين */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-emerald-100 bg-white/92 p-4 shadow-[0_20px_60px_rgba(15,118,110,0.10)]">
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  المندوبين النشطين ({drivers.length})
                </h2>
                
                <div className="space-y-3">
                  {drivers.map((driver) => (
                    <button
                      key={driver.userId}
                      onClick={() => setSelectedDriver(driver.userId)}
                      className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                        selectedDriver === driver.userId
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-slate-900">
                            🚗 {driver.displayName}
                          </p>
                          <p className="text-sm text-slate-600">
                            {driver.email}
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                          🟢 نشط
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500">
                        <p>📍 {driver.location.latitude.toFixed(6)}, {driver.location.longitude.toFixed(6)}</p>
                        <p>⏱️ آخر تحديث: {getTimeSinceUpdate(driver.lastUpdate)}</p>
                        {driver.location.speed && (
                          <p>🚀 السرعة: {Math.round(driver.location.speed * 3.6)} كم/ساعة</p>
                        )}
                        <p>🎯 دقة الموقع: {Math.round(driver.location.accuracy)} متر</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* منطقة الخريطة */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-emerald-100 bg-white/92 p-4 shadow-[0_20px_60px_rgba(15,118,110,0.10)]">
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  🗺️ الخريطة
                </h2>
                
                {/* Google Maps Component */}
                <DeliveryMap 
                  drivers={drivers}
                  selectedDriver={selectedDriver}
                  onDriverSelect={setSelectedDriver}
                />
              </div>
            </div>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4">
          <h3 className="mb-2 font-bold text-cyan-900">ℹ️ معلومات:</h3>
          <ul className="space-y-1 text-sm text-cyan-800">
            <li>• يتم تحديث المواقع تلقائياً كل 15 ثانية</li>
            <li>• المندوبون يظهرون فقط عندما يكونون نشطين</li>
            <li>• يمكنك النقر على أي مندوب لعرض تفاصيله</li>
            <li>• الدقة تعتمد على GPS المندوب وقوة الإشارة</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
