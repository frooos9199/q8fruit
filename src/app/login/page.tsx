"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, resetPassword } from "../../lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, profile } = await loginUser(email.trim().toLowerCase(), password);
      
      // حفظ بيانات المستخدم محلياً للتوافق مع الكود الحالي
      if (typeof window !== "undefined") {
        window.localStorage.setItem("isAdmin", profile.role === "admin" ? "true" : "false");
        window.localStorage.setItem("currentUser", JSON.stringify({
          uid: profile.uid,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role === "admin" ? "مدير" : "عميل"
        }));
      }
      
      // توجيه المستخدم
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await resetPassword(email.trim().toLowerCase());
      setResetSuccess(true);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || "حدث خطأ أثناء إرسال رابط الاستعادة");
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fffdf6] via-[#f7fbf7] to-[#eef7f2] p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/80 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-blue-600 mb-2">تم إرسال الرابط!</h2>
          <p className="mb-6 text-slate-600">تحقق من بريدك الإلكتروني لاستعادة كلمة المرور</p>
          <button
            onClick={() => {
              setResetSuccess(false);
              setResetMode(false);
            }}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-2.5 font-semibold text-white transition-all hover:from-emerald-700 hover:to-teal-600"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fffdf6] via-[#f7fbf7] to-[#eef7f2] p-4">
      <form onSubmit={resetMode ? handlePasswordReset : handleSubmit} className="relative w-full max-w-md rounded-2xl border border-white/80 bg-white/92 p-8 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
        {/* زر إغلاق */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="absolute left-4 top-4 text-2xl font-bold text-slate-400 transition-colors hover:text-red-500 focus:outline-none"
          aria-label="إغلاق"
        >
          &times;
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {resetMode ? "استعادة كلمة المرور" : "تسجيل الدخول"}
          </h2>
          <p className="text-slate-600">
            {resetMode ? "أدخل بريدك الإلكتروني لاستعادة كلمة المرور" : "أهلاً بك في فكهاني الكويت"}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-semibold text-slate-700">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none"
              required
              disabled={loading}
              placeholder="example@email.com"
            />
          </div>
          
          {!resetMode && (
            <div>
              <label className="mb-2 block font-semibold text-slate-700">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 pr-12 text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none"
                  required
                  disabled={loading}
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-500 transition-colors hover:text-emerald-600 focus:outline-none"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:from-emerald-700 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-500"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {resetMode ? "جاري الإرسال..." : "جاري تسجيل الدخول..."}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={resetMode ? "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" : "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"} />
              </svg>
              {resetMode ? "إرسال رابط الاستعادة" : "تسجيل الدخول"}
            </>
          )}
        </button>

        <div className="mt-6 text-center space-y-3">
          {!resetMode ? (
            <>
              <button
                type="button"
                onClick={() => setResetMode(true)}
                className="text-blue-600 hover:text-green-600 font-semibold hover:underline transition-colors"
                disabled={loading}
              >
                نسيت كلمة المرور؟
              </button>
              <p className="text-slate-600">
                ليس لديك حساب؟{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-green-600 hover:text-blue-600 font-bold hover:underline transition-colors"
                  disabled={loading}
                >
                  سجل الآن
                </button>
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setResetMode(false);
                setError("");
              }}
              className="font-semibold text-slate-600 transition-colors hover:text-emerald-600 hover:underline"
              disabled={loading}
            >
              العودة لتسجيل الدخول
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
