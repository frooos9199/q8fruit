"use client";
export default function FirebaseTestPage() {
  const testFirebase = async () => {
    try {
      console.log('🧪 اختبار Firebase...');

      // اختبار الاستيراد
      const { auth, db } = await import('../../lib/firebase');
      console.log('✅ تم استيراد Firebase بنجاح');

      if (auth) {
        console.log('✅ Auth متوفر');
      } else {
        console.log('❌ Auth غير متوفر');
      }

      if (db) {
        console.log('✅ Firestore متوفر');
      } else {
        console.log('❌ Firestore غير متوفر');
      }

      // اختبار إنشاء الأدمن
      const { createAdminAccount } = await import('../../lib/createAdmin');
      console.log('🧪 محاولة إنشاء حساب الأدمن...');

      const result = await createAdminAccount();
      if (result) {
        console.log('✅ تم إنشاء حساب الأدمن:', result);
      } else {
        console.log('ℹ️ حساب الأدمن موجود بالفعل');
      }

    } catch (error) {
      console.error('❌ خطأ في اختبار Firebase:', error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">اختبار Firebase</h1>

      <button
        onClick={testFirebase}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        اختبار Firebase
      </button>

      <div className="mt-8">
        <p>افتح وحدة التحكم (F12) لرؤية نتائج الاختبار</p>
      </div>

      <div className="mt-6">
        <a href="/test-auth" className="text-blue-500 underline">العودة لصفحة اختبار المصادقة</a>
      </div>
    </div>
  );
}