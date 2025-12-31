export default function TestAuthPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">اختبار وظائف المصادقة</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* اختبار تسجيل المستخدم */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">تسجيل مستخدم جديد</h2>
          <p className="text-gray-600 mb-4">اذهب إلى <a href="/register" className="text-blue-500 underline">صفحة التسجيل</a> وجرب التسجيل</p>
          <div className="text-sm text-gray-500">
            <p>✅ التحقق من صحة البيانات</p>
            <p>✅ إنشاء حساب Firebase</p>
            <p>✅ حفظ البيانات في Firestore</p>
            <p>✅ تحديد دور المستخدم (admin/user)</p>
          </div>
        </div>

        {/* اختبار تسجيل الدخول */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">تسجيل الدخول</h2>
          <p className="text-gray-600 mb-4">اذهب إلى <a href="/login" className="text-blue-500 underline">صفحة تسجيل الدخول</a> وجرب الدخول</p>
          <div className="text-sm text-gray-500">
            <p>✅ التحقق من بيانات الدخول</p>
            <p>✅ التحقق من حالة الحساب</p>
            <p>✅ توجيه حسب الدور</p>
            <p>✅ حفظ البيانات محلياً</p>
          </div>
        </div>

        {/* اختبار الأدمن */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">حساب الأدمن</h2>
          <p className="text-gray-600 mb-4">البريد: summit_kw@hotmail.com<br/>كلمة المرور: 9199</p>
          <div className="text-sm text-gray-500">
            <p>✅ إنشاء تلقائي للأدمن</p>
            <p>✅ التحقق من البريد الإلكتروني</p>
            <p>✅ توجيه للوحة الإدارة</p>
            <p>✅ صلاحيات كاملة</p>
          </div>
        </div>

        {/* اختبار إعادة تعيين كلمة المرور */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">إعادة تعيين كلمة المرور</h2>
          <p className="text-gray-600 mb-4">في صفحة تسجيل الدخول اضغط "نسيت كلمة المرور"</p>
          <div className="text-sm text-gray-500">
            <p>✅ إرسال رابط الاستعادة</p>
            <p>✅ التحقق من صحة البريد</p>
            <p>✅ رسالة تأكيد</p>
            <p>✅ رابط Firebase</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 أدوات الاختبار:</h3>
        <div className="space-y-2">
          <a href="/setup-admin.html" className="block text-blue-600 underline">إعداد الأدمن (localStorage)</a>
          <a href="/reset-admin-password.html" className="block text-blue-600 underline">إعادة تعيين كلمة مرور الأدمن</a>
          <a href="/storage-viewer" className="block text-blue-600 underline">عارض البيانات المحلية</a>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a href="/" className="text-gray-600 hover:text-blue-600 underline">العودة للصفحة الرئيسية</a>
      </div>
    </div>
  );
}