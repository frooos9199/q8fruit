"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // التحقق من البيانات
    if (!user.name.trim() || !user.phone.trim() || !user.email.trim() || !user.password.trim()) {
      setError("يرجى تعبئة جميع الحقول");
      setLoading(false);
      return;
    }

    if (user.name.trim().length < 2) {
      setError("الاسم يجب أن يكون حرفين على الأقل");
      setLoading(false);
      return;
    }

    try {
      await registerUser({
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        password: user.password,
        phone: user.phone.trim()
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || "حدث خطأ أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-blue-900">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">تم التسجيل بنجاح!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">سيتم توجيهك لصفحة تسجيل الدخول...</p>
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-blue-900 p-4">
      <form onSubmit={handleSubmit} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* زر إغلاق */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="absolute left-4 top-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none transition-colors"
          aria-label="إغلاق"
        >
          &times;
        </button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            تسجيل حساب جديد
          </h1>
          <p className="text-gray-600 dark:text-gray-300">انضم إلى فكهاني الكويت</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">الاسم الكامل</label>
            <input 
              type="text" 
              className="w-full rounded-xl p-3 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-green-500 focus:outline-none transition-colors" 
              value={user.name} 
              onChange={e => setUser({ ...user, name: e.target.value })} 
              required 
              disabled={loading}
              placeholder="أدخل اسمك الكامل"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">رقم الهاتف</label>
            <input 
              type="tel" 
              className="w-full rounded-xl p-3 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-green-500 focus:outline-none transition-colors" 
              value={user.phone} 
              onChange={e => setUser({ ...user, phone: e.target.value.replace(/\D/g, '') })} 
              required 
              disabled={loading}
              placeholder="12345678"
              maxLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">8 أرقام فقط</p>
          </div>
          
          <div>
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">البريد الإلكتروني</label>
            <input 
              type="email" 
              className="w-full rounded-xl p-3 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-green-500 focus:outline-none transition-colors" 
              value={user.email} 
              onChange={e => setUser({ ...user, email: e.target.value })} 
              required 
              disabled={loading}
              placeholder="example@email.com"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">كلمة المرور</label>
            <input 
              type="password" 
              className="w-full rounded-xl p-3 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-green-500 focus:outline-none transition-colors" 
              value={user.password} 
              onChange={e => setUser({ ...user, password: e.target.value })} 
              required 
              disabled={loading}
              placeholder="6 أحرف على الأقل"
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">يجب أن تكون 6 أحرف على الأقل</p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري التسجيل...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              تسجيل الحساب
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            لديك حساب بالفعل؟{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-green-600 hover:text-blue-600 font-bold hover:underline transition-colors"
              disabled={loading}
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
